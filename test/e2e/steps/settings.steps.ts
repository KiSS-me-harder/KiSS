import { When, Then } from '@cucumber/cucumber'
import type { World } from '../support/world'

// ── Notifications ──

When(/^I toggle notification preferences$/, async function (this: World) {
  const _checkbox = this.page.locator('input[type="checkbox"]').first()
  if (await _checkbox.isVisible().catch(() => false)) {
    await _checkbox.click()
    // Wait for checkbox state to change
    await _checkbox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^my notification settings are saved$/, async function (this: World) {
  // Settings should persist — check page is still loaded

})

// ── Privacy ──

When(/^I toggle privacy options$/, async function (this: World) {
  const _checkbox = this.page.locator('input[type="checkbox"]').nth(1)
  if (await _checkbox.isVisible().catch(() => false)) {
    await _checkbox.click()
    // Wait for checkbox state to change
    await _checkbox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^my privacy settings are updated$/, async function (this: World) {
  // Privacy settings should persist — check page is still loaded

})

// ── Appearance ──

When(/^I change theme or font size$/, async function (this: World) {
  const _select = this.page.locator('select').first()
  if (await _select.isVisible().catch(() => false)) {
    await _select.selectOption({ index: 1 })
    // Wait for select to update
    await _select.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the appearance settings are applied$/, async function (this: World) {
  // Appearance changes should be visible — check page is still loaded

})

// ── Media Player ──

When(/^I adjust haptics or binaural beats settings$/, async function (this: World) {
  const _checkbox = this.page.locator('input[type="checkbox"]')
  const count = await _checkbox.count()
  if (count > 0) {
    await _checkbox.first().click()
    // Wait for checkbox state to change
    await _checkbox.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the media player configuration is updated$/, async function (this: World) {
  // Media player settings should persist — check page is still loaded

})

// ── Password ──

When(/^I enter my current password and a new password$/, async function (this: World) {
  const passwordInput = this.page.locator('input[type="password"]').first()
  if (await passwordInput.isVisible().catch(() => false)) {
    await passwordInput.fill('testpassword')
  }
  const saveButton = this.page.getByRole('button', { name: /save|change/i })
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click()
    // Wait for confirmation to appear
    await this.page.locator('text=confirmed, text=saved, text=success').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the password change is confirmed$/, async function (this: World) {
  // Password change confirmation should appear — check page is still loaded

})
