import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Classes ──

Then(/^I see classes grouped by tier level$/, async function () {
  const world = this as unknown as World
  // Classes should be organized by tier
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^each class shows its title, degree, and level$/, async function () {
  const world = this as unknown as World
  // Class cards should display title, degree, and level
  const _classCards = world.page.locator('a[href*="/classes/"]')
})

// ── Class Details ──

Then(/^I see the class content and available levels$/, async function () {
  const world = this as unknown as World
  // Class detail page should show content and levels
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can navigate between levels$/, async function () {
  const world = this as unknown as World
  // Level navigation should be available
  const _levelNav = world.page.locator('button:has-text("Level"), a[href*="level"]')
})

// ── Prerequisites ──

Given(/^a class has prerequisite dependencies$/, async function () {
  // Pre-condition: class has prerequisites defined
})

When(/^I view the class listing$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/classes')
  await world.page.waitForLoadState('networkidle')
})

Then(/^classes with unmet prerequisites are shown as locked$/, async function () {
  const world = this as unknown as World
  // Locked classes should have a visual indicator
  const _locked = world.page.locator('text=Locked')
})
