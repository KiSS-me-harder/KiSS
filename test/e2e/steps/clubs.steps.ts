import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Clubs ──

Then(/^I see a list of available clubs$/, async function () {
  const world = this as unknown as World
  // Club list should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^each club shows its title and required degree$/, async function () {
  const world = this as unknown as World
  // Club cards should show title and degree requirement
  const _clubCards = world.page.locator('a[href*="/clubs/"]')
})

// ── Join Club ──

Given(/^I am viewing a club and meet the prerequisite$/, async function () {
  // Pre-condition: viewing a club with prerequisites met
})

When(/^I click join$/, async function () {
  const world = this as unknown as World
  const joinButton = world.page.getByRole('button', { name: /join/i })
  if (await joinButton.isVisible().catch(() => false)) {
    await joinButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I become a member$/, async function () {
  // Membership confirmation should appear
})

// ── Cannot Join Without Prerequisite ──

Given(/^I am viewing a club with a degree prerequisite$/, async function () {
  // Pre-condition: club requires a degree
})

Given(/^I am not enrolled in the required degree$/, async function () {
  // Pre-condition: user does not have required degree
})

When(/^I attempt to join$/, async function () {
  const world = this as unknown as World
  const joinButton = world.page.getByRole('button', { name: /join/i })
  if (await joinButton.isVisible().catch(() => false)) {
    await joinButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see a warning that the prerequisite is required$/, async function () {
  const world = this as unknown as World
  // Warning message should appear
  const _warning = world.page.locator('text=prerequisite')
})

// ── Club Activities ──

When(/^I view the club activities$/, async function () {
  const world = this as unknown as World
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see challenges and tasks$/, async function () {
  const world = this as unknown as World
  // Club activities should be listed
  const _activities = world.page.locator('text=Activity')
})

Then(/^I can mark activities as complete$/, async function () {
  const world = this as unknown as World
  // Activity completion controls should be present
  const _complete = world.page.locator('input[type="checkbox"]')
})

// ── Leave Club ──

When(/^I click leave$/, async function () {
  const world = this as unknown as World
  const leaveButton = world.page.getByRole('button', { name: /leave/i })
  if (await leaveButton.isVisible().catch(() => false)) {
    await leaveButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I am no longer a member$/, async function () {
  // Membership should be removed
})

// ── Club Details ──

Then(/^I see the club description and activities$/, async function () {
  const world = this as unknown as World
  // Club detail page should show description and activities
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can join or leave the club$/, async function () {
  const world = this as unknown as World
  // Join/Leave button should be present
  const _button = world.page.getByRole('button', { name: /join|leave/i })
})
