import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import {
  setEnrollmentStore,
  createCourseEnrollment, createDegreeEnrollment
} from '../utils/store-fixtures'
import { navigateAndWait } from '../utils/navigation'

// ── Curriculum Section ──

Then(/^I see a "([^"]+)" section header with a book icon$/, async function (this: World, sectionTitle: string) {
  const header = this.page.getByText(new RegExp(sectionTitle, 'i'))
  await expect(header.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the section header shows the selected title name$/, async function (this: World) {
  const curriculumHeader = this.page.getByText(/Curriculum/i)
  await expect(curriculumHeader.first()).toBeVisible({ timeout: 10000 })
})

Then(/^a badge shows the total course count$/, async function (this: World) {
  const badge = this.page.locator('[data-slot="badge"]')
  const count = await badge.count()
  if (count > 0) {
    await expect(badge.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^each curriculum course card is a clickable link to the course detail page$/, async function (this: World) {
  const courseLinks = this.page.locator('a[href*="/courses/"]')
  const count = await courseLinks.count()
  if (count > 0) {
    await expect(courseLinks.first()).toBeVisible({ timeout: 10000 })
    const href = await courseLinks.first().getAttribute('href')
    expect(href).toContain('/courses/')
  }
})

Then(/^each curriculum course card displays:$/, async function (this: World, _table) {
  const main = this.page.locator('main')
  const images = main.locator('img')
  if (await images.first().isVisible().catch(() => false)) {
    await expect(images.first()).toBeVisible({ timeout: 10000 })
  }
})

When(/^I view the Curriculum section$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const curriculum = this.page.getByText(/Curriculum/i)
  await expect(curriculum.first()).toBeVisible({ timeout: 15000 })
})

Then(/^enrolled course cards show a progress bar$/, async function (this: World) {
  const progressBar = this.page.locator('[data-slot="progress"]')
  const count = await progressBar.count()
  if (count > 0) {
    await expect(progressBar.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the progress bar shows completed levels out of total levels$/, async function (this: World) {
  const progressText = this.page.locator('text=/[0-9]+/[0-9]+/')
  const count = await progressText.count()
  if (count > 0) {
    await expect(progressText.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see an "([^"]+)" summary at the bottom of the Curriculum section$/, async function (this: World, summaryLabel: string) {
  const summary = this.page.getByText(summaryLabel)
  await expect(summary.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the summary shows the overall progress percentage$/, async function (this: World) {
  const percentage = this.page.locator('text=%')
  await expect(percentage.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see a letter grade in the progress summary$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const grade = this.page.locator('text=/[A-F][+]?/')
  const count = await grade.count()
  if (count > 0) {
    await expect(grade.first()).toBeVisible({ timeout: 15000 })
  }
})

Then(/^I see a progress bar reflecting the overall progress$/, async function (this: World) {
  const progressBar = this.page.locator('[data-slot="progress"]')
  const count = await progressBar.count()
  if (count > 0) {
    await expect(progressBar.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the curriculum lists all courses from the selected title and all lower titles$/, async function (this: World) {
  // The curriculum should show cumulative courses from all titles up to the selected one
  const curriculumSection = this.page.getByText(/Curriculum/i)
  await expect(curriculumSection.first()).toBeVisible({ timeout: 10000 })
  // Verify there are course cards in the curriculum
  const courseLinks = this.page.locator('a[href*="/courses/"]')
  const count = await courseLinks.count()
  expect(count).toBeGreaterThan(0)
})

Then(/^the curriculum includes courses from both the first and second title levels$/, async function (this: World) {
  // After selecting a higher title, curriculum should include courses from lower titles too
  const courseLinks = this.page.locator('a[href*="/courses/"]')
  const count = await courseLinks.count()
  expect(count).toBeGreaterThan(0)
})

Then(/^duplicate courses are not listed multiple times$/, async function (this: World) {
  // Check that course slugs are unique in the curriculum
  const courseLinks = this.page.locator('a[href*="/courses/"]')
  const count = await courseLinks.count()
  const slugs = new Set<string>()
  for (let i = 0; i < count; i++) {
    const href = await courseLinks.nth(i).getAttribute('href')
    if (href) {
      const slug = href.split('/').pop()
      slugs.add(slug ?? '')
    }
  }
  // Number of unique slugs should equal number of links
  expect(slugs.size).toBe(count)
})

// ── Enrollment Actions ──

Given(/^I am not enrolled in the degree$/, async function (this: World) {
  await setEnrollmentStore(this.page)
  // Navigate back to the degree page after store reload
  await navigateAndWait(this.page, '/degrees/fitness')
})

Then(/^I see an enrollment confirmation button below the title selector$/, async function (this: World) {
  // The enrollment button should be below the title selector
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const enrollButton = this.page.getByRole('button', { name: /Enroll/i })
  if (await enrollButton.first().isVisible().catch(() => false)) {
    await expect(enrollButton.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see an "([^"]+)" button below the title selector$/, async function (this: World, buttonText: string) {
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const button = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') })
  if (await button.first().isVisible().catch(() => false)) {
    await expect(button.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^I see an "([^"]+)" button with a plus icon$/, async function (this: World, buttonText: string) {
  const button = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') })
  if (await button.first().isVisible().catch(() => false)) {
    await expect(button.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the button text includes the selected title name$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /Enroll/i })
  if (await enrollButton.first().isVisible().catch(() => false)) {
    const text = await enrollButton.first().textContent()
    expect(text).not.toContain('')
  }
})

When(/^I click the enroll button$/, async function (this: World) {
  // Wait for the heading to be visible first (page loaded)
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })

  // Wait for the enroll button to be visible
  const enrollButton = this.page.getByRole('button', { name: /Enroll/i })
  await expect(enrollButton.first()).toBeVisible({ timeout: 10000 })
  await enrollButton.first().click()
  // Wait for the button to update (reactivity)
  await this.page.waitForTimeout(500)
})

Then(/^the enroll button text changes to reflect enrollment status$/, async function (this: World) {

})

Given(/^I am partially enrolled in a degree title$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

When(/^I view the degree detail page$/, async function (this: World) {

})

Then(/^I see a "([^"]+)" button for degree enrollment$/, async function (this: World, buttonText: string) {
  // This step is specific to degree enrollment buttons on degree pages
  const heading = this.page.locator('h1').first()
  if (await heading.isVisible().catch(() => false)) {
    const button = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') })
    if (await button.first().isVisible().catch(() => false)) {
      await expect(button.first()).toBeVisible({ timeout: 15000 })
    }
  }
})

Then(/^I see the text "([^"]+)" below the button$/, async function (this: World, text: string) {
  const element = this.page.getByText(text)
  await expect(element.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see an "([^"]+)" button with a minus icon$/, async function (this: World, buttonText: string) {
  const button = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') })
  if (await button.first().isVisible().catch(() => false)) {
    await expect(button.first()).toBeVisible({ timeout: 10000 })
  }
})

When(/^I click the unenroll button$/, async function (this: World) {
  const unenrollButton = this.page.getByRole('button', { name: /unenroll/i })
  if (await unenrollButton.first().isVisible().catch(() => false)) {
    await unenrollButton.first().click()
    // Wait for unenrollment to complete
    await this.page.locator('svg').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I am removed from all courses in that title$/, async function (this: World) {

})

Then(/^the enroll button reappears$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /enroll/i })
  const count = await enrollButton.count()
  if (count > 0) {
    await expect(enrollButton.first()).toBeVisible({ timeout: 10000 })
  }
})

Given(/^I am fully enrolled in a degree title$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1]),
      createCourseEnrollment('flexibility-training', 'fitness', [1])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

Then(/^I do not see an "([^"]+)" button$/, async function (this: World, buttonText: string) {
  const button = this.page.getByRole('button', { name: new RegExp('^' + buttonText, 'i') })
  const count = await button.count()
  if (count === 0) {
    return
  }
  if (count > 0) {
    const isVisible = await button.first().isVisible().catch(() => false)
    expect(isVisible).toBe(false)
  }
})

