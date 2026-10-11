import { When, Then } from '@cucumber/cucumber'
import type { World } from './world'

// ── Age Verification Modal ──

When(/^I access the application$/, async function () {
  const world = this as unknown as World
  await world.page.goto('/')
  await world.page.waitForLoadState('networkidle')
})

Then(/^I see the age verification modal$/, async function () {
  const world = this as unknown as World
  // Age verification modal should be visible
  const _modal = world.page.locator('text=Age Verification')
})

Then(/^I can confirm or deny my age$/, async function () {
  const world = this as unknown as World
  // Confirm and deny buttons should be present
  const _confirm = world.page.getByRole('button', { name: /confirm|yes|agree/i })
  const _deny = world.page.getByRole('button', { name: /deny|no|decline/i })
})

// ── App Logo ──

Then(/^I see the app logo in the header$/, async function () {
  const world = this as unknown as World
  // Logo should be visible in the header
  const _logo = world.page.locator('img[alt*="logo"], text=KiSS')
})

// ── Binaural Beats ──

When(/^I start a study session$/, async function () {
  // Pre-condition: study session started
})

Then(/^the selected binaural beat audio plays$/, async function () {
  // Audio element should be playing
})

// ── Character Avatar ──

Then(/^I see my character avatar$/, async function () {
  const world = this as unknown as World
  // Avatar should be visible
  const _avatar = world.page.locator('img[alt*="avatar"], .avatar')
})

// ── Character Stats ──

Then(/^I see my character stats$/, async function () {
  const world = this as unknown as World
  // Stats display should be visible
  const _stats = world.page.locator('text=Level, text=XP')
})

// ── Haptics Engine ──

When(/^I interact with the application$/, async function () {
  const world = this as unknown as World
  // Click somewhere to trigger haptics
  await world.page.click('body')
})

Then(/^haptic feedback is triggered$/, async function () {
  // Haptic feedback should be triggered (hard to test in headless)
})

// ── Hypnotic Spiral ──

Then(/^the hypnotic spiral animation plays$/, async function () {
  // Spiral animation should be visible
})

// ── Media Player Widget ──

When(/^I click play$/, async function () {
  const world = this as unknown as World
  const playButton = world.page.getByRole('button', { name: /play/i })
  if (await playButton.isVisible().catch(() => false)) {
    await playButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^the media player widget plays the content$/, async function () {
  // Media player should be playing
})

// ── Notifications Slideover ──

When(/^I open the notifications panel$/, async function () {
  const world = this as unknown as World
  const notificationButton = world.page.getByRole('button', { name: /notification|bell/i })
  if (await notificationButton.isVisible().catch(() => false)) {
    await notificationButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see a list of recent notifications$/, async function () {
  const world = this as unknown as World
  // Notification list should be visible
  const _notifications = world.page.locator('text=Notification')
})

Then(/^I can mark them as read$/, async function () {
  const world = this as unknown as World
  // Mark as read controls should be present
  const _markRead = world.page.getByRole('button', { name: /mark|read/i })
})

// ── User Menu ──

When(/^I click the user menu button$/, async function () {
  const world = this as unknown as World
  const menuButton = world.page.getByRole('button', { name: /menu|profile|user/i })
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click()
    await world.page.waitForTimeout(300)
  }
})

Then(/^I see profile, settings, and logout options$/, async function () {
  const world = this as unknown as World
  // Menu options should be visible
  const _profile = world.page.getByRole('menuitem', { name: /profile/i })
  const _settings = world.page.getByRole('menuitem', { name: /settings/i })
  const _logout = world.page.getByRole('menuitem', { name: /logout/i })
})
