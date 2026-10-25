import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

// Real Chrome/CDP lab measurements, not a Lighthouse score. Each run has a fresh context.
const options = Object.fromEntries(process.argv.slice(2).map((arg) => arg.split(/=(.*)/s).slice(0, 2)))
const url = options['--url'] || 'http://127.0.0.1:4173/'
const label = options['--label'] || 'local'
const runs = Number(options['--runs'] || 3)
const lang = options['--lang'] || 'lo'
const desktop = options['--desktop'] === 'true'
const output = options['--output'] || `test-results/performance-${label}.json`
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []
try {
  for (let run = 1; run <= runs; run++) {
    const context = await browser.newContext({
      viewport: desktop ? { width: 1440, height: 1000 } : { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: !desktop,
      hasTouch: !desktop,
      serviceWorkers: 'block',
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 200_000,
      uploadThroughput: 93_750,
      connectionType: 'cellular4g',
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await cdp.send('Performance.enable')
    const responses = []
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    cdp.on('Network.responseReceived', ({ response, type }) => {
      responses.push({ url: response.url, type, status: response.status, headers: response.headers })
    })
    await page.addInitScript(({ lang }) => {
      try { localStorage.setItem('nuol-lang', lang) } catch { /* Optional storage. */ }
      const data = window.__loading = {
        longTasks: [], lcp: [], layoutShifts: [], webgl: [], resizeEvents: 0,
        heroVisibleAt: null, headerVisibleAt: null, fallbackAt: null, canvasAt: null,
      }
      for (const [type, key] of [['longtask', 'longTasks'], ['largest-contentful-paint', 'lcp'], ['layout-shift', 'layoutShifts']]) {
        try {
          new PerformanceObserver((list) => {
            data[key].push(...list.getEntries().map((entry) => ({
              start: entry.startTime, duration: entry.duration, size: entry.size,
              value: entry.hadRecentInput ? 0 : entry.value,
              element: entry.element?.tagName + '.' + entry.element?.className,
            })))
          }).observe({ type, buffered: true })
        } catch { /* Older engines might not expose an entry type. */ }
      }
      addEventListener('resize', () => data.resizeEvents++)
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (...args) {
        const start = performance.now()
        const value = getContext.apply(this, args)
        if (String(args[0]).startsWith('webgl')) data.webgl.push({ start, duration: performance.now() - start, success: !!value })
        return value
      }
      function visible(selector) {
        const element = document.querySelector(selector)
        if (!element) return false
        for (let node = element; node; node = node.parentElement) {
          const style = getComputedStyle(node)
          if (Number(style.opacity) < 0.95 || style.visibility === 'hidden' || style.display === 'none') return false
        }
        return element.getBoundingClientRect().height > 0
      }
      function sample() {
        const now = performance.now()
        if (data.headerVisibleAt === null && visible('.site-header')) data.headerVisibleAt = now
        if (data.heroVisibleAt === null && visible('h1')) data.heroVisibleAt = now
        if (data.fallbackAt === null && visible('.scene-fallback svg')) data.fallbackAt = now
        if (data.canvasAt === null && document.querySelector('.scene canvas')) data.canvasAt = now
        if (now < 20_000) requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
      document.fonts.ready.then(() => { data.fontsReadyAt = performance.now() })
    }, { lang })
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
    await page.waitForTimeout(10_000)
    const timing = await page.evaluate(() => ({
      navigation: performance.getEntriesByType('navigation')[0]?.toJSON(),
      paints: performance.getEntriesByType('paint').map((entry) => entry.toJSON()),
      resources: performance.getEntriesByType('resource').map((entry) => entry.toJSON()),
      ...window.__loading,
      fonts: [...document.fonts].filter((font) => font.status === 'loaded').map((font) => ({ family: font.family, display: font.display })),
      sceneReady: document.querySelector('.scene')?.getAttribute('data-model-state'),
    }))
    const { metrics } = await cdp.send('Performance.getMetrics')
    const cpu = Object.fromEntries(metrics.filter(({ name }) => ['ScriptDuration', 'TaskDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount'].includes(name)).map(({ name, value }) => [name, value]))
    const summary = {
      run,
      ttfbMs: timing.navigation.responseStart,
      htmlDownloadMs: timing.navigation.responseEnd - timing.navigation.responseStart,
      domContentLoadedMs: timing.navigation.domContentLoadedEventEnd,
      loadMs: timing.navigation.loadEventEnd,
      fcpMs: timing.paints.find((entry) => entry.name === 'first-contentful-paint')?.startTime,
      lcpMs: timing.lcp.at(-1)?.start,
      lcpElement: timing.lcp.at(-1)?.element,
      headerVisibleMs: timing.headerVisibleAt,
      heroVisibleMs: timing.heroVisibleAt,
      fallbackMs: timing.fallbackAt,
      canvasMs: timing.canvasAt,
      jsEncodedBytes: timing.resources.filter((entry) => entry.initiatorType === 'script' || /\.js($|\?)/.test(entry.name)).reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      jsDecodedBytes: timing.resources.filter((entry) => /\.js($|\?)/.test(entry.name)).reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      fontBytes: timing.resources.filter((entry) => /\.woff2?($|\?)/.test(entry.name)).reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      fontLastResponseMs: Math.max(0, ...timing.resources.filter((entry) => /\.woff2?($|\?)/.test(entry.name)).map((entry) => entry.responseEnd)),
      webglContextMs: timing.webgl.reduce((sum, entry) => sum + entry.duration, 0),
      longTaskCount: timing.longTasks.length,
      observedBlockingMs: timing.longTasks.reduce((sum, entry) => sum + Math.max(0, entry.duration - 50), 0),
      cls: timing.layoutShifts.reduce((sum, entry) => sum + (entry.value || 0), 0),
      resizeEvents: timing.resizeEvents,
      cpu,
      errors,
    }
    results.push({ summary, timing, responses })
    console.log(JSON.stringify({ label, ...summary }))
    if (run === 1) await page.screenshot({ path: `test-results/performance-${label}-${lang}.png` })
    await context.close()
  }
} finally {
  await browser.close()
}
const report = { label, url, lang, measuredAt: new Date().toISOString(), profile: { viewport: desktop ? '1440x1000' : '390x844', latencyMs: 150, downloadBytesPerSecond: 200_000, uploadBytesPerSecond: 93_750, cpuSlowdown: 4, cache: 'disabled', observation: '10 seconds after window.load; no scroll or input', score: 'not a Lighthouse run' }, results }
await mkdir(dirname(output), { recursive: true })
await writeFile(output, JSON.stringify(report, null, 2) + '\n')
console.log(`Saved ${output}`)
