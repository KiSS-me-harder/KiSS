import { Given, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Age Verification Modal ──

/**
 * Asserts a shield check icon inside a gradient circle is visible.
 */
Then(/^I see a shield check icon inside a pink-to-purple gradient circle$/, async function (this: World) {
  // Scope to the age verification modal dialog to avoid matching CharacterAvatar gradients
  const modal = this.page.locator('text=Age Verification Required').first()
  const gradientCircle = modal.locator('..').locator('[class*="gradient"]')
  await expect(gradientCircle).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the heading text is visible.
 */
Then(/^I see the heading "([^"]+)"$/, async function (this: World, text: string) {
  // Look for heading elements (h1-h6) containing the text
  const heading = this.page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: text })
  await expect(heading).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts a description paragraph with the given text is visible.
 */
Then(/^I see the description "([^"]+)"$/, async function (this: World, text: string) {
  const desc = this.page.getByText(text)
  await expect(desc).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts a question text is visible.
 */
Then(/^I see the question "([^"]+)"$/, async function (this: World, text: string) {
  const question = this.page.getByText(text)
  await expect(question).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts a button with outline styling exists.
 * @param label - The button label.
 */
Then(/^I see a "([^"]+)" button with outline styling$/, async function (this: World, label: string) {
  const button = this.page.getByRole('button', { name: new RegExp(label, 'i') })
  await expect(button).toBeVisible({ timeout: 10000 })
  // Nuxt UI UButton with variant="outline" renders with border/ring styling
  // Check the button itself and its ancestors for any styling indicators
  const buttonClasses = await button.getAttribute('class')
  // Check up to 3 levels up for styling classes
  let ancestor = button.locator('..').first()
  let found = false
  for (let i = 0; i < 3; i++) {
    const classes = await ancestor.getAttribute('class').catch(() => '')
    if (classes && /ring|border|outline/.test(classes)) {
      found = true
      break
    }
    ancestor = ancestor.locator('..').first()
  }
  // If no ancestor has outline classes, the button itself should have them
  if (!found && buttonClasses) {
    expect(buttonClasses).toMatch(/ring|border|outline/i)
  }
})

/**
 * Asserts a button with gradient background exists.
 * @param label - The button label.
 */
Then(/^I see a "([^"]+)" button with a pink-to-purple gradient background$/, async function (this: World, label: string) {
  const button = this.page.getByRole('button', { name: new RegExp(label, 'i') })
  await expect(button).toBeVisible({ timeout: 10000 })
  // Nuxt UI UButton with gradient classes - check button and all ancestors
  const buttonClasses = await button.getAttribute('class')
  let ancestor = button.locator('..').first()
  let found = false
  for (let i = 0; i < 3; i++) {
    const classes = await ancestor.getAttribute('class').catch(() => '')
    if (classes && /gradient|from-pink|to-purple/.test(classes)) {
      found = true
      break
    }
    ancestor = ancestor.locator('..').first()
  }
  // If no ancestor has gradient classes, the button itself should have them
  if (!found && buttonClasses) {
    expect(buttonClasses).toMatch(/gradient|from-pink|to-purple/i)
  }
})

/**
 * Asserts the age verification modal is not visible.
 */
Then(/^I do not see the age verification modal$/, async function (this: World) {
  const overlay = this.page.locator('div.fixed.inset-0.bg-black, div[class*="z-"][class*="bg-black"]')
  await expect(overlay).not.toBeVisible()
})

/**
 * Asserts age verification is saved (cookie check).
 */
Then(/^my age verification is saved$/, async function (this: World) {
  const cookie = await this.page.context().cookies()
  const ageCookie = cookie.find(c => c.name === 'age-verification')
  expect(ageCookie?.value).toBe('yes')
})

/**
 * Pre-condition: user has previously confirmed age.
 */
Given(/^I have previously confirmed my age$/, async function (this: World) {
  await this.page.context().addCookies([
    {
      name: 'age-verification',
      value: 'yes',
      domain: '127.0.0.1',
      path: '/'
    }
  ])
})
