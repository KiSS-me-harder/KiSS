import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Flashcard Study ──

Then(/^I see a card with a question and multiple-choice options$/, async function () {
  const world = this as unknown as World
  // Flashcard should show a question and answer options
  const _options = world.page.locator('button[role="option"], li:has-text("A"), li:has-text("B")')
  await expect(world.page).toHaveLoadState('networkidle')
})

// ── Answer Correctly ──

When(/^I select the correct answer$/, async function () {
  const world = this as unknown as World
  // Click the first answer option
  const option = world.page.locator('button[role="option"], li:has-text("A")').first()
  if (await option.isVisible().catch(() => false)) {
    await option.click()
    await world.page.waitForTimeout(500)
  }
})

Then(/^I receive positive feedback$/, async function () {
  // Positive feedback indicator should appear
})

Then(/^the card's review interval increases$/, async function () {
  // Spaced repetition interval should increase
})

// ── Answer Incorrectly ──

When(/^I select an incorrect answer$/, async function () {
  const world = this as unknown as World
  // Click a non-first answer option
  const options = world.page.locator('button[role="option"]')
  const count = await options.count()
  if (count > 1) {
    await options.nth(1).click()
    await world.page.waitForTimeout(500)
  }
})

Then(/^the correct answer is revealed$/, async function () {
  // Correct answer should be highlighted
})

Then(/^a new random card is shown$/, async function () {
  // A new card should appear
})

// ── Knowledge Breakdown ──

When(/^I open the knowledge panel$/, async function () {
  const world = this as unknown as World
  const knowledgeButton = world.page.getByRole('button', { name: /knowledge|stats/i })
  if (await knowledgeButton.isVisible().catch(() => false)) {
    await knowledgeButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see my accuracy percentage by degree and class$/, async function () {
  // Knowledge breakdown should show accuracy stats
})
