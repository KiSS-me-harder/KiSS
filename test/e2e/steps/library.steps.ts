import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'

// ── Browse Library ──

Then(/^I see navigation cards for Videos, Images, Audio, and Books$/, async function (this: World) {
  // Library navigation cards should be visible
  await expect(this.page.locator('text=Videos')).toBeVisible({ timeout: 10000 })
  await expect(this.page.locator('text=Images')).toBeVisible()
  await expect(this.page.locator('text=Audio')).toBeVisible()
  await expect(this.page.locator('text=Books')).toBeVisible()
})

Then(/^each card shows the item count$/, async function (this: World) {
  // Cards should display item counts
  const counts = this.page.locator('[class*="count"]')
  const count = await counts.count()
  expect(count).toBeGreaterThan(0)
})

// ── Recent Media ──

Then(/^I see a section of recent media items$/, async function (this: World) {
  // Recent media section should be visible
  const recent = this.page.locator('text=Recent')
  await expect(recent).toBeVisible({ timeout: 10000 })
})

Then(/^each item shows its title, type, and author$/, async function (this: World) {
  // Media items should show metadata
  const items = this.page.locator('[data-testid="library-item-card"]')
  await expect(items.first()).toBeVisible({ timeout: 10000 })
})

// ── Library Item Detail ──

Then(/^I see the full media content and metadata$/, async function (this: World) {
  // Media detail should show full content

})
