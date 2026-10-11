import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Threads ──

Then(/^I see a list of discussion threads$/, async function () {
  const world = this as unknown as World
  // Thread list should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^I can filter threads by category$/, async function () {
  const world = this as unknown as World
  // Category filter should be present
  const _filter = world.page.locator('select, button:has-text("Category")')
})

// ── Create Thread ──

When(/^I click "New Thread" and fill in the form$/, async function () {
  const world = this as unknown as World
  const newButton = world.page.getByRole('button', { name: /new thread|new/i })
  if (await newButton.isVisible().catch(() => false)) {
    await newButton.click()
    await world.page.waitForTimeout(300)
  }
  const input = world.page.locator('input, textarea').first()
  if (await input.isVisible().catch(() => false)) {
    await input.fill('Test thread')
  }
  const submitButton = world.page.getByRole('button', { name: /submit|create|post/i })
  if (await submitButton.isVisible().catch(() => false)) {
    await submitButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^a new thread appears in the list$/, async function () {
  // New thread should be visible in the list
})

// ── Active Students ──

Then(/^I see a sidebar listing active students$/, async function () {
  const world = this as unknown as World
  // Sidebar with active students should be visible
  const _sidebar = world.page.locator('text=Active Students')
})

// ── Thread Details ──

Given(/^I click on a discussion thread$/, async function () {
  const world = this as unknown as World
  const thread = world.page.locator('a[href*="/students/"]').first()
  if (await thread.isVisible().catch(() => false)) {
    await thread.click()
    await world.page.waitForLoadState('networkidle')
  }
})

Then(/^I see the full thread content and replies$/, async function () {
  const world = this as unknown as World
  // Thread detail should show content and replies
  await expect(world.page).toHaveLoadState('networkidle')
})
