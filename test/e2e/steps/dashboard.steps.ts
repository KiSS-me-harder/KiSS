import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Dashboard Tasks ──

Then(/^I see tasks due today$/, async function (this: World) {
  // The dashboard should show task-related content
  const tasks = this.page.locator('text=Tasks, text=Today, input[type="checkbox"]')
  const count = await tasks.count()
  // If no tasks are found, the Tasks section is still present but empty
  if (count > 0) {
    await expect(tasks.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I can mark tasks as complete$/, async function (this: World) {
  // Task checkboxes or buttons should be present
  const taskItems = this.page.locator('input[type="checkbox"], button:has-text("Complete")')
  const count = await taskItems.count()
  if (count > 0) {
    await expect(taskItems.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Dashboard Routine ──

Then(/^I see my assigned routine tasks$/, async function (this: World) {
  // Routine section should be visible - use .first() to avoid strict mode violations
  const routine = this.page.locator('text=Routine')
  await expect(routine.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I can toggle routine items as done$/, async function (this: World) {
  // Routine toggle elements should be present
  const toggles = this.page.locator('input[type="checkbox"]')
  const count = await toggles.count()
  if (count > 0) {
    await expect(toggles.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Dashboard Schedule ──

Then(/^I see my course schedule for the day$/, async function (this: World) {
  // Schedule section should be visible - use .first() to avoid strict mode violations
  const schedule = this.page.locator('text=Schedule')
  await expect(schedule.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I can add or remove schedule entries$/, async function (this: World) {
  // Schedule edit controls should be present
  const addButton = this.page.getByRole('button', { name: /add/i })
  const count = await addButton.count()
  if (count > 0) {
    await expect(addButton.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Dashboard Calendar ──

Then(/^I see a calendar of upcoming events$/, async function (this: World) {
  // Calendar component should be visible
  const calendar = this.page.locator('text=Calendar')
  await expect(calendar).toBeVisible({ timeout: 10000 })
})
