import { chromium } from '@playwright/test'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://fe-nuol.edu.la/en/contact-us/', {
    waitUntil: 'domcontentloaded',
    timeout: 25_000,
  })
  await page
    .locator('.entry-content a[href^="mailto:"]')
    .waitFor({ timeout: 5_000 })
    .catch(() => {})
  console.log(
    JSON.stringify({
      contact: await page.locator('.entry-content').innerText(),
      emails: await page
        .locator('.entry-content a[href^="mailto:"]')
        .evaluateAll((links) =>
          links.map((link) => ({ text: link.textContent, href: link.getAttribute('href') })),
        ),
    }),
  )
  for (const url of [
    'https://goo.gl/maps/qKb84hSzoYXeKdsC6',
    'https://goo.gl/maps/PkwQzNpgt6p7JLhL9',
  ]) {
    try {
      const response = await context.request.get(url, { timeout: 15_000 })
      const html = await response.text()
      const detail = await page.evaluate((source) => {
        const document = new DOMParser().parseFromString(source, 'text/html')
        return {
          title: document.title,
          description: document
            .querySelector('meta[property="og:description"], meta[name="description"]')
            ?.getAttribute('content'),
          text: document.body.textContent?.replace(/\s+/g, ' ').slice(0, 1000),
        }
      }, html)
      console.log(
        JSON.stringify({ url, status: response.status(), destination: response.url(), ...detail }),
      )
    } catch (error) {
      console.log(JSON.stringify({ url, error: String(error) }))
    }
  }
} finally {
  await browser.close()
}
