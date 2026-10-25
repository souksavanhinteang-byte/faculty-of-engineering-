import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const application = /\/(?:assets\/main-[^/]+\.js|src\/main\.tsx)(?:\?|$)/

async function holdApplication(page: Page) {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(application, async (route) => {
    await pending
    await route.continue()
  })
  return release
}

async function observeEntrance(page: Page) {
  await page.addInitScript(() => {
    const measurements = { shell: 0, exit: 0, removed: 0, completed: false }
    Object.assign(window, { entranceMeasurements: measurements })
    let sawOverlay = false
    new MutationObserver(() => {
      const overlay = document.getElementById('nuol-entrance')
      if (overlay) sawOverlay = true
      if (!measurements.shell && document.querySelector('#root h1'))
        measurements.shell = performance.now()
      if (!measurements.exit && overlay?.dataset.state === 'exiting') {
        measurements.exit = performance.now()
        measurements.completed =
          document.getElementById('nuol-entrance-number')?.textContent === '100'
      }
      if (sawOverlay && !overlay && !measurements.removed) measurements.removed = performance.now()
    }).observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    })
  })
}

async function timings(page: Page) {
  return page.evaluate(
    () =>
      (
        window as Window & {
          entranceMeasurements: { shell: number; exit: number; removed: number; completed: boolean }
        }
      ).entranceMeasurements,
  )
}

async function expectClean(page: Page) {
  await expect(page.locator('#nuol-entrance')).toHaveCount(0)
  await expect(page.locator('#nuol-entrance-styles')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-nuol-loading')
  await expect(page.locator('#root')).not.toHaveAttribute('inert')
  await expect(page.locator('h1')).toBeVisible()
  expect(await page.evaluate(() => window.__nuolEntrance)).toBeUndefined()
}

for (const width of [1440, 390]) {
  for (const language of ['lo', 'en']) {
    test(`immediate branded shell, ${width}px, ${language}; language/navigation do not replay it`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      await page.addInitScript((lang) => localStorage.setItem('nuol-lang', lang), language)
      const release = await holdApplication(page)
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      const loader = page.locator('#nuol-entrance')
      await expect(loader).toBeVisible()
      await expect(page.locator('#root')).toBeEmpty()
      await expect(loader.getByRole('status')).toHaveCount(1)
      await expect(loader.getByRole('status')).toContainText('ກຳລັງກຽມໜ້າເວັບ')
      await expect(loader.getByRole('status')).toContainText('Preparing your experience')
      await expect(loader.locator('.entrance-counter')).toHaveAttribute('aria-hidden', 'true')
      expect(await loader.evaluate((element) => element.scrollWidth <= innerWidth)).toBe(true)
      await expect(loader.locator('img')).toHaveJSProperty('naturalWidth', 640)
      const logo = await loader.locator('img').boundingBox()
      expect(logo!.width).toBe(logo!.height)
      await page.screenshot({ path: `test-results/entrance-${width}-${language}.png` })
      release()
      await expectClean(page)
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      await page
        .getByRole('button', { name: language === 'en' ? 'ລາວ' : 'EN', exact: true })
        .click()
      await page.locator('.hero-actions .button').click()
      await expect(page).toHaveURL(/#departments$/)
      await expectClean(page)
    })
  }
}

test('fast entrance completes once, reload is prompt, and existing scroll styles survive', async ({
  page,
}) => {
  await observeEntrance(page)
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (!document.documentElement) return
      document.documentElement.style.overflowY = 'scroll'
      observer.disconnect()
    })
    observer.observe(document, { childList: true })
  })
  await page.goto('/')
  await expectClean(page)
  const first = await timings(page)
  expect(first.completed).toBe(true)
  expect(first.exit).toBeGreaterThanOrEqual(590)
  // A busy main thread can deliver the observer after a compositor transition has started.
  expect(first.removed - first.exit).toBeGreaterThan(0)
  expect(first.removed - first.exit).toBeLessThan(650)
  expect(first.exit - first.shell).toBeLessThan(700)
  expect(await page.evaluate(() => sessionStorage.getItem('nuol-entrance-seen'))).toBe('1')
  expect(await page.locator('html').evaluate((element) => element.style.overflowY)).toBe('scroll')
  await page.reload()
  await expectClean(page)
  const repeat = await timings(page)
  expect(repeat.exit).toBe(0)
  expect(Math.abs(repeat.removed - repeat.shell)).toBeLessThan(100)
  expect(await page.locator('html').evaluate((element) => element.style.overflowY)).toBe('scroll')
  console.log('Entrance timings (ms):', { first, repeat })
})

test('slow app replaces percentage at two seconds, offers recovery, then exits without another hold', async ({
  page,
}) => {
  await observeEntrance(page)
  const release = await holdApplication(page)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'waiting', {
    timeout: 3000,
  })
  await expect(page.locator('.entrance-counter')).toBeHidden()
  await expect(page.getByRole('status')).toContainText('Still loading the website')
  await expect(page.locator('.entrance-line')).toHaveCSS('animation-name', 'entrance-wait')
  const audit = await new AxeBuilder({ page })
    .include('#nuol-entrance')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(audit.violations).toEqual([])
  await expect(page.getByRole('button', { name: /Retry/ })).toBeVisible({ timeout: 12000 })
  await expect(page.getByRole('status')).toContainText('longer than usual')
  release()
  await expectClean(page)
  const result = await timings(page)
  expect(Math.abs(result.exit - result.shell)).toBeLessThan(100)
  expect(result.removed - result.shell).toBeLessThan(650)
})

