---
name: e2e-testing
description: Write Cucumber/Playwright E2E tests in `test/e2e/steps/` matching Gherkin feature specs.
---

# E2E Testing

Write Cucumber/Playwright E2E tests in `test/e2e/steps/` matching Gherkin feature specs.

## When to Use

- Writing E2E tests for a new feature after the Gherkin spec exists
- Adding step definitions for new Given/When/Then phrases
- Extending existing step definitions for new pages or components

## Steps

1. **Read the feature file** — `features/pages/<name>.feature` or `features/components/<name>.feature`.
2. **Check existing steps** — Read `test/e2e/steps/common.steps.ts` to reuse navigation steps.
3. **Create or update step file** — `test/e2e/steps/<domain>.steps.ts`.
4. **Write step definitions** — Use `Given`, `When`, `Then` from `@cucumber/cucumber`.
5. **Use the World class** — Cast `this` to `World` for `page`, `context`, `browser` access.
6. **Configure cucumber** — Update `cucumber.config.ts` `paths` to include the feature file.
7. **Run tests** — `pnpm test:e2e` starts dev server and runs Cucumber.

## Step Definition Pattern

```ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

Given(/^I am on the Page Name$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/page-path')
  await world.page.waitForLoadState('networkidle')
})

When(/^I click "Button Text"$/, async function () {
  const world = this as unknown as World
  await world.page.getByRole('button', { name: 'Button Text' }).click()
})

Then(/^I see "Expected Text"$/, async function () {
  const world = this as unknown as World
  await expect(world.page.locator('text=Expected Text')).toBeVisible()
})
```

## Key Conventions

- **Navigation steps** live in `common.steps.ts` — reuse `Given I am on the <Page>` patterns.
- **Domain-specific steps** go in `<domain>.steps.ts` (e.g., `dashboard.steps.ts`, `profile.steps.ts`).
- **World class** provides `page`, `context`, `browser` — set up in `hooks.ts`.
- **Base URL** is `http://localhost:3000/KiSS/` (set in `hooks.ts`).
- **Timeout** is 15 seconds default, 60 seconds for Before hooks.
- **Wait for networkidle** after navigation to ensure hydration completes.
- **Use `waitForSelector`** for critical elements that must appear after hydration.

## Running Tests

```bash
# Full E2E suite (starts dev server + runs Cucumber)
pnpm test:e2e

# Playwright-only (if using Playwright directly)
pnpm test:e2e:playwright
```

## Feature File Organization

- `features/pages/` — Page-level feature specs
- `features/components/` — Component-level feature specs
- Step files mirror the domain: `test/e2e/steps/<domain>.steps.ts`

## Key Rules

- Feature files are the source of truth — steps should match scenarios exactly.
- One artifact per task: write feature → write steps → implement (in separate tasks).
- Use `waitForLoadState('networkidle')` after every navigation.
- Cast `this` to `World` in every step function.
- Import `expect` from `@playwright/test`, not from vitest.

## References

- `reference/step-examples.md` — Common step patterns
- `test/e2e/steps/world.ts` — World class definition
- `test/e2e/steps/hooks.ts` — Browser setup/teardown
- `test/e2e/steps/common.steps.ts` — Shared navigation steps
- `cucumber.config.ts` — Test configuration
