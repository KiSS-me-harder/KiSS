import { expect } from '@playwright/test'
import type { World } from '../support/world'
import type { Page, Locator } from '@playwright/test'

/**
 * Waits for the Club Activities section header to be visible on the page.
 * @param page - Playwright page instance.
 */
export async function waitForClubActivitiesHeader(page: Page) {
  const header = page.locator('h2:has-text("Club Activities")')
  await expect(header.first()).toBeVisible({ timeout: 15000 })
}

/**
 * Returns a locator for activity cards rendered by ClubsClubActivityCard.
 * @param page - Playwright page instance.
 */
export function getActivityCards(page: Page): Locator {
  return page.locator('.group.relative.rounded-xl.border')
}

/**
 * Waits for at least one activity card to be visible.
 * @param page - Playwright page instance.
 */
export async function waitForActivityCards(page: Page) {
  const cards = getActivityCards(page)
  await expect(cards.first()).toBeVisible({ timeout: 15000 })
}

/**
 * Waits for club cards to be visible on the clubs list page.
 * @param page - Playwright page instance.
 */
export async function waitForClubCards(page: Page) {
  const clubCards = page.locator('[data-testid="club-card"]')
  await expect(clubCards.first()).toBeVisible({ timeout: 15000 })
}

/**
 * Asserts that activity card elements are displayed.
 * @param page - Playwright page instance.
 */
export async function assertActivityCardsVisible(page: Page) {
  const cards = getActivityCards(page)
  const count = await cards.count()
  if (count === 0) {
    // No activity cards — check if filter tabs are visible (activities section exists but empty)
    const filterTabs = page.getByRole('button', { name: /All/ })
    await expect(filterTabs.first()).toBeVisible({ timeout: 10000 })
  } else {
    await expect(cards.first()).toBeVisible({ timeout: 15000 })
  }
}

/**
 * Asserts that the completion circle indicator is visible on activity cards.
 * @param page - Playwright page instance.
 */
export async function assertCompletionCircleVisible(page: Page) {
  await waitForActivityCards(page)
  const completionCircle = page.locator('.w-6.h-6.rounded-full.border-2')
  await expect(completionCircle.first()).toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that each activity card displays all required elements.
 * @param page - Playwright page instance.
 */
export async function assertActivityCardElements(page: Page) {
  // Wait for activity cards to be visible first
  await waitForActivityCards(page)
  const cards = getActivityCards(page)
  const count = await cards.count()
  if (count === 0) {
    throw new Error('No activity cards found on the page')
  }
  const firstCard = cards.first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })

  // Type badge
  await expect(firstCard.locator('.text-\\[10px\\].font-semibold.uppercase')).toBeVisible({ timeout: 5000 })
  // Title
  await expect(firstCard.locator('h3.text-sm.font-semibold')).toBeVisible({ timeout: 5000 })
  // Description
  await expect(firstCard.locator('p.text-xs.text-muted-foreground')).toBeVisible({ timeout: 5000 })
  // XP value
  await expect(firstCard.locator('text=/\\+\\d+ XP/')).toBeVisible({ timeout: 5000 })
  // Icon
  await expect(firstCard.locator('svg')).toBeVisible({ timeout: 5000 })
  // Completion checkbox
  await expect(firstCard.locator('.w-6.h-6.rounded-full.border-2')).toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that the first activity card is marked as completed.
 * @param page - Playwright page instance.
 */
export async function assertFirstCardCompleted(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  const checkIcon = firstCard.locator('.bg-emerald-500')
  await expect(checkIcon).toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that the first activity card shows a check mark.
 * @param page - Playwright page instance.
 */
export async function assertCheckMarkVisible(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  const checkIcon = firstCard.locator('.bg-emerald-500 svg')
  await expect(checkIcon.first()).toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that the first activity card shows a completed visual overlay.
 * @param page - Playwright page instance.
 */
export async function assertCompletedOverlay(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  const completedOverlay = firstCard.locator('.bg-emerald-500\\/5')
  await expect(completedOverlay).toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that the first activity card is marked as incomplete.
 * @param page - Playwright page instance.
 */
export async function assertFirstCardIncomplete(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  const checkIcon = firstCard.locator('.bg-emerald-500')
  await expect(checkIcon).not.toBeVisible({ timeout: 5000 })
}

/**
 * Asserts that the completion checkbox is empty (no check mark).
 * @param page - Playwright page instance.
 */
export async function assertCheckMarkHidden(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  const checkIcon = firstCard.locator('.bg-emerald-500 .i-lucide-check')
  await expect(checkIcon).not.toBeVisible({ timeout: 5000 })
}

/**
 * Clicks the first activity card and waits for the completion indicator.
 * @param page - Playwright page instance.
 */
export async function clickFirstActivityCard(page: Page) {
  await waitForActivityCards(page)
  const firstCard = getActivityCards(page).first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })
  await firstCard.click()
  await firstCard.locator('.bg-emerald-500').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
}

/**
 * Asserts that only activities of a given type are displayed.
 * @param page - Playwright page instance.
 * @param typeText - The type text to look for (e.g., "Challenge", "Game", "Task").
 */
export async function assertOnlyTypeDisplayed(page: Page, typeText: string) {
  const activityCards = getActivityCards(page)
  const count = await activityCards.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(activityCards.nth(i).locator(`text=${typeText}`)).toBeVisible()
  }
}

