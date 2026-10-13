import type { Locator, Page } from '@playwright/test'
import type { CourseEnrollment } from '~/types/enrollment'
import { setEnrollmentStore } from '../utils/store-fixtures'

/**
 * Creates a minimal enrollment data object for injecting into localStorage.
 * @param _enrollments - Array of course enrollments to set up.
 * @returns Complete enrollment data object.
 * @deprecated Use `buildEnrollmentData` from `store-fixtures.ts` instead.
 */
export function createEnrollmentData(_enrollments: CourseEnrollment[]) {
  return setEnrollmentStore as unknown as (enrollments: CourseEnrollment[]) => typeof enrollments
}

/**
 * Injects enrollment data into localStorage and reloads the page.
 * @param page - Playwright page instance.
 * @param enrollments - Array of course enrollments.
 */
export async function injectEnrollments(page: Page, enrollments: CourseEnrollment[]) {
  await setEnrollmentStore(page, { enrollments })
}

/**
 * Injects enrollment data where a course has an unmet prerequisite.
 * @param page - Playwright page instance.
 * @param courseSlug - The course slug with the unmet prerequisite.
 * @param prereqSlug - The prerequisite course slug.
 */
export async function injectUnmetPrerequisite(page: Page, courseSlug: string, prereqSlug: string) {
  await injectEnrollments(page, [
    {
      slug: courseSlug,
      courseName: courseSlug,
      degree: 'bimbo',
      enrolledAt: Date.now(),
      levels: [
        { level: 100, completed: false },
        { level: 200, completed: false }
      ]
    },
    {
      slug: prereqSlug,
      courseName: prereqSlug,
      degree: 'bimbo',
      enrolledAt: Date.now(),
      levels: [
        { level: 100, completed: false }
      ]
    }
  ])
}

/**
 * Finds a lock badge on a course card matching the given course slug.
 * @param page - Playwright page instance.
 * @param courseSlug - The course slug to search for.
 * @returns The lock badge locator or null if not found.
 */
export async function findLockBadgeForCourse(page: Page, courseSlug: string): Promise<Locator | null> {
  const courseCards = page.locator('.group\\/card')
  const cards = await courseCards.all()
  for (const card of cards) {
    const cardText = await card.textContent()
    if (cardText && cardText.toLowerCase().includes(courseSlug)) {
      const badge = card.locator('[data-lock-badge="true"]')
      if (await badge.count() > 0) {
        return badge
      }
    }
  }
  return null
}

/**
 * Verifies that course cards with unmet prerequisites have blurred images.
 * @param page - Playwright page instance.
 */
export async function verifyBlurredCourseCards(page: Page) {
  const blurredImages = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.group\\/card img')
    let count = 0
    for (let i = 0; i < imgs.length; i++) {
      if (imgs[i]?.className.includes('blur')) count++
    }
    return count
  })
  if (blurredImages === 0) {
    const allClasses = await page.evaluate(() => {
      const imgs = document.querySelectorAll('.group\\/card img')
      return Array.from(imgs).map(img => img.className).join('; ')
    })
    throw new Error(`Expected at least one blurred course card image, but found none. Image classes: ${allClasses}`)
  }
}

/**
 * Verifies that course titles remain visible on blurred cards.
 * @param page - Playwright page instance.
 */
export async function verifyTitlesVisible(page: Page) {
  const titles = page.locator('.group\\/card p.text-white')
  const count = await titles.count()
  if (count === 0) {
    throw new Error('No course title elements found on the page')
  }
  const visibleCount = await page.evaluate(() => {
    const titles = document.querySelectorAll('.group\\/card p.text-white')
    let visible = 0
    for (let i = 0; i < titles.length; i++) {
      const rect = titles[i]?.getBoundingClientRect()
      if (rect && rect.width > 0 && rect.height > 0) visible++
    }
    return visible
  })
  if (visibleCount === 0) {
    throw new Error('No visible course titles found — titles should remain visible even on blurred cards')
  }
}

/**
 * Verifies that a lock badge is displayed with a lock icon.
 * @param page - Playwright page instance.
 */
export async function verifyLockBadgeDisplayed(page: Page) {
  const lockBadgeCount = await page.locator('[data-lock-badge="true"]').count()
  if (lockBadgeCount === 0) {
    throw new Error('Expected at least one lock badge on course cards with unmet prerequisites, but found none')
  }
  const hasLockIcon = await page.locator('[data-lock-badge="true"] [name="i-lucide-lock"]').count()
  if (hasLockIcon === 0) {
    throw new Error('Lock badge found but missing lock icon inside')
  }
}

