import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('accessibility audit of desktop, mobile and open gallery', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.evaluate(() => document.fonts.ready)
  for (const state of ['desktop', 'mobile', 'gallery']) {
    if (state === 'mobile') {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.getByRole('button', { name: 'ລາວ', exact: true }).click()
    }
    if (state === 'gallery') await page.locator('.student-photo button').first().click()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      result.violations.map((violation) => ({
        id: violation.id,
        description: violation.description,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      state,
    ).toEqual([])
  }
})

test('WebGL fallback retains the illustration and model controls', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
      apply(target, context, args) {
        if (typeof args[0] === 'string' && args[0].startsWith('webgl')) return null
        return Reflect.apply(target, context, args)
      },
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.getByRole('button', { name: 'Enable 3D', exact: true }).click()
  await expect(page.locator('.scene-fallback svg')).toBeVisible()
  await page.getByTestId('explode-model').click()
  await expect(page.getByTestId('explode-model')).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Reset view', exact: true }).click()
  await expect(page.getByTestId('explode-model')).toHaveAttribute('aria-pressed', 'false')
})
