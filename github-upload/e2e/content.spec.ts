import { test, expect } from '@playwright/test'
import {
  departments,
  facultySources,
  facultyContact,
  facultyNews,
  studentResources,
  type SourceId,
} from '../src/faculty-content'

test('verified milestones, dated news and contact details are bilingual', async ({ page }) => {
  await page.goto('/')
  for (const language of ['en', 'lo'] as const) {
    await page.getByRole('button', { name: language === 'en' ? 'EN' : 'ລາວ', exact: true }).click()
    await expect(page.locator('#faculty-history time')).toHaveCount(2)
    await expect(page.locator('#faculty-history time').first()).toHaveText('1995')
    await expect(page.locator('#faculty-history time').last()).toHaveAttribute(
      'datetime',
      '2004-06',
    )
    await expect(page.locator('#faculty-history time').last()).toHaveText(
      language === 'en' ? 'June 2004' : 'ມິຖຸນາ 2004',
    )
    await expect(page.locator('.news-date time')).toHaveAttribute('datetime', '2023-09-20')
    await expect(page.locator('.news-date time')).toHaveText(
      language === 'en' ? '20 September 2023' : '20 ກັນຍາ 2023',
    )
    await expect(page.locator('.news-copy h3 a')).toHaveAttribute(
      'href',
      facultySources.seminar.urls[language],
    )
    await expect(page.locator('.faculty-news h2')).toHaveText(
      language === 'en' ? 'From the Faculty' : 'ຈາກຄະນະ',
    )
    await expect(page.locator('.contact-telephone')).toHaveAttribute('href', 'tel:+85621321072')
    await expect(page.locator('.contact-telephone')).toHaveText('+856 21 321 072')
    await expect(page.locator('.contact-email')).toHaveAttribute(
      'href',
      'mailto:admin_fe@fe-nuol.edu.la',
    )
    await expect(page.locator('.contact-address address')).toHaveText(
      facultyContact.address[language],
    )
    await expect(page.locator('.contact-map')).toHaveAttribute(
      'href',
      'https://goo.gl/maps/qKb84hSzoYXeKdsC6',
    )
    await expect(page.locator('.footer-bottom p')).toContainText(
      language === 'en' ? 'not the official' : 'ບໍ່ແມ່ນເວັບໄຊທ໌ທາງການ',
    )
  }
  await expect(page.getByText('[email protected]', { exact: true })).toHaveCount(0)
})

test('every department opens its actual language page and majors remain inside departments', async ({
  page,
}) => {
  await page.goto('/')
  for (const language of ['en', 'lo'] as const) {
    await page.getByRole('button', { name: language === 'en' ? 'EN' : 'ລາວ', exact: true }).click()
    await expect(page.getByRole('tab')).toHaveCount(10)
    for (const [index, department] of departments.entries()) {
      await page.getByRole('tab').nth(index).click()
      await expect(page.locator('#department-panel h3')).toHaveText(department.name[language])
      await expect(page.locator('#department-panel .text-link')).toHaveAttribute(
        'href',
        facultySources[department.source].urls[language],
      )
      await expect(page.locator('#department-panel .department-majors li')).toHaveCount(
        department.bachelorMajors?.length || 0,
      )
      await expect(page.locator('#department-panel .department-category')).toHaveText(
        department.fieldOverviewOnly
          ? language === 'en'
            ? 'THE FIELD, IN BRIEF'
            : 'ຂົງເຂດນີ້ໂດຍຫຍໍ້'
          : language === 'en'
            ? 'DEPARTMENT OVERVIEW'
            : 'ຮູ້ຈັກພາກວິຊາ',
      )
    }
  }
})

test('student resources, research, source links and original Facebook destinations work', async ({
  page,
}) => {
  await page.goto('/')
  for (const language of ['en', 'lo'] as const) {
    await page.getByRole('button', { name: language === 'en' ? 'EN' : 'ລາວ', exact: true }).click()
    for (const [index, resource] of studentResources.entries()) {
      await expect(
        page.locator('.student-resource').nth(index).locator('a').first(),
      ).toHaveAttribute('href', facultySources[resource.source].urls[language])
    }
    for (const [index, source] of ['facilities', 'research', 'cooperation'].entries()) {
      await expect(
        page.locator('.learning-topic').nth(index).locator('.text-link'),
      ).toHaveAttribute('href', facultySources[source as SourceId].urls[language])
    }
    await expect(page.locator('.life-bottom>a')).toHaveAttribute(
      'href',
      'https://www.facebook.com/share/1DfYeSa4xa/',
    )
    await expect(page.locator('.contact-social')).toHaveAttribute(
      'href',
      'https://www.facebook.com/share/1DfYeSa4xa/',
    )
    const sources = await page
      .locator('.source-link')
      .evaluateAll((links) =>
        links.map((link) => ({ href: link.getAttribute('href'), text: link.textContent })),
      )
    expect(sources.length).toBeGreaterThanOrEqual(12)
    for (const source of sources) {
      expect(source.href).toMatch(/^https:\/\/fe-nuol\.edu\.la\//)
      expect(source.text).toContain(
        language === 'en' ? 'Source: Official faculty website' : 'ແຫຼ່ງຂໍ້ມູນ',
      )
    }
  }
})

test('scroll progress is remeasured after language changes and anchors clear the header', async ({
  page,
}) => {
  await page.goto('/')
  for (const language of ['EN', 'ລາວ']) {
    await page.getByRole('button', { name: language, exact: true }).click()
    await page.evaluate(async () => {
      await document.fonts.ready
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    })
    await expect
      .poll(() =>
        page
          .locator('.reading-progress')
          .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a),
      )
      .toBeGreaterThan(0.98)
    await page.locator('.main-navigation a[href="#learning"]').click()
    await expect(page).toHaveURL(/#learning$/)
    await expect
      .poll(() =>
        page
          .locator('#learning-heading')
          .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      )
      .toBeGreaterThan(90)
    await page.waitForTimeout(500)
    const layout = await page.evaluate(() => ({
      sectionTop: document.getElementById('learning')!.getBoundingClientRect().top,
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
    }))
    expect(layout.sectionTop).toBeGreaterThanOrEqual(layout.headerBottom - 1)
  }
})
