// Read-only live link audit. Run with Node 24+ (native TypeScript type stripping).
import { request } from '@playwright/test'
import { facultySources } from '../src/faculty-content.ts'

const urls = [
  ...new Set(Object.values(facultySources).flatMap((source) => Object.values(source.urls))),
]
const context = await request.newContext()
const results = []
let cursor = 0
try {
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < urls.length) {
        const url = urls[cursor++]
        try {
          const response = await context.get(url, { timeout: 20_000 })
          results.push({ url, status: response.status(), destination: response.url() })
        } catch (error) {
          results.push({ url, error: String(error) })
        }
      }
    }),
  )
  const failed = results.filter((result) => result.status !== 200)
  console.log(
    JSON.stringify(
      {
        checkedOn: new Date().toISOString(),
        checked: results.length,
        successful: results.length - failed.length,
        failed,
      },
      null,
      2,
    ),
  )
  if (failed.length) process.exitCode = 1
} finally {
  await context.dispose()
}
