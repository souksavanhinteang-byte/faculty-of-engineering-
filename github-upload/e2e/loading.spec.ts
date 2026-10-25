import { test, expect } from '@playwright/test'

test.describe('progressive scene on touch devices', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('starts with SVG, loads no Three.js until requested, and keeps vertical swipes', async ({
    page,
    context,
  }) => {
    const scripts: string[] = []
    const errors: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url())
    })
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.locator('.scene-static-art svg')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    await page.waitForTimeout(1600)
    expect(scripts.filter((url) => /EngineeringScene|three-core|three-renderer/.test(url))).toEqual(
      [],
    )
    await expect(page.locator('canvas')).toHaveCount(0)
    for (const language of ['EN', 'ລາວ']) {
      await page.getByRole('button', { name: language, exact: true }).click()
      await expect(
        page.getByRole('button', {
          name: language === 'EN' ? 'Enable 3D' : 'ເປີດ 3D',
          exact: true,
        }),
      ).toBeVisible()
    }
    await page.getByRole('button', { name: 'ເປີດ 3D', exact: true }).click()
    const canvas = page.locator('.scene canvas')
    await expect(canvas).toBeVisible()
    await expect(page.locator('.scene-wrap[data-render-quality="mobile"]')).toBeVisible()
    await expect(page.locator('.scene')).toHaveCSS('touch-action', 'pan-y')
    await expect(canvas).toHaveCSS('touch-action', 'pan-y')
    await expect(page.locator('.scene')).toBeFocused()
    const assembledImage = await canvas.screenshot()
    await page.getByTestId('explode-model').click()
    await expect(page.getByTestId('explode-model')).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(async () => assembledImage.equals(await canvas.screenshot())).toBe(false)
    await page.getByRole('button', { name: 'ຕັ້ງມຸມໃໝ່', exact: true }).click()
    await expect(page.getByTestId('explode-model')).toHaveAttribute('aria-pressed', 'false')

    await canvas.scrollIntoViewIfNeeded()
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas bounds missing')
    const client = await context.newCDPSession(page)
    // Exercise real touch input: a single horizontal finger must move the model.
    const initialView = await canvas.screenshot()
    const fingerX = box.x + box.width * 0.3
    const fingerY = box.y + box.height * 0.5
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x: fingerX, y: fingerY }],
    })
    for (let step = 1; step <= 8; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: [{ x: fingerX + step * 12, y: fingerY }],
      })
      await page.waitForTimeout(20)
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(async () => initialView.equals(await canvas.screenshot())).toBe(false)
    const before = await page.evaluate(() => scrollY)
    const x = box.x + box.width / 2
    const start = Math.min(box.y + box.height * 0.75, 740)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y: start }],
    })
    for (let step = 1; step <= 8; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: start - step * 22 }],
      })
      await page.waitForTimeout(20)
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 40)
    await page.getByRole('button', { name: 'ກັບໄປພາບ 2D', exact: true }).click()
    await expect(canvas).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'ເປີດ 3D', exact: true })).toBeFocused()
    expect(errors).toEqual([])
  })

  test('blocked 3D download never hides hero, SVG, or navigation', async ({ page }) => {
    await page.route(/EngineeringScene.*\.js/, (route) => route.abort('failed'))
    await page.goto('/')
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await page.getByRole('button', { name: 'Enable 3D', exact: true }).click()
    await expect(page.locator('.scene-static-controls [role="status"]')).toContainText(
      'could not load',
    )
    await expect(page.locator('.scene-static-art svg')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    await page.locator('.hero-actions .button').click()
    await expect(page).toHaveURL(/#departments$/)
    await expect(page.locator('#department-panel h3')).toBeVisible()
  })

  test('all mobile anchors clear the header in both languages as deferred sections expand', async ({
    page,
  }) => {
    await page.goto('/')
    for (const language of ['EN', 'ລາວ']) {
      await page.getByRole('button', { name: language, exact: true }).click()
      for (const id of ['about', 'departments', 'learning', 'life', 'contact']) {
        await page.locator('.menu-button').click()
        await page.locator(`.main-navigation a[href="#${id}"]`).click()
        await expect(page).toHaveURL(new RegExp(`#${id}$`))
        await expect
          .poll(async () =>
            page.locator(`#${id}`).evaluate((element) => {
              const top = element.getBoundingClientRect().top
              const headerBottom = document.querySelector('header')!.getBoundingClientRect().bottom
              return top >= headerBottom - 1 && top < headerBottom + 80
            }),
          )
          .toBe(true)
      }
    }
  })
})

test('initial text is not opacity-gated and font failure leaves navigation usable', async ({
  page,
}) => {
  await page.route(/\.woff2$/, (route) => route.abort('failed'))
  await page.goto('/')
  for (const language of ['EN', 'ລາວ']) {
    await page.getByRole('button', { name: language, exact: true }).click()
    for (const selector of ['h1', '.hero-description', '.hero-actions', '.site-header']) {
      await expect(page.locator(selector)).toBeVisible()
      const opacities = await page.locator(selector).evaluate((element) => {
        const values = []
        for (let node: Element | null = element; node; node = node.parentElement)
          values.push(getComputedStyle(node).opacity)
        return values
      })
      expect(opacities.every((opacity) => opacity === '1')).toBe(true)
    }
    await page.locator('.main-navigation a[href="#about"]').click()
    await expect(page).toHaveURL(/#about$/)
    await page.locator('.brand').first().click()
  }
})

test('idle page has bounded resize work and WebGL stops rendering offscreen', async ({ page }) => {
  await page.addInitScript(() => {
    const counts = ((
      window as Window & { __renderCounts?: { resize: number; draws: number } }
    ).__renderCounts = { resize: 0, draws: 0 })
    addEventListener('resize', () => counts.resize++)
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const draw = prototype.drawElements
      prototype.drawElements = function (...args) {
        counts.draws++
        return draw.apply(this, args)
      }
    }
  })
  await page.goto('/')
  await expect(page.locator('.scene canvas')).toBeVisible()
  await page.waitForTimeout(1600)
  const read = () =>
    page.evaluate(
      () =>
        (window as Window & { __renderCounts?: { resize: number; draws: number } }).__renderCounts!,
    )
  const settled = await read()
  await page.waitForTimeout(500)
  expect((await read()).draws - settled.draws).toBeLessThan(3)
  await page.locator('#learning').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const offscreen = await read()
  await page.waitForTimeout(500)
  expect((await read()).draws).toBe(offscreen.draws)
  expect((await read()).resize).toBeLessThan(12)
  await page.locator('.campus-photo').scrollIntoViewIfNeeded()
  const campus = page.locator('.campus-photo img')
  await expect
    .poll(() =>
      campus.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth),
    )
    .toBe(810)
  expect(await campus.evaluate((element: HTMLImageElement) => element.currentSrc)).toMatch(
    /pic-1\.webp$/,
  )
})
