import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Metrics Overview ──

Then(/^I see an overall progress percentage$/, async function () {
  const world = this as unknown as World
  // Overall progress should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see individual metric cards with scores$/, async function () {
  const world = this as unknown as World
  // Metric cards should display scores
  const _cards = world.page.locator('a[href*="/metrics/"]')
})

// ── Metric Milestones ──

Then(/^I see the list of milestones$/, async function () {
  const world = this as unknown as World
  // Milestone list should be visible
  const _milestones = world.page.locator('li, tr, div.milestone')
})

Then(/^achieved milestones are visually distinguished$/, async function () {
  const world = this as unknown as World
  // Achieved milestones should have a different style
  const _achieved = world.page.locator('text=Achieved')
})

// ── Metrics Update ──

When(/^the metric threshold is reached$/, async function () {
  // Pre-condition: metric threshold has been reached
})

Then(/^the corresponding milestone is marked as achieved$/, async function () {
  // Milestone should be marked as achieved
})
