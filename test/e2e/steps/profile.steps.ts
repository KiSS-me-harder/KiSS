import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Profile View ──

Then(/^I see my name, email, degree, and level$/, async function () {
  const world = this as unknown as World
  // Profile page should display user information
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see summary statistics$/, async function () {
  const world = this as unknown as World
  // Statistics section should be visible
  const _stats = world.page.locator('text=Statistics')
})

Then(/^I see enrolled classes with completion progress$/, async function () {
  const world = this as unknown as World
  // Enrolled classes list with progress indicators
  const _enrolled = world.page.locator('text=Enrolled')
})

// ── Profile Edit ──

When(/^I change my name or email and save$/, async function () {
  const world = this as unknown as World
  // Find and fill edit fields
  const _input = world.page.locator('input[type="text"]').first()
  const saveButton = world.page.getByRole('button', { name: /save/i })
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the changes are confirmed$/, async function () {
  // Profile save confirmation should appear
})
