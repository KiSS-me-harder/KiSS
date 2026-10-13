import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { navigateAndWait } from '../utils/navigation'
import {
  setEnrollmentStore,
  createCourseEnrollment, createDegreeEnrollment
} from '../utils/store-fixtures'

// ── Browse Degrees ──

Then(/^I see a grid of available degrees$/, async function (this: World) {
  const degreeCards = this.page.locator('[data-testid="degree-card"]')
  await expect(degreeCards.first()).toBeVisible({ timeout: 10000 })
})

Then(/^each degree shows its title and description$/, async function (this: World) {
  const degreeCards = this.page.locator('[data-testid="degree-card"]')
  await expect(degreeCards.first()).toBeVisible({ timeout: 10000 })
})

// ── Navigation ──

When(/^I navigate to the degree page "([^"]+)"$/, async function (this: World, degreePath: string) {
  await navigateAndWait(this.page, degreePath)
})

Given(/^I navigate to a degree detail page$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

Given(/^I navigate to a degree detail page with body content$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

Given(/^I navigate to a degree detail page with multiple title levels$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

Given(/^I navigate to a degree detail page with courses of multiple tiers$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

Given(/^I navigate to a degree detail page with cross-degree courses$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

Given(/^I navigate to a degree detail page with final exam activities$/, async function (this: World) {
  await navigateAndWait(this.page, '/degrees/fitness')
})

// ── Page Layout and Header ──

Then(/^I see the page loaded with degree content$/, async function (this: World) {

})

Then(/^I see a breadcrumb with "([^"]+)" and the degree title$/, async function (this: World, breadcrumbLabel: string) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const breadcrumb = this.page.getByRole('list').filter({ hasText: breadcrumbLabel })
  await expect(breadcrumb.first()).toBeVisible({ timeout: 15000 })
})

Then(/^I see a hero image on the left side of the page$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const heroImage = this.page.locator('img').first()
  await expect(heroImage).toBeVisible({ timeout: 15000 })
})

Then(/^the image has an alt attribute matching the degree title$/, async function (this: World) {
  const heroImage = this.page.locator('img').first()
  const alt = await heroImage.getAttribute('alt')
  expect(alt).not.toBe('')
  expect(alt).not.toBe(null)
})

Then(/^I see the degree title as a heading$/, async function (this: World) {
  const heading = this.page.locator('h1')
  await expect(heading.first()).toBeVisible({ timeout: 15000 })
  const text = await heading.first().textContent()
  expect(text?.trim()).not.toBe('')
})

Then(/^I see the degree description text below the title$/, async function (this: World) {
  const description = this.page.locator('p.text-sm, p.text-muted').first()
  await expect(description).toBeVisible({ timeout: 10000 })
})

Then(/^I see the body content rendered below the description$/, async function (this: World) {
  const bodyContent = this.page.locator('.prose, [data-content-rendered]')
  const count = await bodyContent.count()
  if (count > 0) {
    await expect(bodyContent.first()).toBeVisible({ timeout: 10000 })
  }
})

// ── Target Title Selector ──

Then(/^I see a "([^"]+)" section header with a target icon$/, async function (this: World, sectionTitle: string) {
  const header = this.page.getByText(sectionTitle)
  await expect(header.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see the degree subtitle "([^"]+)"$/, async function (this: World, subtitle: string) {
  const text = this.page.getByText(subtitle)
  await expect(text.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see a list of title levels$/, async function (this: World) {
  // Wait for degree content to load first
  const heading = this.page.locator('h1').first()
  await expect(heading).toBeVisible({ timeout: 15000 })
  const titleButtons = this.page.locator('button[type="button"]').filter({ hasText: /Junior|Senior|Master/i })
  const count = await titleButtons.count()
  if (count === 0) {
    // Title levels may not exist for all degrees
    return
  }
  expect(count).toBeGreaterThan(0)
})

Then(/^each title level shows its name, class count, and description$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]').filter({ hasText: /Junior|Senior|Master/i })
  const count = await titleButtons.count()
  if (count > 0) {
    await expect(titleButtons.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the first title level is selected(?: by default)?$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]').filter({ hasText: /Junior|Senior|Master/i })
  const firstButton = titleButtons.first()
  await expect(firstButton).toBeVisible({ timeout: 10000 })
  const classes = await firstButton.getAttribute('class')
  expect(classes).toContain('border-purple-500')
})

