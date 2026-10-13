import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'

// ── Tools Page ──

/**
 * Navigates to the Tools page.
 */
Given(/^I am on the Tools page$/, async function (this: World) {
  await navigateAndWait(this.page, '/tools')
})

/**
 * Asserts the tools list is visible on the page.
 */
Then(/^I see a list of available tools$/, async function (this: World) {
  const toolsHeading = this.page.getByText(/tools/i)
  await expect(toolsHeading).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the Binaural Beats Creator link is visible.
 */
Then(/^I see a link to the Binaural Beats Creator$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /binaural.*beats/i })
  await expect(link).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the Spiral Visuals Creator link is visible.
 */
Then(/^I see a link to the Spiral Visuals Creator$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /spiral.*visual/i })
  await expect(link).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the Video Censor link is visible.
 */
Then(/^I see a link to the Video Censor$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /video.*censor/i })
  await expect(link).toBeVisible({ timeout: 10000 })
})

/**
 * Clicks the Binaural Beats Creator link.
 */
When(/^I click on the Binaural Beats Creator$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /binaural.*beats/i })
  await expect(link).toBeVisible({ timeout: 10000 })
  await link.click()
})

/**
 * Clicks the Spiral Visuals Creator link.
 */
When(/^I click on the Spiral Visuals Creator$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /spiral.*visual/i })
  await expect(link).toBeVisible({ timeout: 10000 })
  await link.click()
})

/**
 * Clicks the Video Censor link.
 */
When(/^I click on the Video Censor$/, async function (this: World) {
  const link = this.page.getByRole('link', { name: /video.*censor/i })
  await expect(link).toBeVisible({ timeout: 10000 })
  await link.click()
})

/**
 * Asserts navigation to the Binaural Beats Creator page.
 */
Then(/^I am navigated to the Binaural Beats Creator page$/, async function (this: World) {
  await this.page.waitForURL('**/tools/binaural-beats*', { timeout: 10000 })
})

/**
 * Asserts navigation to the Spiral Visuals Creator page.
 */
Then(/^I am navigated to the Spiral Visuals Creator page$/, async function (this: World) {
  await this.page.waitForURL('**/tools/spiral-visuals*', { timeout: 10000 })
})

/**
 * Asserts navigation to the Video Censor page.
 */
Then(/^I am navigated to the Video Censor page$/, async function (this: World) {
  await this.page.waitForURL('**/tools/video-censor*', { timeout: 10000 })
})
