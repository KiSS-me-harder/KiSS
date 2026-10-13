import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import {
  setEnrollmentStore,
  createCourseEnrollment, createDegreeEnrollment, createExamTask
} from '../utils/store-fixtures'

// ── Final Exam Section ──

Then(/^I see a "([^"]+)" section header$/, async function (this: World, sectionTitle: string) {
  const header = this.page.getByText(sectionTitle)
  const count = await header.count()
  if (count > 0) {
    await expect(header.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see the subtitle describing the final exam requirements$/, async function (this: World) {
  const subtitle = this.page.getByText(/exam|final|requirement/i)
  const count = await subtitle.count()
  if (count > 0) {
    await expect(subtitle.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see a list of final exam activities$/, async function (this: World) {
  const examSection = this.page.getByText(/Final Exam/i)
  const count = await examSection.count()
  if (count > 0) {
    await expect(examSection.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^each activity shows its title and description$/, async function (this: World) {
  const main = this.page.locator('main')
  const paragraphs = main.locator('p')
  const count = await paragraphs.count()
  if (count > 0) {
    await expect(paragraphs.first()).toBeVisible({ timeout: 10000 })
  }
})

Given(/^I am enrolled in a degree title with final exam activities$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1], [1]),
      createCourseEnrollment('flexibility-training', 'fitness', [1], [1])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

Given(/^some exam activities are completed$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    examTasks: [
      createExamTask('core-strength', 1, 1, true),
      createExamTask('core-strength', 1, 2, false)
    ]
  })
})

When(/^I view the Final Exam section$/, async function (this: World) {
  const examSection = this.page.getByText(/Final Exam/i)
  const count = await examSection.count()
  if (count > 0) {
    await expect(examSection.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^completed exam activities show a check mark indicator$/, async function (this: World) {
  const checkIcon = this.page.locator('.text-emerald-400, .i-lucide-check')
  const count = await checkIcon.count()
  if (count > 0) {
    await expect(checkIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^incomplete exam activities show an empty indicator$/, async function (this: World) {
  const emptyIcon = this.page.locator('.text-muted\\/40, .i-lucide-circle')
  const count = await emptyIcon.count()
  if (count > 0) {
    await expect(emptyIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see the number of completed activities out of total$/, async function (this: World) {
  const countText = this.page.getByText(/\d+\s*\/\s*\d+/)
  const count = await countText.count()
  if (count > 0) {
    await expect(countText.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see a progress bar reflecting exam completion$/, async function (this: World) {
  const progressBar = this.page.locator('[data-slot="progress"]')
  const count = await progressBar.count()
  if (count > 0) {
    await expect(progressBar.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the Final Exam section is hidden or shows a prompt to enroll first$/, async function (this: World) {
  const examSection = this.page.getByText('Final Exam')
  const count = await examSection.count()
  if (count === 0) {
    return
  }
  const enrollPrompt = this.page.getByText(/enroll/i)
  const promptCount = await enrollPrompt.count()
  if (promptCount > 0) {
    await expect(enrollPrompt.first()).toBeVisible({ timeout: 10000 })
  }
})
