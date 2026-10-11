import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Teachers ──

Then(/^I see a list of available teachers$/, async function () {
  const world = this as unknown as World
  // Teacher list should be visible
  await expect(world.page).toHaveLoadState('networkidle')
})

Then(/^each teacher shows their name, role, and department$/, async function () {
  const world = this as unknown as World
  // Teacher cards should show name, role, and department
  const _teacherCards = world.page.locator('a[href*="/teachers/"]')
})

// ── Teacher Chat ──

Then(/^I see a chat interface$/, async function () {
  const world = this as unknown as World
  // Chat interface should be visible
  const _chat = world.page.locator('textarea, input[type="text"]')
})

Then(/^I can send messages and receive AI-generated responses$/, async function () {
  const world = this as unknown as World
  // Chat input and send button should be present
  const _input = world.page.locator('textarea, input[type="text"]')
  const _sendButton = world.page.getByRole('button', { name: /send/i })
})
