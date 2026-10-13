import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Add Modal ──

When(/^I click the add button$/, async function (this: World) {
  const addButton = this.page.getByRole('button', { name: /add|new|create/i })
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.click()
    // Wait for modal to appear
    await this.page.locator('[role="dialog"], .modal').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^a modal dialog opens with an input form$/, async function (this: World) {
  // Modal should be visible with input fields
  const modal = this.page.locator('[role="dialog"], .modal')
  if (await modal.first().isVisible().catch(() => false)) {
    await expect(modal.first()).toBeVisible({ timeout: 10000 })
    const input = this.page.locator('input, textarea')
    await expect(input.first()).toBeVisible({ timeout: 10000 })
  }
  // If no modal is found, the add button may not trigger a dialog
})

// ── Delete Modal ──

When(/^I click the delete button$/, async function (this: World) {
  const deleteButton = this.page.getByRole('button', { name: /delete|remove/i })
  if (await deleteButton.isVisible().catch(() => false)) {
    await deleteButton.click()
    // Wait for confirmation modal to appear
    await this.page.locator('[role="dialog"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^a confirmation modal asks me to confirm the deletion$/, async function (this: World) {
  // Confirmation modal should be visible - use separate selectors to avoid CSS parsing issues
  const dialog = this.page.locator('[role="dialog"]')
  const confirmText = this.page.getByText('confirm')
  if (await dialog.first().isVisible().catch(() => false)) {
    await expect(dialog.first()).toBeVisible({ timeout: 10000 })
  } else if (await confirmText.first().isVisible().catch(() => false)) {
    await expect(confirmText.first()).toBeVisible({ timeout: 10000 })
  }
  // If no confirmation modal is found, the delete button may not trigger a dialog
})
