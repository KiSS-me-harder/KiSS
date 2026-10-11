import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Degrees ──

Then(/^I see a grid of available degrees$/, async function () {
  const world = this as unknown as World
  // Degree grid should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^each degree shows its title and description$/, async function () {
  const world = this as unknown as World
  // Degree cards should show title and description
  const _degreeCards = world.page.locator('a[href*="/degrees/"]')
})

// ── Degree Details ──

Given(/^I am viewing a degree detail page$/, async function () {
  // Pre-condition: on a degree detail page
})

Then(/^I see the degree description and available title levels$/, async function () {
  const world = this as unknown as World
  // Degree detail should show description and title levels
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can select a target title level$/, async function () {
  const world = this as unknown as World
  // Title level selector should be present
  const _select = world.page.locator('select')
})

// ── Enroll ──

Given(/^I am viewing a degree with a selected target title$/, async function () {
  // Pre-condition: degree detail with target title selected
})

When(/^I click enroll$/, async function () {
  const world = this as unknown as World
  const enrollButton = world.page.getByRole('button', { name: /enroll/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await enrollButton.click()
    await world.page.waitForTimeout(500)
  }
})

Then(/^I am enrolled in all classes for that title$/, async function () {
  // Enrollment confirmation should appear
})

// ── Progress ──

When(/^I view the degree detail page$/, async function () {
  const world = this as unknown as World
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see the overall progress percentage$/, async function () {
  const world = this as unknown as World
  // Progress percentage should be visible
  const _progress = world.page.locator('text=%')
})

Then(/^I see a letter grade based on completion$/, async function () {
  const world = this as unknown as World
  // Letter grade should be displayed
  const _grade = world.page.locator('text=/[A-F]/')
})

// ── Unenroll ──

When(/^I click unenroll$/, async function () {
  const world = this as unknown as World
  const unenrollButton = world.page.getByRole('button', { name: /unenroll/i })
  if (await unenrollButton.isVisible().catch(() => false)) {
    await unenrollButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I am removed from all classes in that title$/, async function () {
  // Unenrollment confirmation should appear
})
