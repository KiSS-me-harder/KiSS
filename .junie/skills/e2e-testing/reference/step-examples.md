# Step Definition Examples

Common patterns extracted from existing step definitions.

## Navigation Steps (from common.steps.ts)

```ts
import { Given, When } from '@cucumber/cucumber'
import type { World } from './world'

Given(/^I am on the Dashboard$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Study Plan page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/study-plan')
  await world.page.waitForLoadState('networkidle')
  await world.page.waitForSelector('text=Legend', { timeout: 10000 })
})

When(/^I open the Study Plan page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/study-plan')
  await world.page.waitForLoadState('networkidle')
  await world.page.waitForSelector('text=Legend', { timeout: 10000 })
})
```

## Assertion Steps (from dashboard.steps.ts)

```ts
import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

Then(/^I see tasks due today$/, async function () {
  const world = this as unknown as World
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can mark tasks as complete$/, async function () {
  const world = this as unknown as World
  const _taskItems = world.page.locator('input[type="checkbox"], button:has-text("Complete")')
})

Then(/^I see my assigned routine tasks$/, async function () {
  const world = this as unknown as World
  const _routine = world.page.locator('text=Routine')
})
```

## World Class (world.ts)

```ts
import type { Browser, BrowserContext, Page } from '@playwright/test'

export class World {
  browser: Browser
  context: BrowserContext
  page: Page

  constructor() {
    this.browser = null as unknown as Browser
    this.context = null as unknown as BrowserContext
    this.page = null as unknown as Page
  }
}
```

## Hooks (hooks.ts)

```ts
import { After, Before, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { World } from './world'

setWorldConstructor(World)
setDefaultTimeout(15_000)

Before({ timeout: 60_000 }, async function () {
  this.browser = await chromium.launch()
  this.context = await this.browser.newContext({
    baseURL: 'http://localhost:3000/KiSS/'
  })
  this.page = await this.context.newPage()
})

After(async function () {
  await this.context?.close()
  await this.browser?.close()
})
```

## Cucumber Config (cucumber.config.ts)

```ts
export default {
  default: {
    import: ['./test/e2e/tsx-register.js', './test/e2e/steps/**/*.ts'],
    format: ['progress'],
    paths: ['./features/pages/study-plan.feature'],  // Add feature files here
    publishQuiet: true
  }
}
```

## Writing New Step Definitions

1. Import decorators from `@cucumber/cucumber`
2. Import `expect` from `@playwright/test`
3. Import `World` type from `./world`
4. Cast `this` in every step: `const world = this as unknown as World`
5. Use Playwright locators and assertions
6. Place domain-specific steps in `<domain>.steps.ts`
7. Place shared navigation in `common.steps.ts`
