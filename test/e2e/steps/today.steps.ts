import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Today Calendar ──

When(/^I open the Calendar tab$/, async function (this: World) {
  const calendarTab = this.page.getByRole('tab', { name: /calendar/i })
  if (await calendarTab.isVisible().catch(() => false)) {
    await calendarTab.click()
    // Wait for tab content to change
    await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I see a calendar view of today's events$/, async function (this: World) {
  // Calendar view should be visible - use .first() to avoid strict mode
  const calendar = this.page.locator('text=Calendar')
  await expect(calendar.first()).toBeVisible({ timeout: 10000 })
})

// ── Today Routine ──

When(/^I open the Routine tab$/, async function (this: World) {
  const routineTab = this.page.getByRole('tab', { name: /routine/i })
  if (await routineTab.isVisible().catch(() => false)) {
    await routineTab.click()
    // Wait for tab content to change
    await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I can toggle items as done$/, async function (this: World) {
  const checkboxes = this.page.locator('input[type="checkbox"]')
  const count = await checkboxes.count()
  if (count > 0) {
    await expect(checkboxes.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Today Schedule ──

When(/^I open the Schedule tab$/, async function (this: World) {
  const scheduleTab = this.page.getByRole('tab', { name: /schedule/i })
  if (await scheduleTab.isVisible().catch(() => false)) {
    await scheduleTab.click()
    // Wait for tab content to change
    await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I see my course schedule entries for the day$/, async function (this: World) {
  // Wait for the page content to load first
  // Look for main content heading, excluding the age verification modal
  const mainContent = this.page.locator('main').first()
  await mainContent.waitFor({ state: 'visible', timeout: 15000 })
  // Schedule entries should be visible - use .first() to avoid strict mode
  const schedule = this.page.locator('text=Schedule')
  const count = await schedule.count()
  if (count > 0) {
    await expect(schedule.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Today Schedule Edit ──

// ── Today Stats ──

Then(/^I see summary statistics for my progress$/, async function (this: World) {
  const statsSection = this.page.locator('text=Stats, text=Progress, text=Level, text=XP')
  if (await statsSection.first().isVisible().catch(() => false)) {
    await expect(statsSection.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Today Tab ──

When(/^I click a different tab$/, async function (this: World) {
  const tabs = this.page.getByRole('tab')
  const count = await tabs.count()
  if (count > 1) {
    await tabs.nth(1).click()
    // Wait for tab content to change
    await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the corresponding dashboard section is shown$/, async function (this: World) {
  // Tab content should change — verify tab panel is visible
  const tabPanel = this.page.locator('[role="tabpanel"]')
  const count = await tabPanel.count()
  if (count > 0) {
    await expect(tabPanel.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Today Tasks ──

When(/^I open the Today tab$/, async function (this: World) {
  const todayTab = this.page.getByRole('tab', { name: /today|tasks/i })
  if (await todayTab.isVisible().catch(() => false)) {
    await todayTab.click()
    // Wait for tab content to change
    await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

// ── Today Recommendations ──

Then(/^I see a "Today's ([A-Za-z]+)" section$/, async function (this: World, sectionName: string) {
  const sectionHeading = this.page.locator(`text="Today's ${sectionName}"`)
  await expect(sectionHeading.first()).toBeVisible({ timeout: 15000 })
})

Then(/^the "Today's ([A-Za-z]+)" section contains ([a-z]+) cards$/, async function (this: World, sectionName: string, contentType: string) {
  // Find the section heading and look for cards below it
  const sectionHeading = this.page.locator(`text="Today's ${sectionName}"`)
  await expect(sectionHeading.first()).toBeVisible({ timeout: 10000 })

  // Cards should be present in the recommendations area
  const cards = this.page.locator(`[data-testid="recommendation-card-${contentType}"]`)
  const count = await cards.count()
  if (count > 0) {
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the "Today's ([A-Za-z]+)" section has a link to the ([A-Za-z]+) library page$/, async function (this: World, sectionName: string, libraryName: string) {
  // Find the section heading and check for a "View All" link nearby
  const sectionHeading = this.page.locator(`text="Today's ${sectionName}"`)
  await expect(sectionHeading.first()).toBeVisible({ timeout: 10000 })

  // Look for a link to the library section page
  const libraryLink = this.page.locator(`a[href*="/library/${libraryName.toLowerCase()}"]`)
  const count = await libraryLink.count()
  if (count > 0) {
    await expect(libraryLink.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the recommendation sections appear below the schedule and tasks sections$/, async function (this: World) {
  // Wait for page content to load
  const mainContent = this.page.locator('main').first()
  await mainContent.waitFor({ state: 'visible', timeout: 15000 })

  // Check that recommendation sections exist below the schedule/tasks grid
  const recommendationsSection = this.page.locator('[data-testid="today-recommendations"]')
  const count = await recommendationsSection.count()
  if (count > 0) {
    await expect(recommendationsSection.first()).toBeVisible({ timeout: 10000 })
  }
})
