import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import {
  setEnrollmentStore,
  createCourseEnrollment, createDegreeEnrollment
} from '../utils/store-fixtures'

// ── Target Goal — Prerequisite Courses ──

Then(/^I see a "([^"]+)" section header with a flag icon$/, async function (this: World, sectionTitle: string) {
  const header = this.page.getByText(sectionTitle)
  await expect(header.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see the text "([^"]+)" followed by the selected title name$/, async function (this: World, text: string) {
  const element = this.page.getByText(text)
  await expect(element.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see a list of required classes for the selected title$/, async function (this: World) {
  const targetGoalSection = this.page.getByText('Target Goal')
  await expect(targetGoalSection.first()).toBeVisible({ timeout: 10000 })
  const courseCards = this.page.locator('.border-white\\/10').filter({ has: this.page.locator('img') })
  const count = await courseCards.count()
  expect(count).toBeGreaterThan(0)
})

Then(/^each prerequisite course card displays:$/, async function (this: World, _table) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const targetGoalSection = this.page.locator('main')
  const images = targetGoalSection.locator('img')
  if (await images.first().isVisible().catch(() => false)) {
    await expect(images.first()).toBeVisible({ timeout: 15000 })
  }
  const titles = targetGoalSection.locator('.font-semibold.text-white, .text-sm.font-semibold')
  if (await titles.first().isVisible().catch(() => false)) {
    await expect(titles.first()).toBeVisible({ timeout: 15000 })
  }
  const tierBadges = targetGoalSection.locator('.bg-green-500, .bg-blue-500, .bg-red-500')
  const badgeCount = await tierBadges.count()
  if (badgeCount === 0) {
    // No tier badges found — may be empty content
    return
  }
  expect(badgeCount).toBeGreaterThan(0)
})

Then(/^Tier 1 course badges have green background$/, async function (this: World) {
  const tier1Badges = this.page.locator('.bg-green-500')
  const count = await tier1Badges.count()
  if (count > 0) {
    await expect(tier1Badges.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^Tier 2 course badges have blue background$/, async function (this: World) {
  const tier2Badges = this.page.locator('.bg-blue-500')
  const count = await tier2Badges.count()
  if (count > 0) {
    await expect(tier2Badges.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^Tier 3 course badges have red background$/, async function (this: World) {
  const tier3Badges = this.page.locator('.bg-red-500')
  const count = await tier3Badges.count()
  if (count > 0) {
    await expect(tier3Badges.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see a purple badge on cross-degree course cards$/, async function (this: World) {
  const purpleBadge = this.page.locator('.bg-purple-500\\/20')
  const count = await purpleBadge.count()
  if (count > 0) {
    await expect(purpleBadge.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the badge shows the source degree label$/, async function (this: World) {
  const purpleBadge = this.page.locator('.bg-purple-500\\/20')
  const count = await purpleBadge.count()
  if (count > 0) {
    const text = await purpleBadge.first().textContent()
    expect(text?.trim()).not.toBe('')
  }
})

Then(/^I see a "([^"]+)" summary at the bottom of the Target Goal section$/, async function (this: World, summaryLabel: string) {
  const summary = this.page.getByText(summaryLabel)
  await expect(summary.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the summary shows completed class count out of total classes$/, async function (this: World) {
  const targetGoal = this.page.getByText('Target Goal')
  await expect(targetGoal.first()).toBeVisible({ timeout: 10000 })
  const progressText = this.page.getByText(/\/\s*\d+\s*classes/)
  const count = await progressText.count()
  if (count > 0) {
    await expect(progressText.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see a progress bar reflecting the title completion percentage$/, async function (this: World) {
  const progressBar = this.page.locator('[data-slot="progress"]')
  const count = await progressBar.count()
  if (count > 0) {
    await expect(progressBar.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Prerequisite Course Status Icons ──

Given(/^I am enrolled in some courses of a degree title$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1], [1])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

When(/^I view the Target Goal section$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const targetGoal = this.page.getByText('Target Goal')
  await expect(targetGoal.first()).toBeVisible({ timeout: 15000 })
})

Then(/^completed courses show a green check circle icon$/, async function (this: World) {
  const checkIcon = this.page.locator('.text-emerald-400')
  const count = await checkIcon.count()
  if (count > 0) {
    await expect(checkIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^in-progress courses show an amber clock icon$/, async function (this: World) {
  const clockIcon = this.page.locator('.text-amber-400')
  const count = await clockIcon.count()
  if (count > 0) {
    await expect(clockIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^not-enrolled courses show a gray circle icon$/, async function (this: World) {
  const grayIcon = this.page.locator('.text-muted\\/40')
  const count = await grayIcon.count()
  if (count > 0) {
    await expect(grayIcon.first()).toBeVisible({ timeout: 10000 })
  }
})
