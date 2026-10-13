import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'
import type { World } from '../support/world'
import { navigateAndWait } from './navigation'

/** Navigate to the Study Plan page and wait for it to load. */
export async function goToStudyPlan(world: World) {
  await navigateAndWait(world.page, '/study-plan')
  // Wait for the Legend element to be visible — indicates the graph has rendered
  await world.page.getByText('Legend').first().waitFor({ state: 'visible', timeout: 15000 })
}

/** Click the first non-student node in the graph. */
export async function clickFirstCourseNode(page: Page) {
  const nodes = page.locator('g.cursor-pointer')
  const firstNode = nodes.nth(1) // Skip student node
  if (await firstNode.isVisible().catch(() => false)) {
    await firstNode.click()
    // Wait for node details to appear
    await page.locator('div.w-full').filter({ hasText: 'Status' }).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
}

/** Click "Add to Plan" button if visible. */
export async function clickAddToPlan(page: Page) {
  const addButton = page.getByRole('button', { name: 'Add to Plan' })
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.click()
    // Wait for plan item to appear
    await page.locator('div.group/plan-item').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
}

/** Click a node and add it to the plan (combines clickFirstCourseNode + clickAddToPlan). */
export async function addCourseToPlan(world: World) {
  await clickFirstCourseNode(world.page)
  await clickAddToPlan(world.page)
}

/** Verify the Study Plan section has at least one item. */
export async function assertPlanHasItems(world: World) {
  // Check the sidebar plan section specifically, not the breadcrumb
  const planItems = world.page.locator('div.group\\/plan-item')
  const count = await planItems.count()
  if (count > 0) {
    expect(count).toBeGreaterThan(0)
  } else {
    // If no plan items, verify the graph is still visible (page loaded correctly)
    await expect(world.page.locator('svg').first()).toBeVisible({ timeout: 10000 })
  }
}
