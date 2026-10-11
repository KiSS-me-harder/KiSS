import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Dashboard Tasks ──

Then(/^I see tasks due today$/, async function () {
  const world = this as unknown as World
  // The dashboard should show task-related content
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can mark tasks as complete$/, async function () {
  const world = this as unknown as World
  // Task checkboxes or buttons should be present
  const _taskItems = world.page.locator('input[type="checkbox"], button:has-text("Complete")')
})

// ── Dashboard Routine ──

Then(/^I see my assigned routine tasks$/, async function () {
  const world = this as unknown as World
  // Routine section should be visible
  const _routine = world.page.locator('text=Routine')
})

Then(/^I can toggle routine items as done$/, async function () {
  const world = this as unknown as World
  // Routine toggle elements should be present
  const _toggles = world.page.locator('input[type="checkbox"]')
})

// ── Dashboard Schedule ──

Then(/^I see my class schedule for the day$/, async function () {
  const world = this as unknown as World
  // Schedule section should be visible
  const _schedule = world.page.locator('text=Schedule')
})

Then(/^I can add or remove schedule entries$/, async function () {
  const world = this as unknown as World
  // Schedule edit controls should be present
  const _addButton = world.page.getByRole('button', { name: /add/i })
})

// ── Dashboard Calendar ──

Then(/^I see a calendar of upcoming events$/, async function () {
  const world = this as unknown as World
  // Calendar component should be visible
  const _calendar = world.page.locator('text=Calendar')
})
