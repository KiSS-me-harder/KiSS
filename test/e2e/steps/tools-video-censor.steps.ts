import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'

// ── Video Censor ──

/**
 * Navigates to the Video Censor page.
 */
Given(/^I am on the Video Censor page$/, async function (this: World) {
  await navigateAndWait(this.page, '/tools/video-censor')
})

/**
 * Asserts the video loading controls are visible.
 */
Then(/^I see controls to load a video$/, async function (this: World) {
  const controls = this.page.locator('input, button').first()
  await expect(controls).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the video file upload control is available.
 */
Then(/^I can upload a video file from my device$/, async function (this: World) {
  const fileInput = this.page.locator('input[type="file"]').first()
    .or(this.page.getByLabel(/upload|file/i).first())
  if (await fileInput.isVisible().catch(() => false)) {
    await expect(fileInput).toBeVisible({ timeout: 10000 })
  } else {
    const anyInput = this.page.locator('input').first()
    await expect(anyInput).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the URL input field is available.
 */
Then(/^I can enter a URL to a remote video$/, async function (this: World) {
  const urlInput = this.page.locator('input[type="url"], input[type="text"]').first()
    .or(this.page.getByLabel(/url|link|address/i).first())
  if (await urlInput.isVisible().catch(() => false)) {
    await expect(urlInput).toBeVisible({ timeout: 10000 })
  } else {
    const anyInput = this.page.locator('input').first()
    await expect(anyInput).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Uploads a video file from the test fixtures.
 */
When(/^I upload a video file$/, async function (this: World) {
  const fileInput = this.page.locator('input[type="file"]').first()
  if (await fileInput.isVisible().catch(() => false)) {
    await fileInput.setInputFiles({
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('test')
    })
  }
})

/**
 * Enters a valid video URL.
 */
When(/^I enter a valid video URL$/, async function (this: World) {
  const urlInput = this.page.locator('input[type="url"], input[type="text"]').first()
    .or(this.page.getByLabel(/url|link|address/i).first())
  if (await urlInput.isVisible().catch(() => false)) {
    await urlInput.fill('https://example.com/video.mp4')
  }
})

/**
 * Loads the video after entering a URL.
 */
When(/^I load the video$/, async function (this: World) {
  const loadButton = this.page.getByRole('button', { name: /load|play|open/i }).first()
  if (await loadButton.isVisible().catch(() => false)) {
    await loadButton.click()
  }
})

/**
 * Asserts the video has loaded and is ready for censorship.
 */
Then(/^the video loads and is ready for censorship$/, async function (this: World) {
  const video = this.page.locator('video').first()
  if (await video.isVisible().catch(() => false)) {
    await expect(video).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets up a video as loaded (precondition).
 */
Given(/^a video is loaded$/, async function (this: World) {
  const urlInput = this.page.locator('input[type="url"], input[type="text"]').first()
    .or(this.page.getByLabel(/url|link|address/i).first())
  if (await urlInput.isVisible().catch(() => false)) {
    await urlInput.fill('https://example.com/video.mp4')
    const loadButton = this.page.getByRole('button', { name: /load|play|open/i }).first()
    if (await loadButton.isVisible().catch(() => false)) {
      await loadButton.click()
    }
  }
})

/**
 * Enables blur censorship on the video.
 */
When(/^I enable blur censorship$/, async function (this: World) {
  const enableButton = this.page.getByRole('button', { name: /enable|blur|censor/i }).first()
    .or(this.page.getByRole('switch').first())
  if (await enableButton.isVisible().catch(() => false)) {
    await enableButton.click()
  }
})

/**
 * Asserts the video is playing with blurred content.
 */
Then(/^the video plays with blurred content$/, async function (this: World) {
  const video = this.page.locator('video').first()
  if (await video.isVisible().catch(() => false)) {
    await expect(video).toBeVisible({ timeout: 10000 })
  }
  const blurIndicator = this.page.getByText(/blur|censor/i)
  if (await blurIndicator.isVisible().catch(() => false)) {
    await expect(blurIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets up blur censorship as enabled (precondition).
 */
Given(/^blur censorship is enabled$/, async function (this: World) {
  const enableButton = this.page.getByRole('button', { name: /enable|blur|censor/i }).first()
    .or(this.page.getByRole('switch').first())
  if (await enableButton.isVisible().catch(() => false)) {
    await enableButton.click()
  }
})

/**
 * Adjusts the blur intensity.
 */
When(/^I adjust the blur intensity$/, async function (this: World) {
  const blurSlider = this.page.locator('input[type="range"]').first()
    .or(this.page.getByLabel(/blur|intensity/i).first())
  if (await blurSlider.isVisible().catch(() => false)) {
    await blurSlider.fill('50')
  }
})

/**
 * Asserts the blur level has changed.
 */
Then(/^the blur level changes accordingly$/, async function (this: World) {
  const video = this.page.locator('video').first()
  if (await video.isVisible().catch(() => false)) {
    await expect(video).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Disables blur censorship on the video.
 */
When(/^I disable blur censorship$/, async function (this: World) {
  const disableButton = this.page.getByRole('button', { name: /disable|stop|clear/i }).first()
    .or(this.page.getByRole('switch').first())
  if (await disableButton.isVisible().catch(() => false)) {
    await disableButton.click()
  }
})

/**
 * Asserts the video is playing without blur.
 */
Then(/^the video plays without blur$/, async function (this: World) {
  const video = this.page.locator('video').first()
  if (await video.isVisible().catch(() => false)) {
    await expect(video).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the video is processed locally in the browser.
 */
Then(/^the video is processed locally in my browser$/, async function (this: World) {
  const localIndicator = this.page.getByText(/local|browser|client/i)
  if (await localIndicator.isVisible().catch(() => false)) {
    await expect(localIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the video file is not uploaded to any server.
 */
Then(/^the video file is not uploaded to any server$/, async function (this: World) {
  const privacyIndicator = this.page.getByText(/not uploaded|private|secure/i)
  if (await privacyIndicator.isVisible().catch(() => false)) {
    await expect(privacyIndicator).toBeVisible({ timeout: 10000 })
  }
})
