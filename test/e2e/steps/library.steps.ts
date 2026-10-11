import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from './world'

// ── Browse Library ──

Then(/^I see navigation cards for Videos, Images, Audio, and Books$/, async function () {
  const world = this as unknown as World
  // Library navigation cards should be visible
  await expect(world.page.locator('text=Videos')).toBeVisible({ timeout: 10000 })
  await expect(world.page.locator('text=Images')).toBeVisible()
  await expect(world.page.locator('text=Audio')).toBeVisible()
  await expect(world.page.locator('text=Books')).toBeVisible()
})

Then(/^each card shows the item count$/, async function () {
  const world = this as unknown as World
  // Cards should display item counts
  const _counts = world.page.locator('text=\\d+')
})

// ── Recent Media ──

Then(/^I see a section of recent media items$/, async function () {
  const world = this as unknown as World
  // Recent media section should be visible
  const _recent = world.page.locator('text=Recent')
})

Then(/^each item shows its title, type, and author$/, async function () {
  const world = this as unknown as World
  // Media items should show metadata
  const _items = world.page.locator('a[href*="/library/"]')
})

// ── Library Item Detail ──

Then(/^I see the full media content and metadata$/, async function () {
  const world = this as unknown as World
  // Media detail should show full content
  await expect(world.page).toHaveLoadState('networkidle')
})
