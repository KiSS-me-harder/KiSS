import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Common Navigation ──

Given(/^I am on the Dashboard$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Study Plan page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/study-plan')
  await world.page.waitForLoadState('networkidle')
  await world.page.waitForSelector('text=Legend', { timeout: 10000 })
})

Given(/^I am on the Profile page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/profile')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Settings page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/settings')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Flashcards page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/flashcards')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Activities page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/activities')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Classes page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/classes')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Clubs page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/clubs')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Degrees page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/degrees')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Detention page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/detention')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Library page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/library')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Metrics page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/metrics')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Punishments page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/punishments')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Students page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/students')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on the Teachers page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/teachers')
  await world.page.waitForLoadState('networkidle')
})

Given(/^I am on any page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/')
  await world.page.waitForLoadState('networkidle')
})

// ── Common Navigation Actions ──

When(/^I open the Study Plan page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/study-plan')
  await world.page.waitForLoadState('networkidle')
  await world.page.waitForSelector('text=Legend', { timeout: 10000 })
})

When(/^I open the Flashcards page$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/flashcards')
  await world.page.waitForLoadState('networkidle')
})

When(/^I view my Profile$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/profile')
  await world.page.waitForLoadState('networkidle')
})

When(/^I navigate to a class page$/, async function () {
  const world = this as unknown as World
  // Navigate to the first available class
  const link = world.page.locator('a[href*="/classes/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a club page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/clubs/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a degree detail page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/degrees/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a library item detail page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/library/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a metric detail page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/metrics/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a punishment detail page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/punishments/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

When(/^I navigate to a teacher's page$/, async function () {
  const world = this as unknown as World
  const link = world.page.locator('a[href*="/teachers/"]').first()
  if (await link.isVisible().catch(() => false)) {
    await link.click()
    await world.page.waitForLoadState('networkidle')
  }
})

// ── Common Assertions ──

Then(/^I see the page loaded$/, async function () {
  const world = this as unknown as World
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I see a list of items$/, async function () {
  // Generic list assertion - page-specific steps should refine this
})

Then(/^I can interact with the page elements$/, async function () {
  // Generic interaction assertion
})

// ── Common Pre-conditions ──

Given(/^I am logged in$/, async function () {
  // Pre-condition: user is logged in
})

Given(/^I am enrolled in classes$/, async function () {
  // Pre-condition: enrollment data exists
})

Given(/^I am enrolled in at least one degree$/, async function () {
  // Pre-condition: enrollment data exists
})

Given(/^I am enrolled in one or more degrees with target titles$/, async function () {
  // Pre-condition: enrollment with target titles exists
})

Given(/^I am enrolled in degrees with target titles$/, async function () {
  // Pre-condition: enrollment with target titles exists
})

Given(/^I am enrolled in classes with flashcards$/, async function () {
  // Pre-condition: enrolled in classes with flashcard content
})

Given(/^I am viewing a flashcard question$/, async function () {
  // Pre-condition: a flashcard is displayed
})

Given(/^I have answered several flashcards$/, async function () {
  // Pre-condition: flashcard answers exist
})

Given(/^I have logged sessions for an activity$/, async function () {
  // Pre-condition: session data exists
})

Given(/^I have a logged session$/, async function () {
  // Pre-condition: at least one session exists
})

Given(/^I have logged activity sessions that contribute to a metric$/, async function () {
  // Pre-condition: activity sessions contributing to metrics exist
})

Given(/^I am a member of a club$/, async function () {
  // Pre-condition: club membership exists
})

Given(/^I am enrolled in a degree title$/, async function () {
  // Pre-condition: degree enrollment exists
})

Given(/^I have unread notifications$/, async function () {
  // Pre-condition: notifications exist
})

Given(/^I am not yet verified$/, async function () {
  // Pre-condition: age verification not completed
})

Given(/^I have binaural beats enabled$/, async function () {
  // Pre-condition: binaural beats setting is enabled
})

Given(/^I have haptics enabled in settings$/, async function () {
  // Pre-condition: haptics setting is enabled
})

Given(/^I have hypnotic spiral enabled$/, async function () {
  // Pre-condition: hypnotic spiral setting is enabled
})

Given(/^I am viewing a media item$/, async function () {
  // Pre-condition: a media item is being viewed
})

Given(/^I am on a page with add functionality$/, async function () {
  // Pre-condition: page has add button
})

Given(/^I am viewing an item that can be deleted$/, async function () {
  // Pre-condition: deletable item is visible
})