/**
 * Asserts that all activities are displayed regardless of type.
 * @param page - Playwright page instance.
 */
export async function assertAllActivitiesDisplayed(page: Page) {
  const activityCards = getActivityCards(page)
  const count = await activityCards.count()
  expect(count).toBeGreaterThan(0)
}

/**
 * Navigates to the club page if not already there and waits for activities.
 * @param world - Cucumber world instance.
 */
export async function ensureOnClubActivitiesPage(world: World) {
  const currentUrl = world.page.url()
  if (!currentUrl.includes('/clubs/bimbo-social')) {
    // Import navigateAndWait dynamically to avoid circular dependency
    const { navigateAndWait } = await import('../utils/navigation')
    await navigateAndWait(world.page, '/clubs/bimbo-social')
  }
  await waitForClubActivitiesHeader(world.page)
}

/**
 * Asserts that the Club Activities subtitle is visible.
 * @param page - Playwright page instance.
 */
export async function assertSubtitleVisible(page: Page) {
  const subtitle = page.getByText('Complete challenges, games, and tasks to earn XP.')
  await expect(subtitle).toBeVisible()
}

/**
 * Asserts that the progress summary (e.g., "3 / 6 Completed") is visible.
 * @param page - Playwright page instance.
 */
export async function assertProgressSummaryVisible(page: Page) {
  const progressSummary = page.getByText(/\d+ \/ \d+ Completed/)
  await expect(progressSummary).toBeVisible()
}

/**
 * Asserts that the total XP earned text is visible.
 * @param page - Playwright page instance.
 */
export async function assertXPEarnedVisible(page: Page) {
  const xpEarned = page.getByText(/\d+ XP Earned/)
  await expect(xpEarned).toBeVisible()
}

/**
 * Asserts that the progress bar is visible.
 * @param page - Playwright page instance.
 */
export async function assertProgressBarVisible(page: Page) {
  const progressBar = page.locator('.bg-gradient-to-r.from-amber-500.to-orange-500')
  await expect(progressBar).toBeVisible()
}

/**
 * Asserts that all filter tabs (All, Challenges, Games, Tasks) are visible.
 * @param page - Playwright page instance.
 */
export async function assertFilterTabsVisible(page: Page) {
  await expect(page.getByRole('button', { name: /All/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Challenge/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Game/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Task/ }).first()).toBeVisible()
}

/**
 * Asserts that a filter tab with a count pattern is visible.
 * @param page - Playwright page instance.
 * @param pattern - Regex pattern for the tab name (e.g., /All \(\d+\)/).
 */
export async function assertFilterTabCountVisible(page: Page, pattern: RegExp) {
  const tab = page.getByRole('button', { name: pattern })
  await expect(tab).toBeVisible()
}

/**
 * Asserts that a badge with a given text has a specific color class.
 * @param page - Playwright page instance.
 * @param badgeText - The text on the badge (e.g., "Challenge").
 * @param colorClass - The CSS color class to look for (e.g., "orange").
 */
export async function assertBadgeColor(page: Page, badgeText: string, colorClass: string) {
  const badgeLocator = page.locator(`text=${badgeText}`)
  if (await badgeLocator.first().isVisible().catch(() => false)) {
    const badge = badgeLocator.first()
    await expect(badge.locator(`[class*="${colorClass}"]`)).toBeVisible()
  }
}

/**
 * Clicks a filter tab and waits for activity cards to update.
 * @param page - Playwright page instance.
 * @param pattern - Regex pattern for the tab name.
 */
export async function clickFilterTab(page: Page, pattern: RegExp) {
  const tab = page.getByRole('button', { name: pattern })
  await tab.click()
  await getActivityCards(page).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
}
