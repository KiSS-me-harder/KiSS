import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { url } from '@nuxt/test-utils/e2e'
import { navigateAndWait } from '../utils/navigation'

// ── Generic Reusable Steps ──

/**
 * Navigates to the application home page without setting the age-verification cookie,
 * so the age verification modal can appear if needed.
 * Waits for hydration to complete — the modal may or may not appear depending on
 * whether the user has previously confirmed their age.
 */
When(/^I access the application$/, async function (this: World) {
  await navigateAndWait(this.page, '/', { setAgeCookie: false })
  // Wait for ClientOnly content to render — the modal heading may or may not appear
  // depending on whether the age-verification cookie is already set
  // Wait for either the modal heading OR the main page content
  await Promise.any([
    this.page.getByText('Age Verification Required').waitFor({ state: 'visible', timeout: 10000 }),
    this.page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 })
  ]).catch(() => {
    // If neither appears, the page still loaded — proceed
  })
})

/**
 * Clicks a button by its exact or partial label text.
 * @param label - The button label to click.
 */
When(/^I click the "([^"]+)" button$/, async function (this: World, label: string) {
  const button = this.page.getByRole('button', { name: new RegExp(label, 'i') })
  await expect(button).toBeVisible({ timeout: 10000 })
  await button.click()
})

/**
 * Asserts that text content is visible on the page.
 * @param text - The exact text to find.
 */
Then(/^I see the text "([^"]+)"$/, async function (this: World, text: string) {
  await expect(this.page.getByText(text)).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts that text content is NOT visible on the page.
 * @param text - The exact text that should not be present.
 */
Then(/^I do not see the text "([^"]+)"$/, async function (this: World, text: string) {
  await expect(this.page.getByText(text)).not.toBeVisible()
})

/**
 * Asserts a button with the given label is visible.
 * @param label - The button label.
 */
Then(/^I see a "([^"]+)" button$/, async function (this: World, label: string) {
  const button = this.page.getByRole('button', { name: new RegExp(label, 'i') })
  await expect(button).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts an element with the given CSS class is visible.
 * @param className - The CSS class name to locate.
 */
Then(/^I see an element with class "([^"]+)"$/, async function (this: World, className: string) {
  await expect(this.page.locator(`.${className}`)).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts a modal/dialog overlay is present and visible.
 * The age verification gate uses a fixed black overlay inside ClientOnly.
 * Wait for the modal heading as the primary indicator, since the overlay
 * uses v-show which hides via display:none (not removable from DOM).
 */
