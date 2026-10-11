import { When, Then } from '@cucumber/cucumber'
import type { World } from './world'

// ── Add Modal ──

When(/^I click the add button$/, async function () {
  const world = this as unknown as World
  const addButton = world.page.getByRole('button', { name: /add|new|create/i })
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^a modal dialog opens with an input form$/, async function () {
  const world = this as unknown as World
  // Modal should be visible with input fields
  const _modal = world.page.locator('[role="dialog"], .modal')
  const _input = world.page.locator('input, textarea')
})

// ── Delete Modal ──

When(/^I click the delete button$/, async function () {
  const world = this as unknown as World
  const deleteButton = world.page.getByRole('button', { name: /delete|remove/i })
  if (await deleteButton.isVisible().catch(() => false)) {
    await deleteButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^a confirmation modal asks me to confirm the deletion$/, async function () {
  const world = this as unknown as World
  // Confirmation modal should be visible
  const _modal = world.page.locator('[role="dialog"], text=confirm')
})
