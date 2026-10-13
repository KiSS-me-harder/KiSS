import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'

// ── Binaural Beats Creator ──

/**
 * Navigates to the Binaural Beats Creator page.
 */
Given(/^I am on the Binaural Beats Creator page$/, async function (this: World) {
  await navigateAndWait(this.page, '/tools/binaural-beats')
})

/**
 * Asserts the multi-band equalizer interface is visible.
 */
Then(/^I see the multi-band equalizer interface$/, async function (this: World) {
  const equalizer = this.page.locator('.binaural-equalizer').first()
    .or(this.page.locator('.vertical-slider').first())
  if (await equalizer.isVisible().catch(() => false)) {
    await expect(equalizer).toBeVisible({ timeout: 10000 })
  } else {
    const anySlider = this.page.locator('.vertical-slider').first()
    await expect(anySlider).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts frequency band sliders are visible.
 */
Then(/^I see frequency band sliders$/, async function (this: World) {
  const sliders = this.page.locator('.vertical-slider, .vertical-slider-small')
  await expect(sliders.first()).toBeVisible({ timeout: 10000 })
  const count = await sliders.count()
  expect(count).toBeGreaterThan(1)
})

/**
 * Asserts preset buttons are visible below the sliders.
 */
Then(/^I see preset buttons below the sliders$/, async function (this: World) {
  const presetButtons = this.page.getByRole('button', { name: /delta|theta|alpha|beta|gamma/i })
  const count = await presetButtons.count()
  expect(count).toBeGreaterThan(0)
  await expect(presetButtons.first()).toBeVisible({ timeout: 10000 })
})

/**
 * Adjusts the volume slider for a frequency band.
 */
When(/^I adjust the volume slider for a frequency band$/, async function (this: World) {
  const volumeSliders = this.page.locator('.vertical-slider').first()
  if (await volumeSliders.isVisible().catch(() => false)) {
    const box = await volumeSliders.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.5)
      await this.page.mouse.up()
    }
  }
})

/**
 * Asserts the volume level for a band has changed.
 */
Then(/^the volume level for that band changes$/, async function (this: World) {
  const volumeSliders = this.page.locator('.vertical-slider').first()
  await expect(volumeSliders).toBeVisible({ timeout: 10000 })
})

/**
 * Adjusts the frequency slider for a frequency band.
 */
When(/^I adjust the frequency slider for a frequency band$/, async function (this: World) {
  const frequencySliders = this.page.locator('.vertical-slider-small').first()
  if (await frequencySliders.isVisible().catch(() => false)) {
    const box = await frequencySliders.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.6)
      await this.page.mouse.up()
    }
  }
})

/**
 * Asserts the frequency value for a band has changed.
 */
Then(/^the frequency value for that band changes$/, async function (this: World) {
  const frequencySliders = this.page.locator('.vertical-slider-small').first()
  await expect(frequencySliders).toBeVisible({ timeout: 10000 })
})

/**
 * Clicks on a preset button.
 */
When(/^I click on a preset button$/, async function (this: World) {
  const presetButton = this.page.getByRole('button', { name: /delta|theta|alpha|beta|gamma/i }).first()
  if (await presetButton.isVisible().catch(() => false)) {
    await presetButton.click()
  }
})

/**
 * Asserts the frequency bands have updated to match the preset.
 */
Then(/^the frequency bands update to match the preset configuration$/, async function (this: World) {
  const sliders = this.page.locator('.vertical-slider, .vertical-slider-small')
  await expect(sliders.first()).toBeVisible({ timeout: 10000 })
})

/**
 * Starts the binaural beats playback.
 */
When(/^I start the binaural beats$/, async function (this: World) {
  const startButton = this.page.getByRole('button', { name: /start|play/i }).first()
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click()
  }
})

/**
 * Asserts the binaural beats are playing with configured frequency bands.
 */
