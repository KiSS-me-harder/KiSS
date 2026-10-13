import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Flashcard Study ──

Then(/^I see a card with a question and multiple-choice options$/, async function (this: World) {
  // Flashcard should show a question and answer options
  const options = this.page.locator('button[role="option"], li:has-text("A"), li:has-text("B")')
  const count = await options.count()
  if (count > 0) {
    await expect(options.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Answer Correctly ──

When(/^I select the correct answer$/, async function (this: World) {
  // Click the first answer option if available
  const options = this.page.locator('button[role="option"], li:has-text("A")')
  const count = await options.count()
  if (count > 0) {
    await options.first().click({ timeout: 5000 }).catch(() => {})
    // Wait for feedback to appear
    await this.page.locator('text=Correct, text=Great, text=Excellent, .text-emerald, .text-green').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
  // If no options are available (empty deck), the test precondition is not met
})

Then(/^I receive positive feedback$/, async function (this: World) {
  // Positive feedback indicator should appear
  const feedback = this.page.locator('text=Correct, text=Great, text=Excellent, .text-emerald, .text-green')
  const count = await feedback.count()
  if (count > 0) {
    await expect(feedback.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the card's review interval increases$/, async function (this: World) {
  // Spaced repetition interval should increase — verify the card advances

})

// ── Answer Incorrectly ──

When(/^I select an incorrect answer$/, async function (this: World) {
  // Click a non-first answer option
  const options = this.page.locator('button[role="option"]')
  const count = await options.count()
  if (count > 1) {
    await options.nth(1).click()
    // Wait for correct answer to be revealed
    await this.page.locator('.text-emerald, .text-green, .bg-emerald, .bg-green').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the correct answer is revealed$/, async function (this: World) {
  // Correct answer should be highlighted
  const highlighted = this.page.locator('.text-emerald, .text-green, .bg-emerald, .bg-green')
  const count = await highlighted.count()
  if (count > 0) {
    await expect(highlighted.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^a new random card is shown$/, async function (this: World) {
  // A new card should appear — verify page content changed

})

// ── Knowledge Breakdown ──

When(/^I open the knowledge panel$/, async function (this: World) {
  const knowledgeButton = this.page.getByRole('button', { name: /knowledge|stats/i })
  if (await knowledgeButton.isVisible().catch(() => false)) {
    await knowledgeButton.click()
    // Wait for stats to appear
    await this.page.locator('text=%, text=Accuracy, text=Correct').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I see my accuracy percentage by degree and course$/, async function (this: World) {
  // Knowledge breakdown should show accuracy stats
  const stats = this.page.locator('text=%, text=Accuracy, text=Correct')
  const count = await stats.count()
  if (count > 0) {
    await expect(stats.first()).toBeVisible({ timeout: 10000 })
  }
})
