import { test, expect, type Page } from '@playwright/test'

async function english(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.evaluate(() => document.fonts.ready)
}

async function revealPage(page: Page) {
  await page.evaluate(async () => {
    const saved = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'
    for (let position = 0; position < document.body.scrollHeight; position += 550) {
      window.scrollTo(0, position)
      await new Promise((resolve) => setTimeout(resolve, 85))
    }
    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = saved
  })
  await page.waitForTimeout(900)
}

test('desktop visual review in Lao and English, with no runtime errors', async ({ page }) => {
  // Vite preview does not serve Vercel's injected endpoint; keep local QA deterministic.
  await page.route('**/_vercel/speed-insights/script.js', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  )
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || /removed|deprecated/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'lo')
  await expect(page.locator('.scene canvas')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await revealPage(page)
  await page.screenshot({ path: 'test-results/desktop-lao.png', fullPage: true })
  await page.screenshot({ path: 'test-results/hero-lao.png' })
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/desktop-english.png', fullPage: true })
  await page.screenshot({ path: 'test-results/hero-english.png' })
  await expect(page.locator('h1')).toContainText('Ideas today.')
  const brokenImages = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
    )
  expect(brokenImages).toEqual([])
  expect(errors).toEqual([])
})

test('language choice persists after reloading', async ({ page }) => {
  await english(page)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('h1')).toContainText('Impact tomorrow')
  await page.getByRole('button', { name: 'ລາວ', exact: true }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'lo')
})

test('all ten department tabs show their own content and support keyboard navigation', async ({
  page,
}) => {
  await english(page)
  const tabs = page.getByRole('tab')
  await expect(tabs).toHaveCount(10)
  for (let index = 0; index < 10; index++) {
    const tab = tabs.nth(index)
    const name = await tab.locator('.department-name').innerText()
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#department-panel h3')).toHaveText(name)
  }
  await tabs.nth(9).press('Home')
  await expect(tabs.nth(0)).toBeFocused()
  await tabs.nth(0).press('ArrowDown')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.nth(1)).toBeFocused()
  await tabs.nth(1).press('End')
  await expect(tabs.nth(9)).toBeFocused()
})

test('gallery supports next, previous, keyboard, Escape, backdrop and focus restoration', async ({
  page,
}) => {
  await english(page)
  const trigger = page.locator('.student-photo button').first()
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.locator('.gallery-count')).toHaveText('01 / 03')
  await page.getByRole('button', { name: 'Next photo', exact: true }).click()
  await expect(page.locator('.gallery-count')).toHaveText('02 / 03')
  await page.getByRole('button', { name: 'Previous photo', exact: true }).click()
  await expect(page.locator('.gallery-count')).toHaveText('01 / 03')
  await dialog.press('ArrowLeft')
  await expect(page.locator('.gallery-count')).toHaveText('03 / 03')
  await dialog.press('ArrowRight')
  await expect(page.locator('.gallery-count')).toHaveText('01 / 03')
  await expect(dialog.locator('img')).toHaveAttribute('src', '/picture/pic-2.jpg')
  await expect(dialog.locator('img')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: 'test-results/gallery.png' })
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.mouse.click(6, 6)
  await expect(dialog).not.toBeVisible()
  await trigger.click()
  await page.getByRole('button', { name: 'Close image', exact: true }).click()
  await expect(dialog).not.toBeVisible()
})