/**
 * Verifies that hovering a blurred card removes the blur.
 * @param page - Playwright page instance.
 */
export async function verifyHoverRemovesBlur(page: Page) {
  const hasHoverBlurClass = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.group\\/card img')
    for (let i = 0; i < imgs.length; i++) {
      const classes = imgs[i]?.className || ''
      if (classes.includes('blur') && classes.includes('group-hover')) {
        return true
      }
    }
    return false
  })
  if (!hasHoverBlurClass) {
    throw new Error('Blurred course card images should have a group-hover class to remove blur on hover')
  }
}

/**
 * Verifies that locked course cards are still clickable and navigable.
 * @param page - Playwright page instance.
 */
export async function verifyCardClickable(page: Page) {
  const courseLinks = page.locator('[data-testid="course-card"]')
  const count = await courseLinks.count()
  if (count === 0) {
    throw new Error('No course card links found on the page')
  }
  for (let i = 0; i < count; i++) {
    const link = courseLinks.nth(i)
    const href = await link.getAttribute('href')
    if (!href || !href.includes('/courses/')) {
      throw new Error(`Course card link at index ${i} does not have a valid course href: ${href}`)
    }
    const isDisabled = await link.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true')
    if (isDisabled) {
      throw new Error(`Course card link at index ${i} is disabled — locked courses should still be navigable`)
    }
  }
}

/**
 * Verifies that lock badges display a lockpad icon.
 * @param page - Playwright page instance.
 */
export async function verifyLockBadgeIcon(page: Page) {
  const lockBadges = page.locator('[data-lock-badge="true"]')
  const count = await lockBadges.count()
  if (count === 0) {
    throw new Error('No lock badges found on the page')
  }
  const lockIcons = page.locator('[data-lock-badge="true"] [name="i-lucide-lock"], [data-lock-badge="true"] svg')
  const iconCount = await lockIcons.count()
  if (iconCount === 0) {
    throw new Error('Lock badges found but none contain a lock icon')
  }
}

/**
 * Verifies lock badge abbreviated prerequisite labels.
 * @param page - Playwright page instance.
 */
export async function verifyLockBadgeAbbreviatedLabel(page: Page) {
  const lockBadges = page.locator('[data-lock-badge="true"]')
  const count = await lockBadges.count()
  if (count === 0) {
    throw new Error('No lock badges found on the page')
  }
  const badgeTexts: string[] = []
  for (let i = 0; i < count; i++) {
    const text = await lockBadges.nth(i).textContent()
    if (text) badgeTexts.push(text.trim())
  }
  const abbreviatedLabels = badgeTexts.filter(t => /[A-Z]{2,}\d{3}/.test(t))
  if (abbreviatedLabels.length === 0) {
    throw new Error(`Lock badges found but none display abbreviated prerequisite labels. Badge texts: ${badgeTexts.join(', ')}`)
  }
}

/**
 * Verifies that each lock badge functions as a link to a prerequisite course.
 * @param page - Playwright page instance.
 */
export async function verifyLockBadgeIsLink(page: Page) {
  const lockBadges = page.locator('[data-lock-badge="true"]')
  const count = await lockBadges.count()
  if (count === 0) {
    throw new Error('No lock badges found on the page')
  }
  let foundLink = false
  for (let i = 0; i < count; i++) {
    const badge = lockBadges.nth(i)
    const isLink = await badge.evaluate(el => el.tagName === 'A' || el.closest('a') !== null)
    if (isLink) {
      const href = await badge.evaluate((el) => {
        const a = el.tagName === 'A' ? el : el.closest('a')
        return a?.getAttribute('href') || ''
      })
      if (href && href.includes('/courses/')) {
        foundLink = true
        break
      }
    }
  }
  if (!foundLink) {
    throw new Error('Lock badges found but none function as links to prerequisite course pages')
  }
}

export async function verifyLockBadgeLinksToCourse(page: Page, prerequisiteSlug: string) {
  const lockBadges = page.locator('[data-lock-badge="true"]')
  const count = await lockBadges.count()
  if (count === 0) {
    throw new Error('No lock badges found on the page to click')
  }
  let found = false
  for (let i = 0; i < count; i++) {
    const badge = lockBadges.nth(i)
    const href = await badge.evaluate((el) => {
      const a = el.tagName === 'A' ? el : el.closest('a')
      return a?.getAttribute('href') || ''
    })
    if (href && href.includes(prerequisiteSlug)) {
      found = true
      break
    }
  }
  if (!found) {
    throw new Error(`No lock badge found that links to "${prerequisiteSlug}" course page`)
  }
}
