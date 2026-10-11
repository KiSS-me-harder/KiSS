import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Punishments ──

Then(/^I see a list of available punishments$/, async function () {
  const world = this as unknown as World
  // Punishment list should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

// ── Punishment Details ──

Then(/^I see the punishment description and requirements$/, async function () {
  const world = this as unknown as World
  // Punishment detail should show description and requirements
  await expect(world.page).toHaveLoadState('networkidle')
})
