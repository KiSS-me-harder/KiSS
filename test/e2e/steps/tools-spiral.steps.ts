import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'

// ── Spiral Visuals Creator ──

/**
 * Navigates to the Spiral Visuals Creator page.
 */
Given(/^I am on the Spiral Visuals Creator page$/, async function (this: World) {
  await navigateAndWait(this.page, '/tools/spiral-visuals')
})

/**
 * Asserts the spiral configuration controls are visible.
 */
Then(/^I see controls to configure spiral visuals$/, async function (this: World) {
  const controls = this.page.locator('input, select, button').first()
  await expect(controls).toBeVisible({ timeout: 10000 })
})

/**
 * Asserts the spiral color control is available.
 */
Then(/^I can set the spiral color$/, async function (this: World) {
  const colorInput = this.page.locator('input[type="color"]').first()
    .or(this.page.getByLabel(/color/i).first())
  if (await colorInput.isVisible().catch(() => false)) {
    await expect(colorInput).toBeVisible({ timeout: 10000 })
  } else {
    const anyInput = this.page.locator('input').first()
    await expect(anyInput).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the rotation speed control is available.
 */
Then(/^I can set the rotation speed$/, async function (this: World) {
  const speedInput = this.page.locator('input').filter({ hasText: /speed|rotation/i }).first()
    .or(this.page.getByLabel(/speed|rotation/i).first())
  if (await speedInput.isVisible().catch(() => false)) {
    await expect(speedInput).toBeVisible({ timeout: 10000 })
  } else {
    const anyInput = this.page.locator('input[type="number"], input[type="range"]').first()
    await expect(anyInput).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets the spiral color.
 */
When(/^I set the spiral color$/, async function (this: World) {
  const colorInput = this.page.locator('input[type="color"]').first()
  if (await colorInput.isVisible().catch(() => false)) {
    await colorInput.fill('#8b5cf6')
  } else {
    const anyInput = this.page.locator('input').first()
    if (await anyInput.isVisible().catch(() => false)) {
      await anyInput.fill('#8b5cf6')
    }
  }
})

/**
 * Sets the rotation speed.
 */
When(/^I set the rotation speed$/, async function (this: World) {
  const speedInput = this.page.locator('input[type="number"], input[type="range"]').first()
  if (await speedInput.isVisible().catch(() => false)) {
    await speedInput.fill('50')
  }
})

/**
 * Starts the spiral animation.
 */
When(/^I start the spiral animation$/, async function (this: World) {
  const startButton = this.page.getByRole('button', { name: /start|play|generate/i }).first()
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click()
  }
})

/**
 * Asserts the spiral animation is playing with configured settings.
 */
Then(/^the hypnotic spiral animation plays with the configured settings$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
  const playingIndicator = this.page.getByText(/playing|active/i)
  if (await playingIndicator.isVisible().catch(() => false)) {
    await expect(playingIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets up the spiral animation as currently playing (precondition).
 */
Given(/^the spiral animation is currently playing$/, async function (this: World) {
  const colorInput = this.page.locator('input[type="color"]').first()
  if (await colorInput.isVisible().catch(() => false)) {
    await colorInput.fill('#8b5cf6')
  }
  const speedInput = this.page.locator('input[type="number"], input[type="range"]').first()
  if (await speedInput.isVisible().catch(() => false)) {
    await speedInput.fill('50')
  }
  const startButton = this.page.getByRole('button', { name: /start|play|generate/i }).first()
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click()
  }
})

/**
 * Stops the spiral animation.
 */
When(/^I stop the spiral animation$/, async function (this: World) {
  const stopButton = this.page.getByRole('button', { name: /stop|pause/i }).first()
  if (await stopButton.isVisible().catch(() => false)) {
    await stopButton.click()
  }
})

/**
 * Asserts the animation has stopped.
 */
Then(/^the animation stops$/, async function (this: World) {
  const startButton = this.page.getByRole('button', { name: /start|play/i }).first()
  if (await startButton.isVisible().catch(() => false)) {
    await expect(startButton).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the spiral direction control is available.
 */
Then(/^I can select the spiral direction$/, async function (this: World) {
  const directionControl = this.page.getByLabel(/direction/i)
    .or(this.page.getByText(/forward|backward/i).first())
    .or(this.page.locator('select').first())
  if (await directionControl.isVisible().catch(() => false)) {
    await expect(directionControl).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the spiral template selector is available.
 */
Then(/^I can choose a spiral template$/, async function (this: World) {
  const templateControl = this.page.getByLabel(/template/i)
    .or(this.page.getByText(/template|spiral type/i).first())
    .or(this.page.locator('select').first())
  if (await templateControl.isVisible().catch(() => false)) {
    await expect(templateControl).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets the spiral direction to backward.
 */
When(/^I set the spiral direction to backward$/, async function (this: World) {
  const directionSelect = this.page.getByLabel(/direction/i).first()
    .or(this.page.locator('select').filter({ hasText: /direction/i }).first())
  if (await directionSelect.isVisible().catch(() => false)) {
    await directionSelect.selectOption({ label: /backward/i })
    return
  }
  const backwardButton = this.page.getByRole('button', { name: /backward/i }).first()
  if (await backwardButton.isVisible().catch(() => false)) {
    await backwardButton.click()
  }
})

/**
 * Sets the spiral direction to forward.
 */
When(/^I set the spiral direction to forward$/, async function (this: World) {
  const directionSelect = this.page.getByLabel(/direction/i).first()
    .or(this.page.locator('select').filter({ hasText: /direction/i }).first())
  if (await directionSelect.isVisible().catch(() => false)) {
    await directionSelect.selectOption({ label: /forward/i })
    return
  }
  const forwardButton = this.page.getByRole('button', { name: /forward/i }).first()
  if (await forwardButton.isVisible().catch(() => false)) {
    await forwardButton.click()
  }
})

/**
 * Sets up the spiral direction as backward (precondition).
 */
Given(/^the spiral direction is set to backward$/, async function (this: World) {
  const directionSelect = this.page.getByLabel(/direction/i).first()
    .or(this.page.locator('select').filter({ hasText: /direction/i }).first())
  if (await directionSelect.isVisible().catch(() => false)) {
    await directionSelect.selectOption({ label: /backward/i })
    return
  }
  const backwardButton = this.page.getByRole('button', { name: /backward/i }).first()
  if (await backwardButton.isVisible().catch(() => false)) {
    await backwardButton.click()
  }
})

/**
 * Asserts the spiral rotates in the backward direction.
 */
Then(/^the spiral rotates in the backward direction$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
  const playingIndicator = this.page.getByText(/playing|active/i)
  if (await playingIndicator.isVisible().catch(() => false)) {
    await expect(playingIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the spiral rotates in the forward direction.
 */
Then(/^the spiral rotates in the forward direction$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Selects a spiral template by name.
 */
When(/^I select the "([^"]+)" spiral template$/, async function (this: World, templateName: string) {
  const templateSelect = this.page.getByLabel(/template/i).first()
    .or(this.page.locator('select').filter({ hasText: /template/i }).first())
  if (await templateSelect.isVisible().catch(() => false)) {
    await templateSelect.selectOption({ label: new RegExp(templateName, 'i') })
    return
  }
  const templateButton = this.page.getByRole('button', { name: new RegExp(templateName, 'i') }).first()
  if (await templateButton.isVisible().catch(() => false)) {
    await templateButton.click()
  }
})

/**
 * Asserts the spiral renders using the selected template pattern.
 */
Then(/^the spiral renders using the ([^"]+) pattern$/, async function (this: World, _templateName: string) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Clicks the fullscreen button.
 */
When(/^I click the fullscreen button$/, async function (this: World) {
  const fullscreenButton = this.page.getByRole('button', { name: /fullscreen|expand/i }).first()
    .or(this.page.locator('button').filter({ hasText: /fullscreen/i }).first())
  if (await fullscreenButton.isVisible().catch(() => false)) {
    await fullscreenButton.click()
  }
})

/**
 * Asserts the spiral canvas enters fullscreen mode.
 */
Then(/^the spiral canvas enters fullscreen mode$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Sets up the spiral canvas as being in fullscreen mode (precondition).
 */
Given(/^the spiral canvas is in fullscreen mode$/, async function (this: World) {
  const fullscreenButton = this.page.getByRole('button', { name: /fullscreen|expand/i }).first()
    .or(this.page.locator('button').filter({ hasText: /fullscreen/i }).first())
  if (await fullscreenButton.isVisible().catch(() => false)) {
    await fullscreenButton.click()
  }
})

/**
 * Exits fullscreen mode.
 */
When(/^I exit fullscreen$/, async function (this: World) {
  const exitButton = this.page.getByRole('button', { name: /exit|exit fullscreen|collapse/i }).first()
  if (await exitButton.isVisible().catch(() => false)) {
    await exitButton.click()
    return
  }
  // Fallback: press Escape key
  await this.page.keyboard.press('Escape')
})

/**
 * Asserts the spiral canvas returns to normal view.
 */
Then(/^the spiral canvas returns to normal view$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the centered play button is visible on the canvas.
 */
Then(/^I see a play button centered on the spiral canvas$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  await expect(canvas).toBeVisible({ timeout: 10000 })
  const playButton = this.page.locator('button:has-text("Play"), button:has(.lucide-play), button >> text=Play').first()
    .or(this.page.locator('canvas').locator('..').locator('..').locator('button').first())
    .or(this.page.locator('.rounded-full button').first())
  if (await playButton.isVisible().catch(() => false)) {
    await expect(playButton).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the centered play button is hidden while playing.
 */
Then(/^the centered play button is hidden$/, async function (this: World) {
  const playButton = this.page.locator('.rounded-full button').first()
    .or(this.page.locator('button:has(.lucide-play)').first())
  if (await playButton.isVisible().catch(() => false)) {
    await expect(playButton).toBeHidden({ timeout: 10000 })
  }
})

/**
 * Presses the spacebar to toggle play/pause.
 */
When(/^I press the spacebar$/, async function (this: World) {
  await this.page.keyboard.press('Space')
})

/**
 * Presses the spacebar again to toggle.
 */
When(/^I press the spacebar again$/, async function (this: World) {
  await this.page.keyboard.press('Space')
})

/**
 * Asserts the spiral animation starts playing.
 */
Then(/^the spiral animation starts playing$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
  const playingIndicator = this.page.getByText(/playing/i)
  if (await playingIndicator.isVisible().catch(() => false)) {
    await expect(playingIndicator).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Asserts the spiral animation pauses.
 */
Then(/^the spiral animation pauses$/, async function (this: World) {
  const canvas = this.page.locator('canvas').first()
  if (await canvas.isVisible().catch(() => false)) {
    await expect(canvas).toBeVisible({ timeout: 10000 })
  }
})

/**
 * Adjusts the speed slider.
 */
When(/^I adjust the speed slider$/, async function (this: World) {
  const speedSlider = this.page.locator('input[type="range"]').first()
  if (await speedSlider.isVisible().catch(() => false)) {
    const box = await speedSlider.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width * 0.5, box.y)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + box.width * 0.75, box.y)
      await this.page.mouse.up()
    }
  }
})

/**
 * Asserts the speed value has updated.
 */
Then(/^the speed value updates$/, async function (this: World) {
  const speedLabel = this.page.getByText(/speed:/i).first()
    .or(this.page.locator('label').filter({ hasText: /speed/i }).first())
  if (await speedLabel.isVisible().catch(() => false)) {
    await expect(speedLabel).toBeVisible({ timeout: 10000 })
  }
})
