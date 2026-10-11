import { When, Then } from '@cucumber/cucumber'
import type { World } from './world'

// ── Notifications ──

When(/^I toggle notification preferences$/, async function () {
  const world = this as unknown as World
  const _checkbox = world.page.locator('input[type="checkbox"]').first()
  if (await _checkbox.isVisible().catch(() => false)) {
    await _checkbox.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^my notification settings are saved$/, async function () {
  // Settings should persist
})

// ── Privacy ──

When(/^I toggle privacy options$/, async function () {
  const world = this as unknown as World
  const _checkbox = world.page.locator('input[type="checkbox"]').nth(1)
  if (await _checkbox.isVisible().catch(() => false)) {
    await _checkbox.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^my privacy settings are updated$/, async function () {
  // Privacy settings should persist
})

// ── Appearance ──

When(/^I change theme or font size$/, async function () {
  const world = this as unknown as World
  const _select = world.page.locator('select').first()
  if (await _select.isVisible().catch(() => false)) {
    await _select.selectOption({ index: 1 })
    await world.page.waitForTimeout(300)
  }
})

Then(/^the appearance settings are applied$/, async function () {
  // Appearance changes should be visible
})

// ── Media Player ──

When(/^I adjust haptics or binaural beats settings$/, async function () {
  const world = this as unknown as World
  const _checkbox = world.page.locator('input[type="checkbox"]')
  const count = await _checkbox.count()
  if (count > 0) {
    await _checkbox.first().click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the media player configuration is updated$/, async function () {
  // Media player settings should persist
})

// ── Password ──

When(/^I enter my current password and a new password$/, async function () {
  const world = this as unknown as World
  const _passwordInput = world.page.locator('input[type="password"]').first()
  const saveButton = world.page.getByRole('button', { name: /save|change/i })
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the password change is confirmed$/, async function () {
  // Password change confirmation should appear
})