for (const asset of ['index', 'main', 'react', 'css']) {
  test(`failed ${asset} asset shows a keyboard-accessible, working retry`, async ({ page }) => {
    const pattern =
      asset === 'css' ? /\/assets\/main-[^/]+\.css$/ : new RegExp(`/assets/${asset}-[^/]+\\.js$`)
    await page.route(pattern, (route) => route.abort('failed'))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'failed')
    await expect(page.getByRole('status')).toContainText('could not load')
    await expect(page.locator('.entrance-counter')).toBeHidden()
    const retry = page.getByRole('button', { name: /Retry/ })
    await page.keyboard.press('Tab')
    await expect(retry).toBeFocused()
    await page.unroute(pattern)
    await retry.press('Enter')
    await expectClean(page)
  })
}

for (const mode of ['first', 'returning', 'reduced']) {
  test(`initial React render failure remains recoverable for ${mode} visitors`, async ({
    page,
  }) => {
    if (mode === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' })
    if (mode === 'returning')
      await page.addInitScript(() => sessionStorage.setItem('nuol-entrance-seen', '1'))
    await page.addInitScript(() => {
      window.ResizeObserver = class {
        constructor() {
          throw new Error('Simulated initial render failure')
        }
      } as typeof ResizeObserver
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'failed')
    await expect(page.getByRole('button', { name: /Retry/ })).toBeVisible()
  })
}

test('reduced motion reveals on mount without drawing, counter, or slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await observeEntrance(page)
  const release = await holdApplication(page)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.entrance-drawing')).toBeHidden()
  await expect(page.locator('.entrance-counter')).toBeHidden()
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'waiting', {
    timeout: 3000,
  })
  await expect(page.locator('.entrance-line')).toHaveCSS('animation-name', 'none')
  release()
  await expectClean(page)
  const result = await timings(page)
  expect(result.exit).toBe(0)
  expect(Math.abs(result.removed - result.shell)).toBeLessThan(100)
})

test('unavailable storage is harmless and skips the full entrance', async ({ page }) => {
  await observeEntrance(page)
  await page.addInitScript(() => {
    for (const storage of ['sessionStorage', 'localStorage']) {
      Object.defineProperty(window, storage, {
        get() {
          throw new DOMException('Blocked', 'SecurityError')
        },
      })
    }
  })
  await page.goto('/')
  await expectClean(page)
  expect((await timings(page)).exit).toBe(0)
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('fonts, photos and the optional 3D scene never gate the essential page', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(/\.(?:woff2|jpg|webp)$|EngineeringScene.*\.js$/, async (route) => {
    await pending
    await route.abort('failed')
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expectClean(page)
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('h1')).toContainText('Ideas today.')
  release()
})

test('JavaScript disabled leaves useful bilingual links, without an overlay', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173')
  await expect(page.locator('#nuol-entrance')).toBeHidden()
  await expect(page.locator('noscript p[lang="en"]')).toContainText('Please enable JavaScript')
  await expect(page.locator('noscript a')).toHaveCount(2)
  await context.close()
})

test('throttled network stays honest and starts the exit as soon as the shell mounts', async ({
  page,
  context,
}) => {
  await observeEntrance(page)
  const client = await context.newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 180,
    downloadThroughput: 40_000,
    uploadThroughput: 20_000,
  })
  await page.goto('/', { waitUntil: 'commit' })
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'waiting', {
    timeout: 4000,
  })
  await expect(page.locator('.entrance-counter')).toBeHidden()
  await expectClean(page)
  const result = await timings(page)
  expect(result.shell).toBeGreaterThan(2000)
  expect(Math.abs(result.exit - result.shell)).toBeLessThan(100)
  expect(result.removed - result.shell).toBeLessThan(650)
  console.log('Throttled entrance timings (ms):', result)
})

test('the exit leaves hero geometry and keyboard focus unchanged', async ({ page }) => {
  await page.route(/\.woff2$/, (route) => route.abort('failed'))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'exiting')
  await expect(page.locator('#nuol-entrance')).toHaveCSS('transition-duration', '0.48s')
  const before = await page.locator('#home').boundingBox()
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)
  await expectClean(page)
  expect(await page.locator('#home').boundingBox()).toEqual(before)
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
})

test('returning visitors still see slow and failure states and can retry', async ({ page }) => {
  await observeEntrance(page)
  await page.addInitScript(() => sessionStorage.setItem('nuol-entrance-seen', '1'))
  let fail!: () => void
  const pending = new Promise<void>((resolve) => {
    fail = resolve
  })
  await page.route(application, async (route) => {
    await pending
    await route.abort('failed')
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#nuol-entrance')).toBeHidden()
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'waiting', {
    timeout: 3000,
  })
  await expect(page.locator('.entrance-counter')).toBeHidden()
  fail()
  await expect(page.locator('#nuol-entrance')).toHaveAttribute('data-state', 'failed')
  await page.unroute(application)
  await page.getByRole('button', { name: /Retry/ }).click()
  await expectClean(page)
  expect((await timings(page)).exit).toBe(0)
})
