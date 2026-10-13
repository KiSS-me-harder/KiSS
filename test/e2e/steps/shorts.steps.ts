import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'
import { setEnrollmentStore } from '../utils/store-fixtures'

// ── Navigation ──

Given(/^I am on the Shorts page$/, async function (this: World) {
  await navigateAndWait(this.page, '/shorts')
})

When(/^I navigate to the Shorts page$/, async function (this: World) {
  await navigateAndWait(this.page, '/shorts')
})

// ── Enrollment Prerequisites ──

Given(/^I am enrolled in at least one course$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    enrollments: [
      { course: 'bimbo-behavior', levels: { 100: { completed: false } } }
    ]
  })
})

Given(/^I am enrolled in the "([^"]+)" course$/, async function (this: World, course: string) {
  await setEnrollmentStore(this.page, {
    enrollments: [
      { course, levels: { 100: { completed: false } } }
    ]
  })
})

Given(/^I am not enrolled in the "([^"]+)" course$/, async function (_this: World, _course: string) {
  // This step asserts the absence of enrollment; the prerequisite step sets up
  // only the courses the user IS enrolled in, so any other course is implicitly not enrolled.
})

Given(/^I am not enrolled in any courses or degrees$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    enrollments: [],
    degreeEnrollments: []
  })
})

// ── View History Prerequisites ──

Given(/^I have viewed some shorts videos before$/, async function (this: World) {
  // Set up viewed video history via localStorage so the feed can prioritize unviewed content
  await this.page.evaluate(() => {
    localStorage.setItem('shorts-viewed', JSON.stringify([
      'bimbo-behavior-100-short-1',
      'bimbo-behavior-101-short-1'
    ]))
  })
})

// ── Full-screen Video Feed ──

Then(/^I see a full-screen vertical video feed$/, async function (this: World) {
  const feed = this.page.locator('[data-testid="shorts-feed"]')
  await expect(feed).toBeVisible({ timeout: 10000 })
})

Then(/^the first video is from a course or degree I am enrolled in$/, async function (this: World) {
  const firstVideo = this.page.locator('[data-testid="short-video"]').first()
  await expect(firstVideo).toBeVisible({ timeout: 10000 })
})

// ── Enrollment Filtering ──

Then(/^I see videos related to "([^"]+)"$/, async function (this: World, course: string) {
  const courseLabel = course.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const videoCourse = this.page.locator('[data-testid="short-video-course"]')
  await expect(videoCourse.first()).toContainText(courseLabel, { timeout: 10000 })
})

Then(/^I do not see videos related to "([^"]+)"$/, async function (this: World, course: string) {
  const courseLabel = course.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const videoCourse = this.page.locator('[data-testid="short-video-course"]')
  await expect(videoCourse).not.toContainText(courseLabel, { timeout: 10000 })
})

// ── Unviewed Video Prioritization ──

Then(/^unviewed videos appear before previously viewed videos$/, async function (this: World) {
  // The feed should surface unviewed content first; check that the first visible
  // video does not carry a "viewed" indicator
  const firstVideo = this.page.locator('[data-testid="short-video"]').first()
  await expect(firstVideo).not.toHaveAttribute('data-viewed', 'true', { timeout: 10000 })
})

// ── Scrolling ──

When(/^I scroll down$/, async function (this: World) {
  await this.page.locator('[data-testid="shorts-feed"]').evaluate((el: HTMLElement) => {
    el.scrollBy({ top: el.clientHeight, behavior: 'auto' })
  })
  await this.page.waitForTimeout(500)
})

Then(/^the next video in the feed appears$/, async function (this: World) {
  const videos = this.page.locator('[data-testid="short-video"]')
  const count = await videos.count()
  expect(count).toBeGreaterThanOrEqual(2)
})

// ── View Tracking ──

When(/^I watch a video for at least five seconds$/, async function (this: World) {
  // Wait for the minimum watch duration to trigger view tracking
  await this.page.waitForTimeout(5000)
})

Then(/^the video is marked as viewed$/, async function (this: World) {
  const viewedIds = await this.page.evaluate(() => {
    const raw = localStorage.getItem('shorts-viewed')
    return raw ? JSON.parse(raw) : []
  })
  expect(Array.isArray(viewedIds)).toBe(true)
  expect(viewedIds.length).toBeGreaterThan(0)
})

// ── Video Metadata ──

Then(/^each video displays its title$/, async function (this: World) {
  const titles = this.page.locator('[data-testid="short-video-title"]')
  await expect(titles.first()).toBeVisible({ timeout: 10000 })
  await expect(titles.first()).not.toHaveText('')
})

Then(/^each video displays the associated course name$/, async function (this: World) {
  const courseLabels = this.page.locator('[data-testid="short-video-course"]')
  await expect(courseLabels.first()).toBeVisible({ timeout: 10000 })
  await expect(courseLabels.first()).not.toHaveText('')
})

// ── Empty State ──

Then(/^I see a message prompting me to enroll in courses$/, async function (this: World) {
  const emptyState = this.page.locator('[data-testid="shorts-empty-state"]')
  await expect(emptyState).toBeVisible({ timeout: 10000 })
})

// ── Playback Controls ──

Then(/^I can pause and play the current video$/, async function (this: World) {
  const playPauseBtn = this.page.locator('[data-testid="short-play-pause"]')
  await expect(playPauseBtn).toBeVisible({ timeout: 10000 })
})

Then(/^I can mute and unmute the current video$/, async function (this: World) {
  const muteBtn = this.page.locator('[data-testid="short-mute"]')
  await expect(muteBtn).toBeVisible({ timeout: 10000 })
})
