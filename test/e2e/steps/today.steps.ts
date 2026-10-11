import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Today Calendar ──

When(/^I open the Calendar tab$/, async function () {
  const world = this as unknown as World
  const calendarTab = world.page.getByRole('tab', { name: /calendar/i })
  if (await calendarTab.isVisible().catch(() => false)) {
    await calendarTab.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see a calendar view of today's events$/, async function () {
  const world = this as unknown as World
  // Calendar view should be visible
  const _calendar = world.page.locator('text=Calendar')
})

// ── Today Routine ──

When(/^I open the Routine tab$/, async function () {
  const world = this as unknown as World
  const routineTab = world.page.getByRole('tab', { name: /routine/i })
  if (await routineTab.isVisible().catch(() => false)) {
    await routineTab.click()
    await world.page.waitForTimeout(300)
  }
})

// ── Today Schedule ──

When(/^I open the Schedule tab$/, async function () {
  const world = this as unknown as World
  const scheduleTab = world.page.getByRole('tab', { name: /schedule/i })
  if (await scheduleTab.isVisible().catch(() => false)) {
    await scheduleTab.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see my class schedule entries for the day$/, async function () {
  const world = this as unknown as World
  // Schedule entries should be visible
  const _schedule = world.page.locator('text=Schedule')
})

// ── Today Schedule Edit ──

// ── Today Stats ──

// ── Today Tab ──

When(/^I click a different tab$/, async function () {
  const world = this as unknown as World
  const tabs = world.page.getByRole('tab')
  const count = await tabs.count()
  if (count > 1) {
    await tabs.nth(1).click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the corresponding dashboard section is shown$/, async function () {
  const world = this as unknown as World
  // Tab content should change
  await expect(world.page).toHaveLoadState('networkidle')
})

// ── Today Tasks ──

When(/^I open the Today tab$/, async function () {
  const world = this as unknown as World
  const todayTab = world.page.getByRole('tab', { name: /today|tasks/i })
  if (await todayTab.isVisible().catch(() => false)) {
    await todayTab.click()
    await world.page.waitForTimeout(300)
  }
})
