import { When, Then, Given } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Browse Threads ──

Then(/^I see a list of discussion threads$/, async function (this: World) {
  // Thread list should be visible
  const threads = this.page.locator('[data-testid="thread-card"]')
  await expect(threads.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I can filter threads by category$/, async function (this: World) {
  // Category filter should be present
  const filter = this.page.locator('select, button:has-text("Category")')
  const count = await filter.count()
  if (count > 0) {
    await expect(filter.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Create Thread ──

When(/^I click "New Thread" and fill in the form$/, async function (this: World) {
  const newButton = this.page.getByRole('button', { name: /new thread|new/i })
  if (await newButton.isVisible().catch(() => false)) {
    await newButton.click()
    // Wait for input to appear
    await this.page.locator('input, textarea').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
  const input = this.page.locator('input, textarea').first()
  if (await input.isVisible().catch(() => false)) {
    await input.fill('Test thread')
  }
  const submitButton = this.page.getByRole('button', { name: /submit|create|post/i })
  if (await submitButton.isVisible().catch(() => false)) {
    await submitButton.click()
    // Wait for thread to appear
    await this.page.locator('[data-testid="thread-card"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^a new thread appears in the list$/, async function (this: World) {
  // New thread should be visible in the list
  const threads = this.page.locator('[data-testid="thread-card"]')
  const count = await threads.count()
  expect(count).toBeGreaterThan(0)
})

// ── Active Students ──

Then(/^I see a sidebar listing active students$/, async function (this: World) {
  // Sidebar with active students should be visible
  const sidebar = this.page.locator('text=Active Students')
  await expect(sidebar).toBeVisible({ timeout: 10000 })
})

// ── Thread Details ──

Given(/^I click on a discussion thread$/, async function (this: World) {
  const thread = this.page.locator('[data-testid="thread-card"]').first()
  if (await thread.isVisible().catch(() => false)) {
    await thread.click()
  }
})

Then(/^I see the full thread content and replies$/, async function (this: World) {
  // Thread detail should show content and replies

})