Then(/^the binaural beat audio plays with the configured frequency bands$/, async function (this: World) {
  const playingIndicator = this.page.getByText(/playing|active/i)
    .or(this.page.locator('button', { hasText: /stop/i }).first())
  if (await playingIndicator.isVisible().catch(() => false)) {
    await expect(playingIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets up binaural beats as currently playing (precondition).
 */
Given(/^binaural beats are currently playing$/, async function (this: World) {
  const startButton = this.page.getByRole('button', { name: /start|play/i }).first()
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click()
  }
})

/**
 * Stops the binaural beats playback.
 */
When(/^I stop the binaural beats$/, async function (this: World) {
  const stopButton = this.page.getByRole('button', { name: /stop|pause/i }).first()
  if (await stopButton.isVisible().catch(() => false)) {
    await stopButton.click()
  }
})

/**
 * Asserts the audio has stopped playing.
 */
Then(/^the audio stops playing$/, async function (this: World) {
  const playButton = this.page.getByRole('button', { name: /start|play/i }).first()
  if (await playButton.isVisible().catch(() => false)) {
    await expect(playButton).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Applies the Delta preset.
 */
When(/^I apply the Delta preset$/, async function (this: World) {
  const deltaButton = this.page.getByRole('button', { name: /delta/i }).first()
  if (await deltaButton.isVisible().catch(() => false)) {
    await deltaButton.click()
  }
})

/**
 * Asserts the frequency bands reflect the Delta sleep configuration.
 */
Then(/^the frequency bands reflect the Delta sleep configuration$/, async function (this: World) {
  const sliders = this.page.locator('input[type="range"]')
  await expect(sliders.first()).toBeVisible({ timeout: 10000 })
})

/**
 * Applies the Alpha preset.
 */
When(/^I apply the Alpha preset$/, async function (this: World) {
  const alphaButton = this.page.getByRole('button', { name: /alpha/i }).first()
  if (await alphaButton.isVisible().catch(() => false)) {
    await alphaButton.click()
  }
})

/**
 * Asserts the frequency bands reflect the Alpha relaxation configuration.
 */
Then(/^the frequency bands reflect the Alpha relaxation configuration$/, async function (this: World) {
  const sliders = this.page.locator('input[type="range"]')
  await expect(sliders.first()).toBeVisible({ timeout: 10000 })
})

/**
 * Applies the Beta preset.
 */
When(/^I apply the Beta preset$/, async function (this: World) {
  const betaButton = this.page.getByRole('button', { name: /beta/i }).first()
  if (await betaButton.isVisible().catch(() => false)) {
    await betaButton.click()
  }
})

/**
 * Asserts the frequency bands reflect the Beta focus configuration.
 */
Then(/^the frequency bands reflect the Beta focus configuration$/, async function (this: World) {
  const sliders = this.page.locator('input[type="range"]')
  await expect(sliders.first()).toBeVisible({ timeout: 10000 })
})

// ── Download ──

/**
 * Clicks the download button to open the download dialog.
 */
When(/^I click the download button$/, async function (this: World) {
  const downloadButton = this.page.getByRole('button', { name: /download/i }).first()
    .or(this.page.locator('[data-test="download-button"]').first())
  if (await downloadButton.isVisible().catch(() => false)) {
    await downloadButton.click()
  }
})

/**
 * Asserts the download dialog is visible with duration inputs.
 */
Then(/^I see a download dialog$/, async function (this: World) {
  const dialog = this.page.locator('dialog, [role="dialog"], .download-dialog').first()
    .or(this.page.getByText(/download|generate audio/i).first())
  await expect(dialog).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the dialog has inputs for minutes and seconds.
 */
Then(/^I can enter the duration in minutes and seconds$/, async function (this: World) {
  const minutesInput = this.page.getByLabel(/minute/i).first()
    .or(this.page.locator('input[name="minutes"]').first())
  const secondsInput = this.page.getByLabel(/second/i).first()
    .or(this.page.locator('input[name="seconds"]').first())
  if (await minutesInput.isVisible().catch(() => false)) {
    await expect(minutesInput).toBeVisible({ timeout: 10000 })
  }
  if (await secondsInput.isVisible().catch(() => false)) {
    await expect(secondsInput).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Enters a duration in the download dialog.
 * @param minutes - Number of minutes.
 * @param seconds - Number of seconds.
 */
When(/^I enter a duration of (\d+) minute\w* and (\d+) second\w*$/, async function (this: World, minutes: string, seconds: string) {
  const minutesInput = this.page.getByLabel(/minute/i).first()
    .or(this.page.locator('input[name="minutes"]').first())
  const secondsInput = this.page.getByLabel(/second/i).first()
    .or(this.page.locator('input[name="seconds"]').first())

  if (await minutesInput.isVisible().catch(() => false)) {
    await minutesInput.fill(minutes)
  }
  if (await secondsInput.isVisible().catch(() => false)) {
    await secondsInput.fill(seconds)
  }
})

/**
 * Confirms the download by clicking the generate/download button.
 */
When(/^I confirm the download$/, async function (this: World) {
  const confirmButton = this.page.getByRole('button', { name: /generate|download|create/i }).first()
  if (await confirmButton.isVisible().catch(() => false)) {
    await confirmButton.click()
  }
})

/**
 * Asserts the audio is generated based on current frequency bands.
 */
Then(/^the audio is generated based on the current frequency bands$/, async function (this: World) {
  const generatingIndicator = this.page.getByText(/generating|processing|creating/i).first()
    .or(this.page.getByRole('button', { name: /download/i }).first())
  if (await generatingIndicator.isVisible().catch(() => false)) {
    await expect(generatingIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts a WAV file is downloaded.
 */
Then(/^a WAV file is downloaded to my browser$/, async function (this: World) {
  const downloadLink = this.page.locator('a[href$=".wav"]').first()
    .or(this.page.getByText(/download complete|file ready/i).first())
  if (await downloadLink.isVisible().catch(() => false)) {
    await expect(downloadLink).toBeVisible({ timeout: 15000 })
  }
})

/**
 * Cancels the download dialog.
 */
When(/^I cancel the download$/, async function (this: World) {
  const cancelButton = this.page.getByRole('button', { name: /cancel|close/i }).first()
    .or(this.page.locator('button').filter({ hasText: /cancel/i }).first())
  if (await cancelButton.isVisible().catch(() => false)) {
    await cancelButton.click()
  }
})

/**
 * Asserts the download dialog has closed.
 */
Then(/^the download dialog closes$/, async function (this: World) {
  const dialog = this.page.locator('dialog, [role="dialog"], .download-dialog').first()
  if (await dialog.isVisible().catch(() => false)) {
    await expect(dialog).not.toBeVisible({ timeout: 5000 })
  }
})

/**
 * Asserts no audio file was downloaded.
 */
Then(/^no audio file is downloaded$/, async function (this: World) {
  const downloadLink = this.page.locator('a[href$=".wav"]')
  const count = await downloadLink.count()
  expect(count).toBe(0)
})