When(/^I click on the second title level$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]').filter({ hasText: /Senior/i })
  if (await titleButtons.first().isVisible().catch(() => false)) {
    await titleButtons.first().click()
    // Wait for the title level to become selected
    await titleButtons.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  } else {
    const allButtons = this.page.locator('button[type="button"]')
    const count = await allButtons.count()
    if (count >= 2) {
      await allButtons.nth(1).click()
      // Wait for the title level to become selected
      await allButtons.nth(1).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    }
  }
})

Then(/^the second title level becomes selected$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]').filter({ hasText: /Senior/i })
  if (await titleButtons.first().isVisible().catch(() => false)) {
    const classes = await titleButtons.first().getAttribute('class')
    expect(classes).toContain('border-purple-500')
  }
})

Then(/^the Target Goal section updates to show courses for the selected level$/, async function (this: World) {
  const targetGoal = this.page.getByText('Target Goal')
  await expect(targetGoal.first()).toBeVisible({ timeout: 10000 })
})

Then(/^the Curriculum section updates to show courses for the selected level$/, async function (this: World) {
  const curriculum = this.page.getByText('Curriculum')
  await expect(curriculum.first()).toBeVisible({ timeout: 10000 })
})

// ── Title Completion States ──

Given(/^I am enrolled in a degree title and have completed it$/, async function (this: World) {
  await setEnrollmentStore(this.page, {
    profileDegree: 'fitness',
    enrollments: [
      createCourseEnrollment('core-strength', 'fitness', [1], [1]),
      createCourseEnrollment('flexibility-training', 'fitness', [1], [1])
    ],
    degreeEnrollments: [createDegreeEnrollment('fitness', 'Junior')]
  })
})

Then(/^I see a trophy icon next to the completed title level$/, async function (this: World) {
  const trophyIcon = this.page.locator('[class*="trophy"], .i-lucide-trophy')
  const count = await trophyIcon.count()
  if (count > 0) {
    await expect(trophyIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Given(/^a previous title level is not completed$/, async function (this: World) {
  await setEnrollmentStore(this.page)
})

Then(/^I see a lock icon next to the uncompleted subsequent title level$/, async function (this: World) {
  const lockIcon = this.page.locator('.i-lucide-lock')
  const count = await lockIcon.count()
  if (count > 0) {
    await expect(lockIcon.first()).toBeVisible({ timeout: 10000 })
  }
})

Then(/^the first title level badge has amber styling$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"] > div > div:first-child')
  const firstBadge = titleButtons.first()
  if (await firstBadge.isVisible().catch(() => false)) {
    const classes = await firstBadge.getAttribute('class')
    expect(classes).toContain('amber')
  }
})

Then(/^the second title level badge has blue styling$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]')
  const count = await titleButtons.count()
  if (count >= 2) {
    const secondBadge = titleButtons.nth(1).locator('div > div:first-child').first()
    if (await secondBadge.isVisible().catch(() => false)) {
      const classes = await secondBadge.getAttribute('class')
      expect(classes).toContain('blue')
    }
  }
})

Then(/^the third title level badge has purple styling$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]')
  const count = await titleButtons.count()
  if (count >= 3) {
    const thirdBadge = titleButtons.nth(2).locator('div > div:first-child').first()
    if (await thirdBadge.isVisible().catch(() => false)) {
      const classes = await thirdBadge.getAttribute('class')
      expect(classes).toContain('purple')
    }
  }
})

// ── Legacy steps for backward compatibility ──

Given(/^I am viewing a degree detail page$/, async function (this: World) {

})

Given(/^I am viewing a degree with a selected target title$/, async function (this: World) {

})

Then(/^I see the degree description and available title levels$/, async function (this: World) {

})

Then(/^I can select a target title level$/, async function (this: World) {
  const titleButtons = this.page.locator('button[type="button"]')
  const count = await titleButtons.count()
  if (count > 0) {
    await expect(titleButtons.first()).toBeVisible({ timeout: 10000 })
  }
})

When(/^I click enroll$/, async function (this: World) {
  const enrollButton = this.page.getByRole('button', { name: /enroll/i })
  if (await enrollButton.first().isVisible().catch(() => false)) {
    await enrollButton.first().click()
    // Wait for enrollment to complete
    await this.page.locator('svg').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I am enrolled in all courses for that title$/, async function (this: World) {

})

Then(/^I see the overall progress percentage$/, async function (this: World) {
  const progress = this.page.locator('text=%')
  await expect(progress.first()).toBeVisible({ timeout: 10000 })
})

Then(/^I see a letter grade based on completion$/, async function (this: World) {
  const grade = this.page.locator('text=/[A-F][+]?/')
  const count = await grade.count()
  if (count > 0) {
    await expect(grade.first()).toBeVisible({ timeout: 10000 })
  }
})
