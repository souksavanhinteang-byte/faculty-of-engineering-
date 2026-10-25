// Read-only editorial helper. It never adds remote content to the application automatically.
import { chromium } from '@playwright/test'

const urls = process.argv.slice(2)
if (!urls.length || urls.some((url) => new URL(url).hostname !== 'fe-nuol.edu.la')) {
  throw new Error('Provide one or more URLs on the official fe-nuol.edu.la website.')
}
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await context.request.get(url, { timeout: 25_000 })
      return {
        url,
        resolvedUrl: response.url(),
        status: response.status(),
        html: await response.text(),
      }
    }),
  )
  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    if (result.status === 'rejected') {
      console.log(JSON.stringify({ url: urls[index], error: String(result.reason) }))
      continue
    }
    const { html, ...meta } = result.value
    const content = await page.evaluate((source) => {
      const document = new DOMParser().parseFromString(source, 'text/html')
      const entry = document.querySelector('.entry-content') || document.querySelector('article')
      entry?.querySelectorAll('script, style').forEach((node) => node.remove())
      return {
        title: document.querySelector('h1')?.textContent?.trim(),
        text: entry?.textContent?.replace(/\s+/g, ' ').trim(),
        links: [...(entry?.querySelectorAll('a') || [])].map((a) => ({
          text: a.textContent?.trim(),
          href: a.getAttribute('href'),
        })),
        translations: [...document.querySelectorAll('.lang-item a')].map((a) => ({
          text: a.textContent?.trim(),
          href: a.getAttribute('href'),
        })),
        dates: [
          ...document.querySelectorAll(
            'time, meta[property*="published"], meta[property*="modified"]',
          ),
        ].map((node) => ({
          content: node.getAttribute('datetime') || node.getAttribute('content'),
          text: node.textContent?.trim(),
        })),
        email: [...document.querySelectorAll('a[href^="mailto:"], [data-cfemail]')].map((node) => ({
          text: node.textContent?.trim(),
          href: node.getAttribute('href'),
          encoded: node.getAttribute('data-cfemail'),
        })),
      }
    }, html)
    console.log(JSON.stringify({ ...meta, ...content }))
  }
} finally {
  await browser.close()
}