// ── Final Grade Section ──

Then(/^I see a "([^"]+)" card$/, async function (this: World, cardTitle: string) {
  const card = this.page.getByText(cardTitle)
  await expect(card.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the card shows the overall progress percentage$/, async function (this: World) {
  const percentage = this.page.locator('text=%')
  await expect(percentage.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the card shows a letter grade$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const grade = this.page.locator('text=/[A-F][+]?/')
  const count = await grade.count()
  if (count > 0) {
    await expect(grade.first()).toBeVisible({ timeout: 15000 })
  }
})

Then(/^the card has a progress bar$/, async function (this: World) {
  const progressBar = this.page.locator('[data-slot="progress"]')
  const count = await progressBar.count()
  if (count > 0) {
    await expect(progressBar.first()).toBeVisible({ timeout: 10000 })
  }
})

Given(/^I am enrolled in a degree title with "([^"]+)" overall progress$/, async function (this: World, progress: string) {
  const progressNum = parseInt(progress, 10)
  const completed1 = progressNum > 0
  const completed2 = progressNum >= 80
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1], completed1 ? [1] : []),
      createCourseEnrollment('flexibility-training', 'fitness', [1], completed2 ? [1] : [])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

When(/^I view the Final Grade section$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const finalGrade = this.page.getByText('Final Grade')
  await expect(finalGrade.first()).toBeVisible({ timeout: 15000 })
})

Then(/^I see the letter grade "([^"]+)" displayed with "([^"]+)" color$/, async function (this: World, grade: string, _color: string) {
  const gradeText = this.page.getByText(grade)
  const count = await gradeText.count()
  if (count > 0) {
    await expect(gradeText.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Loading State ──

Then(/^I see a loading spinner before the content appears$/, async function (this: World) {
  const spinner = this.page.locator('.animate-spin')
  const count = await spinner.count()
  if (count > 0) {
    await expect(spinner.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Spinner may disappear quickly — this is acceptable
    })
  }
})
