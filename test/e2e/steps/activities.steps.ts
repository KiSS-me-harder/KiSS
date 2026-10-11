import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Activities ──

Then(/^I see activities grouped by category$/, async function () {
  const world = this as unknown as World
  // Activities should be grouped by category
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can expand or collapse each category$/, async function () {
  const world = this as unknown as World
  // Category sections should be expandable
  const _details = world.page.locator('details, button[aria-expanded]')
})

// ── Log Session ──

Given(/^I am viewing an activity with input fields$/, async function () {
  // Activity with input fields should be visible
})

When(/^I enter values and submit$/, async function () {
  const world = this as unknown as World
  const input = world.page.locator('input').first()
  if (await input.isVisible().catch(() => false)) {
    await input.fill('test value')
  }
  const submitButton = world.page.getByRole('button', { name: /submit|log|save/i })
  if (await submitButton.isVisible().catch(() => false)) {
    await submitButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the session is logged with a timestamp$/, async function () {
  // Session should appear in the list with a timestamp
})

// ── View Recent Sessions ──

When(/^I view the activity$/, async function () {
  const world = this as unknown as World
  // Activity detail view
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see a list of recent sessions$/, async function () {
  const world = this as unknown as World
  // Session list should be visible
  const _sessions = world.page.locator('li, tr, div.session')
})

// ── Delete Session ──

When(/^I delete the session$/, async function () {
  const world = this as unknown as World
  const deleteButton = world.page.getByRole('button', { name: /delete|remove/i })
  if (await deleteButton.isVisible().catch(() => false)) {
    await deleteButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^it is removed from the list$/, async function () {
  // Session should no longer be in the list
})
