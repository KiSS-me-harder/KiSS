import type { Page } from 'playwright-core'
import { url, waitForHydration } from '@nuxt/test-utils/e2e'

/**
 * Navigates to the given relative path (resolved via the Nuxt test `url()` helper)
 * and waits for Nuxt hydration to complete using `waitForHydration` from
 * `@nuxt/test-utils/e2e`, ensuring all components are rendered before proceeding.
 *
 * @param page - The Playwright Page instance.
 * @param path - The relative URL path to navigate to (e.g. `'/profile'`).
 * @param options - Optional configuration object.
 * @param options.timeout - Timeout in milliseconds for waiting (default: 15000).
 * @param options.setAgeCookie - Whether to set the age-verification cookie to bypass the age gate modal (default: true).
 */
export async function navigateAndWait(
  page: Page,
  path: string,
  options: { timeout?: number, setAgeCookie?: boolean } = {}
) {
  const { setAgeCookie = true } = options

  if (setAgeCookie) {
    await page.context().addCookies([{
      name: 'age-verification',
      value: 'yes',
      domain: '127.0.0.1',
      path: '/'
    }])
  }

  const targetUrl = url(path)
  await page.goto(targetUrl)
  await waitForHydration(page, targetUrl)
}
