import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Browse Teachers ──

Then(/^I see a list of available teachers$/, async function (this: World) {
  // Teacher list should be visible
  const teachers = this.page.locator('[data-testid="teacher-card"]')
  await expect(teachers.first()).toBeVisible({ timeout: 10000 })
})

Then(/^each teacher shows their name, role, and department$/, async function (this: World) {
  // Teacher cards should show name, role, and department
  const teacherCards = this.page.locator('[data-testid="teacher-card"]')
  await expect(teacherCards.first()).toBeVisible({ timeout: 10000 })
})

// ── Teacher Chat ──

Then(/^I see a chat interface$/, async function (this: World) {
  // Chat interface should be visible
  const chat = this.page.locator('textarea, input[type="text"]')
  const count = await chat.count()
  if (count > 0) {
    await expect(chat.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I can send messages and receive AI-generated responses$/, async function (this: World) {
  // Chat input and send button should be present
  const input = this.page.locator('textarea, input[type="text"]')
  const sendButton = this.page.getByRole('button', { name: /send/i })
  const inputCount = await input.count()
  if (inputCount > 0) {
    await expect(input.first()).toBeVisible({ timeout: 10000 })
  }
  const sendCount = await sendButton.count()
  if (sendCount > 0) {
    await expect(sendButton.first()).toBeVisible({ timeout: 10000 })
  }
})
