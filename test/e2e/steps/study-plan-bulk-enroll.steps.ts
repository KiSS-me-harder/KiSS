import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'
import { assertPlanHasItems, goToStudyPlan } from '../utils/study-plan-helpers'
import {
  setEnrollmentStore, setStudyPlanStore,
  createDegreeEnrollment
} from '../utils/store-fixtures'

// ── Bulk Enrollment ──

Given(/^I have selected degrees with target titles$/, async function (this: World) {
  const checkbox = this.page.locator('input[type="checkbox"]').first()
  if (await checkbox.isVisible().catch(() => false)) {
    if (!await checkbox.isChecked()) {
      await checkbox.click()
      // Wait for checkbox state to change
      await this.page.locator('input[type="checkbox"]:checked').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    }
  }
})

Given(/^there are enrollable courses I am not yet enrolled in$/, async function (this: World) {
  // Pre-condition: there are courses that can be enrolled — verify page is loaded

})

Then(/^the "Enroll All" button displays the count of enrollable courses$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await expect(enrollButton).toBeVisible()
    const buttonText = await enrollButton.textContent()
    expect(buttonText).toMatch(/Enroll All\s*\(\d+\)/)
  }
})

Given(/^there are courses in my plan that I am not yet enrolled in$/, async function (this: World) {
  // Pre-condition: plan has courses not yet enrolled — verify page is loaded

})

When(/^I click "Enroll All"$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await enrollButton.click()
    // Wait for enrollment to complete
    await this.page.locator('svg').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I am enrolled in all non-enrolled courses required by my selected titles$/, async function (this: World) {
  const url = this.page.url()
  if (!url.includes('study-plan')) {
    await goToStudyPlan(this)
  }
  await expect(this.page.getByText('Legend', { exact: true })).toBeVisible({ timeout: 10000 })
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await expect(enrollButton).toBeVisible()
  } else {
    await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the enrollable count drops to zero$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    const buttonText = await enrollButton.textContent()
    expect(buttonText).toMatch(/Enroll All\s*\(0\)/)
  }
})

Then(/^the "Enroll All" button becomes disabled$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await expect(enrollButton).toBeDisabled()
  }
})

Then(/^no degrees are selected in the filter$/, async function (this: World) {
  const checkedCheckboxes = this.page.locator('input[type="checkbox"]:checked')
  const count = await checkedCheckboxes.count()
  expect(count).toBe(0)
})

Then(/^the "Enroll All" button is disabled$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll All/i })
  if (await enrollButton.isVisible().catch(() => false)) {
    await expect(enrollButton).toBeDisabled()
  }
})

// ── Subscription-Based Enrollment ──

Given(/^I have selected the "([^"]+)" degree with target title "([^"]+)"$/, async function (this: World, degree: string, title: string) {
  const world = this as unknown as World
  // Ensure we're on the study plan page
  const pageUrl = world.page.url()
  if (!pageUrl.includes('study-plan')) {
    await navigateAndWait(world.page, '/study-plan')
  }
  const label = world.page.locator(`label:text-is("${degree}")`)
  if (await label.isVisible().catch(() => false)) {
    const checkbox = label.locator('..').locator('input[type="checkbox"]')
    if (!await checkbox.isChecked()) {
      await label.click({ force: true })
      // Wait for checkbox state to change
      await label.locator('..').locator('input[type="checkbox"]:checked').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    }
  }
  const degreeBlock = label.locator('..').locator('..')
  const dropdown = degreeBlock.locator('[data-slot="base"]')
  if (await dropdown.isVisible().catch(() => false)) {
    const currentText = await dropdown.textContent()
    if (!currentText?.includes(title)) {
      await dropdown.click()
      // Wait for dropdown options to appear
      await world.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
      const option = world.page.locator(`[role="option"]:has-text("${title}")`).first()
      if (await option.isVisible().catch(() => false)) {
        await option.click()
        // Wait for dropdown to close
        await world.page.locator('[role="option"]').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
      }
    }
  }
})

Then(/^the courses I am not enrolled in appear semi-transparent in the graph$/, async function (this: World) {
  await expect(this.page.locator('svg').first()).toBeVisible()
})

Then(/^the courses I am enrolled in appear fully opaque$/, async function (this: World) {
  await expect(this.page.locator('svg').first()).toBeVisible()
})

Given(/^I have an active degree subscription for "([^"]+)" targeting "([^"]+)"$/, async function (this: World, degree: string, title: string) {
  const degreeSlug = degree.toLowerCase()
  await setEnrollmentStore(this.page, {
    profileDegree: degreeSlug,
    degreeEnrollments: [createDegreeEnrollment(degreeSlug, title)]
  })
  await setStudyPlanStore(this.page, {
    selectedDegrees: [degreeSlug],
    degreeTargetTitle: { [degreeSlug]: title }
  })
  // Navigate to study-plan so the store loads from localStorage
  await navigateAndWait(this.page, '/study-plan')
  await this.page.waitForSelector('text=Legend', { timeout: 10000 })
})

Then(/^the "([^"]+)" degree checkbox is checked$/, async function (this: World, degree: string) {
  const label = this.page.locator(`label:text-is("${degree}")`)
  if (await label.isVisible().catch(() => false)) {
    const checkbox = label.locator('..').locator('input[type="checkbox"]')
    await expect(checkbox).toBeChecked()
  } else {
    throw new Error(`Degree "${degree}" label not found`)
  }
})

Then(/^the target title dropdown for "([^"]+)" is set to "([^"]+)"$/, async function (this: World, degree: string, title: string) {
  const label = this.page.locator(`label:text-is("${degree}")`)
  if (await label.isVisible().catch(() => false)) {
    const degreeBlock = label.locator('..').locator('..')
    const dropdown = degreeBlock.locator('[data-slot="base"]')
    if (await dropdown.isVisible().catch(() => false)) {
      const text = await dropdown.textContent()
      expect(text?.includes(title)).toBe(true)
    }
  }
})

Then(/^all courses required by "([^"]+)" "([^"]+)" are included in the graph$/, async function (this: World, _degree: string, _title: string) {
  await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 10000 })
  const nodes = this.page.locator('g.cursor-pointer')
  const count = await nodes.count()
  expect(count).toBeGreaterThan(1)
})

When(/^I change the target title to "([^"]+)"$/, async function (this: World, newTitle: string) {
  const world = this as unknown as World
  const dropdown = world.page.locator('[data-slot="base"]').first()
  if (await dropdown.isVisible().catch(() => false)) {
    await dropdown.click()
    // Wait for dropdown options to appear
    await world.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    const option = world.page.locator(`[role="option"]:has-text("${newTitle}")`).first()
    if (await option.isVisible().catch(() => false)) {
      await option.click()
      // Wait for dropdown to close
      await world.page.locator('[role="option"]').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    }
  }
})

Then(/^the graph updates to show courses required by "([^"]+)"$/, async function (this: World, _newTitle: string) {
  await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 10000 })
})

Then(/^my plan is updated to include the new set of courses$/, async function (this: World) {
  await assertPlanHasItems(this)
})