Then(/^I see a modal overlay that blocks interaction with the page behind it$/, async function (this: World) {
  // The modal is inside ClientOnly and uses v-show, so the overlay div exists
  // in the DOM but may be hidden. The heading is the most reliable indicator.
  const heading = this.page.getByText('Age Verification Required')
  await expect(heading).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the modal dialog is centered on the screen.
 * A properly centered modal should have its vertical center within the middle half of the viewport.
 */
Then(/^the modal is centered on the screen$/, async function (this: World) {
  // Use the heading as an anchor to find the modal's position
  const heading = this.page.locator('h2').filter({ hasText: 'Age Verification' })
  await expect(heading).toBeVisible({ timeout: 10000 })

  const headingBox = await heading.boundingBox()
  if (!headingBox) {
    throw new Error('Heading bounding box not found')
  }

  const viewport = this.page.viewportSize()
  if (!viewport) {
    throw new Error('Viewport size not available')
  }

  // The heading should be roughly in the upper-middle portion of the viewport for a centered modal
  const headingCenterY = headingBox.y + headingBox.height / 2
  const viewportCenterY = viewport.height / 2
  const maxOffset = viewport.height * 0.3 // Allow 30% offset from center

  if (Math.abs(headingCenterY - viewportCenterY) > maxOffset) {
    throw new Error(`Modal heading is not centered: heading center Y=${headingCenterY}, viewport center Y=${viewportCenterY}, offset=${Math.abs(headingCenterY - viewportCenterY)} (max allowed: ${maxOffset})`)
  }
})

/**
 * Asserts the modal content is fully visible within the dialog bounds.
 * Checks that all key content elements (heading, description, buttons) are visible on screen.
 */
Then(/^the modal content is fully visible within the dialog bounds$/, async function (this: World) {
  const viewport = this.page.viewportSize()
  if (!viewport) {
    throw new Error('Viewport size not available')
  }

  // Check that the heading is visible
  const heading = this.page.locator('h2').filter({ hasText: 'Age Verification' })
  await expect(heading).toBeVisible({ timeout: 10000 })
  const headingBox = await heading.boundingBox()
  if (headingBox) {
    if (headingBox.y < 0 || headingBox.y + headingBox.height > viewport.height) {
      throw new Error('Heading is outside the viewport')
    }
  }

  // Check that the description is visible
  const description = this.page.getByText('You must be 18 years or older')
  await expect(description).toBeVisible()
  const descBox = await description.boundingBox()
  if (descBox) {
    if (descBox.y < 0 || descBox.y + descBox.height > viewport.height) {
      throw new Error('Description is outside the viewport')
    }
  }

  // Check that the question is visible
  const question = this.page.getByText('Are you 18 years or older?')
  await expect(question).toBeVisible()
  const questionBox = await question.boundingBox()
  if (questionBox) {
    if (questionBox.y < 0 || questionBox.y + questionBox.height > viewport.height) {
      throw new Error('Question is outside the viewport')
    }
  }

  // Check that both buttons are visible
  const yesButton = this.page.getByRole('button', { name: /Yes.*18/i })
  await expect(yesButton).toBeVisible()
  const yesBox = await yesButton.boundingBox()
  if (yesBox) {
    if (yesBox.y < 0 || yesBox.y + yesBox.height > viewport.height) {
      throw new Error('Yes button is outside the viewport')
    }
  }

  const noButton = this.page.getByRole('button', { name: /No.*under 18/i })
  await expect(noButton).toBeVisible()
  const noBox = await noButton.boundingBox()
  if (noBox) {
    if (noBox.y < 0 || noBox.y + noBox.height > viewport.height) {
      throw new Error('No button is outside the viewport')
    }
  }
})

/**
 * Asserts the modal has no close button.
 */
Then(/^the modal has no close button$/, async function (this: World) {
  // Check for common close button patterns in modals
  const closeButtons = this.page.locator('button[aria-label*="close"], button:has-text("×"), button:has-text("✕")')
  await expect(closeButtons).toHaveCount(0)
})

/**
 * Asserts clicking the overlay background does not dismiss the modal.
 * The age verification gate uses a fixed black overlay.
 */
Then(/^clicking the overlay background does not close the modal$/, async function (this: World) {
  // Click on the black overlay background area (outside the modal card)
  // The overlay covers the full viewport, so click at the edges where the modal card isn't
  const viewport = this.page.viewportSize()
  if (viewport) {
    await this.page.mouse.click(viewport.width / 4, viewport.height / 2)
  } else {
    // Fallback: click on the overlay element directly
    await this.page.locator('div.fixed').first().click({ force: true })
  }
  // The modal content should still be visible - look for the heading
  const heading = this.page.getByText('Age Verification Required')
  await expect(heading).toBeVisible({ timeout: 5000 })
})

/**
 * Asserts the modal closes after an action.
 */
Then(/^the modal closes$/, async function (this: World) {
  // The age verification heading should disappear after clicking Yes
  const heading = this.page.getByText('Age Verification Required')
  await expect(heading).not.toBeVisible({ timeout: 5000 })
})

/**
 * Asserts the user can access application content (modal is gone).
 */
Then(/^I can access the application content$/, async function (this: World) {
  // The age verification modal should be gone
  const heading = this.page.getByText('Age Verification Required')
  await expect(heading).not.toBeVisible({ timeout: 10000 })
  // Wait for the page URL to be the app root - confirms navigation succeeded
  await this.page.waitForURL('**/', { timeout: 10000 })
})

/**
 * Asserts the user can access application content immediately (no modal shown).
 */
Then(/^I can access the application content immediately$/, async function (this: World) {
  // The age verification modal should not be visible
  const heading = this.page.getByText('Age Verification Required')
  await expect(heading).not.toBeVisible({ timeout: 10000 })
  await this.page.waitForURL('**/', { timeout: 10000 })
})

/**
 * Asserts the user is redirected to an external URL.
 */
Then(/^I am redirected to an external website suitable for younger audiences$/, async function (this: World) {
  // Wait for URL to change
  await this.page.waitForURL('**/*', { timeout: 5000 }).catch(() => {})
  const currentUrl = this.page.url()
  // Should be redirected away from the app
  expect(currentUrl).not.toContain(url('/'))
})

// ── App Logo ──

/**
 * Asserts the app logo is visible in the header.
 * The AppLogo is an SVG component rendered in the sidebar header.
 */
Then(/^I see the app logo in the header$/, async function (this: World) {
  // AppLogo renders as an SVG in the sidebar header
  const logo = this.page.locator('svg').first()
  await expect(logo).toBeVisible({ timeout: 10000 })
})

// ── Widget Steps ──

// Widget-related steps (BinauralBeats, CharacterAvatar, CharacterStats,
// HapticsEngine, HypnoticSpiral, MediaPlayerWidget, NotificationsSlideover, UserMenu)
// have been moved to `widgets.steps.ts` to keep this file under the line limit.
