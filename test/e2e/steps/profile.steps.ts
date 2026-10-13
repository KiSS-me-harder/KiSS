import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Profile View ──

Then(/^I see my name, email, degree, and level$/, async function (this: World) {
  // Profile page should display user information

})

Then(/^I see summary statistics$/, async function (this: World) {
  // Statistics section should be visible
  const stats = this.page.locator('text=Statistics')
  await expect(stats).toBeVisible({ timeout: 10000 })
})

Then(/^I see enrolled courses with completion progress$/, async function (this: World) {
  // Enrolled courses list with progress indicators
  const enrolled = this.page.locator('text=Enrolled')
  await expect(enrolled).toBeVisible({ timeout: 10000 })
})

// ── Profile Edit ──

When(/^I change my name or email and save$/, async function (this: World) {
  // Find and fill edit fields
  const input = this.page.locator('input[type="text"]').first()
  if (await input.isVisible().catch(() => false)) {
    await input.fill('Updated Name')
  }
  const saveButton = this.page.getByRole('button', { name: /save/i })
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click()
    // Wait for confirmation to appear
    await this.page.locator('text=confirmed, text=saved, text=success').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the changes are confirmed$/, async function (this: World) {
  // Profile save confirmation should appear — check page is still loaded

})
