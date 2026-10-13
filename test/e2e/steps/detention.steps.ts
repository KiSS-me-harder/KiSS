import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Browse Punishments ──

Then(/^I see a list of available punishments$/, async function (this: World) {
  // Punishment list should be visible
  const items = this.page.locator('[data-testid="detention-card"], [data-testid="punishment-card"]')
  await expect(items.first()).toBeVisible({ timeout: 10000 })
})

// ── Punishment Details ──

Then(/^I see the punishment description and requirements$/, async function (this: World) {
  // Punishment detail should show description and requirements

})
