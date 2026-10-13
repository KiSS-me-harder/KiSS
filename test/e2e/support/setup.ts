import { fileURLToPath } from 'node:url'
import { After, Before, Status, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { World } from './world.ts'
import {
  captureBrowserDiagnostics,
  type BrowserDiagnostics
} from './diagnostics'
import { navigateAndWait } from '../utils/navigation'

setWorldConstructor(World)
setDefaultTimeout(15_000)

const diagnostics = new WeakMap<World, BrowserDiagnostics>()

await setup({
  runner: 'cucumber',
  server: true,
  browser: true,
  dev: true,
  host: process.env.NUXT_TEST_HOST ?? 'http://127.0.0.1:3000',
  rootDir: fileURLToPath(new URL('../../../..', import.meta.url)),
  browserOptions: {
    type: 'chromium'
  }
})

Before({ timeout: 30_000 }, async function (this: World, { pickle }) {
  // Determine if this is an AgeVerificationModal test before creating the page
  // Check the feature file path as well as the scenario name, because scenarios
  // like "Verified user does not see the modal" don't contain "Age Verification" in the name
  const isAgeModalTest = pickle.name.includes('Age Verification')
    || pickle.name.includes('Verified user')
    || pickle.tags.some(t => t.name === '@age-modal')
    || (pickle.uri || '').includes('AgeVerification')

  // Set up age verification cookie injection BEFORE creating the page
  // so the initial SSR request includes the cookie
  this.page = await createPage('/')
  await this.page.setViewportSize({ width: 1920, height: 1080 })

  if (!isAgeModalTest) {
    // Intercept all requests to inject the age verification cookie header
    // so Nuxt SSR sees it on every server-rendered request
    await this.page.route('**/*', async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          cookie: `${route.request().headers().cookie || ''}; age-verification=yes`.replace(/^; +/, '').replace(/^;$/, '')
        }
      })
    })
    // Also set the cookie on the browser context so the initial page load has it
    await this.page.context().addCookies([{
      name: 'age-verification',
      value: 'yes',
      domain: '127.0.0.1',
      path: '/'
    }])
    // Reload the page now that the cookie is set, so SSR renders with age verified
    await this.page.reload()
    // Wait for the age modal to be hidden — use getComputedStyle because v-show uses display:none
    await this.page.waitForFunction(() => {
      const modal = document.querySelector('.fixed.inset-0.bg-black')
      if (!modal) return true
      const style = window.getComputedStyle(modal)
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0'
    })
  }
  // Navigate to home page with hydration wait
  await navigateAndWait(this.page, '/', { setAgeCookie: !isAgeModalTest })
  diagnostics.set(this, captureBrowserDiagnostics(
    this.page,
    pickle.id,
    pickle.name
  ))
})

After(async function (this: World, { result }) {
  const report = diagnostics.get(this)
  if (!report) return

  try {
    const status = result?.status === Status.FAILED ? 'failure' : 'success'
    try {
      await report.screenshot(status)
    } catch (error) {
      console.warn('Failed to capture screenshot:', error)
    }
  } finally {
    await report.close()
    diagnostics.delete(this)
  }
  await this.page?.close().catch(() => {})
})