test('3D model responds to explode, assembly, drag and reset', async ({ page }) => {
  await english(page)
  const canvas = page.locator('.scene canvas')
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(400)
  const original = await canvas.screenshot()
  const explode = page.getByTestId('explode-model')
  await explode.click()
  await expect(explode).toHaveAttribute('aria-pressed', 'true')
  await expect(explode).toHaveText('Assemble')
  await page.waitForTimeout(700)
  const expanded = await canvas.screenshot()
  expect(original.equals(expanded)).toBe(false)
  await page.screenshot({ path: 'test-results/model-exploded.png' })
  await page.getByRole('button', { name: 'Reset view', exact: true }).click()
  await expect(explode).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(800)
  const position = await canvas.boundingBox()
  if (!position) throw new Error('Canvas has no bounding box')
  await page.mouse.move(position.x + position.width / 2, position.y + position.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    position.x + position.width / 2 + 90,
    position.y + position.height / 2 + 15,
    { steps: 12 },
  )
  await page.mouse.up()
  await page.waitForTimeout(600)
  const rotated = await canvas.screenshot()
  expect(original.equals(rotated)).toBe(false)
  await page.locator('.scene').focus()
  await page.locator('.scene').press('ArrowRight')
  await page.waitForTimeout(200)
  expect(rotated.equals(await canvas.screenshot())).toBe(false)
  await page.getByRole('button', { name: 'Reset view', exact: true }).click()
})

test('navigation and calls to action reach the correct sections', async ({ page }) => {
  await english(page)
  await page.locator('.hero-actions .button').click()
  await expect(page).toHaveURL(/#departments$/)
  await page.waitForTimeout(700)
  await expect(page.locator('.main-navigation a[href="#departments"]')).toHaveClass(/is-active/)
  await page.locator('.main-navigation a[href="#life"]').click()
  await expect(page).toHaveURL(/#life$/)
  await page.locator('.back-to-top').click()
  await expect(page).toHaveURL(/#home$/)
  const invalid = await page
    .locator('a')
    .evaluateAll((links) =>
      links
        .filter((link) => !link.getAttribute('href') || link.getAttribute('href') === '#')
        .map((link) => link.outerHTML),
    )
  expect(invalid).toEqual([])
})

test('mobile menu, responsive layout and gallery work at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await english(page)
  await expect(page.locator('.menu-button')).toBeVisible()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await expect(page.locator('.main-navigation')).toBeVisible()
  await page.locator('.main-navigation a[href="#departments"]').click()
  await expect(page.locator('.main-navigation')).not.toBeVisible()
  await expect(page).toHaveURL(/#departments$/)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.main-navigation')).not.toBeVisible()
  await page.getByLabel('Select a department to view a concise overview.').selectOption('6')
  await expect(page.locator('#department-panel h3')).toHaveText('Mechanical Engineering')
  await page.getByLabel('Select a department to view a concise overview.').selectOption('0')
  await revealPage(page)
  await page.screenshot({ path: 'test-results/mobile-english.png', fullPage: true })
  await page.screenshot({ path: 'test-results/mobile-hero.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.locator('.student-photo button').last().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'ລາວ', exact: true }).click()
  await revealPage(page)
  await page.screenshot({ path: 'test-results/mobile-lao.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('tablet and small phone layouts have no horizontal overflow', async ({ page }) => {
  await english(page)
  for (const language of ['EN', 'ລາວ']) {
    await page.getByRole('button', { name: language, exact: true }).click()
    for (const width of [320, 375, 640, 768, 820, 1024, 1280, 1920]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.waitForTimeout(120)
      const overflow = await page.evaluate(() => ({
        viewport: window.innerWidth,
        page: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll('h1, h2, .header-inner, .hero-actions')]
          .filter((element) => element.getBoundingClientRect().right > window.innerWidth)
          .map((element) => element.className || element.tagName),
      }))
      expect(
        overflow.page,
        `${language} overflow at ${width}: ${JSON.stringify(overflow)}`,
      ).toBeLessThanOrEqual(width)
    }
  }
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.setViewportSize({ width: 820, height: 1180 })
  await revealPage(page)
  await page.screenshot({ path: 'test-results/tablet.png', fullPage: true })
})

test('reduced motion displays content and keeps model interactions available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await english(page)
  await expect(page.locator('h1')).toBeVisible()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  )
  await expect(page.locator('.reading-progress')).not.toBeVisible()
  await page.getByRole('button', { name: 'Enable 3D', exact: true }).click()
  await expect(page.locator('.scene canvas')).toBeVisible()
  await page.getByTestId('explode-model').click()
  await expect(page.getByTestId('explode-model')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.hero-actions .button').click()
  await expect(page.locator('#department-panel h3')).toBeVisible()
})
