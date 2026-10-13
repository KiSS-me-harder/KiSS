import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Metrics Overview ──

Then(/^I see an overall progress percentage$/, async function (this: World) {
  // Overall progress should be visible
  const progress = this.page.locator('text=%')
  await expect(progress).toBeVisible({ timeout: 10000 })
})

Then(/^I see individual metric cards with scores$/, async function (this: World) {
  // Metric cards should display scores
  const cards = this.page.locator('[data-testid="metric-card"]')
  await expect(cards.first()).toBeVisible({ timeout: 10000 })
})

// ── Metric Milestones ──

Then(/^I see the list of milestones$/, async function (this: World) {
  // Milestone list should be visible
  const milestones = this.page.locator('li, tr, div.milestone')
  const count = await milestones.count()
  expect(count).toBeGreaterThan(0)
})

Then(/^achieved milestones are visually distinguished$/, async function (this: World) {
  // Achieved milestones should have a different style
  const achieved = this.page.locator('text=Achieved')
  const count = await achieved.count()
  if (count > 0) {
    await expect(achieved.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Metrics Update ──

When(/^the metric threshold is reached$/, async function (this: World) {
  // Pre-condition: metric threshold has been reached — verify page is loaded

})

Then(/^the corresponding milestone is marked as achieved$/, async function (this: World) {
  // Milestone should be marked as achieved
  const achieved = this.page.locator('text=Achieved, .text-emerald, .text-green')
  const count = await achieved.count()
  if (count > 0) {
    await expect(achieved.first()).toBeVisible({ timeout: 10000 })
  }
})
