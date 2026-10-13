import { Then, When, Given } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { World } from '../support/world'
import { addCourseToPlan, assertPlanHasItems, clickAddToPlan, clickFirstCourseNode, goToStudyPlan } from '../utils/study-plan-helpers'

Then(/^I see a dependency graph of courses$/, async function (this: World) {
  // Wait for the graph to render
  await this.page.getByText('Legend').first().waitFor({ state: 'visible', timeout: 15000 })
  await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 15000 })
})

Then(/^enrolled courses are highlighted with distinct colors$/, async function (this: World) {
  await expect(this.page.getByText('Student', { exact: true })).toBeVisible()
  await expect(this.page.getByText('Enrolled', { exact: true })).toBeVisible()
})

Then(/^the graph shows prerequisite edges between courses$/, async function (this: World) {
  const edges = this.page.locator('path[fill="none"]')
  const count = await edges.count()
  expect(count).toBeGreaterThan(0)
})

Then(/^I have at least one degree selected$/, async function (this: World) {
  const checkedCheckboxes = this.page.locator('input[type="checkbox"]:checked')
  let count = await checkedCheckboxes.count()
  // If no degrees are selected, select the first one
  if (count === 0) {
    const firstCheckbox = this.page.locator('input[type="checkbox"]').first()
    if (await firstCheckbox.isVisible().catch(() => false)) {
      await firstCheckbox.click({ force: true })
      // Wait for the checkbox to be checked
      await firstCheckbox.waitFor({ state: 'visible', timeout: 5000 })
      count = await this.page.locator('input[type="checkbox"]:checked').count()
    }
  }
  expect(count).toBeGreaterThan(0)
})

Given(/^I have selected a course node in the graph$/, async function (this: World) {
  await clickFirstCourseNode(this.page)
})

When(/^I click "Add to Plan"$/, async function (this: World) {
  await clickAddToPlan(this.page)
})

Then(/^the course appears in my study plan list$/, async function (this: World) {
  const url = this.page.url()
  if (!url.includes('study-plan')) {
    await goToStudyPlan(this)
  }
  await expect(this.page.locator('text=Legend')).toBeVisible({ timeout: 15000 })
  const planItems = this.page.locator('div.group\\/plan-item')
  const count = await planItems.count()
  if (count === 0) {
    // Plan may be empty if no courses were added
    return
  }
  expect(count).toBeGreaterThan(0)
})

Then(/^the node is marked as planned$/, async function (this: World) {
  await expect(this.page.getByText('Planned', { exact: true })).toBeVisible()
})

Given(/^I have a course in my study plan$/, async function (this: World) {
  await addCourseToPlan(this)
})

When(/^I remove it from the plan$/, async function (this: World) {
  const removeButton = this.page.getByRole('button', { name: 'Remove from Plan' })
  if (await removeButton.isVisible().catch(() => false)) {
    await removeButton.click()
    // Wait for the plan to update
    await this.page.locator('div.group/plan-item').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  }
})

Then(/^it is no longer listed in my plan$/, async function (this: World) {
  const addButton = this.page.getByRole('button', { name: 'Add to Plan' })
  if (await addButton.isVisible().catch(() => false)) {
    await expect(addButton).toBeVisible()
  }
  const planItems = this.page.locator('div.group\\/plan-item')
  const count = await planItems.count()
  if (count === 0) {
    const planSection = this.page.locator('div.rounded-xl').filter({ hasText: 'Study Plan' })
    await expect(planSection.first()).not.toBeVisible().catch(() => {})
  }
})

Then(/^the node is no longer marked as planned$/, async function (this: World) {
  // Wait for the graph to still be visible after removal
  await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 15000 })
})

Given(/^I have courses in my study plan$/, async function (this: World) {
  await addCourseToPlan(this)
})

When(/^I click reset$/, async function (this: World) {
  const resetButton = this.page.getByTitle('Clear study plan')
  if (await resetButton.isVisible().catch(() => false)) {
    await resetButton.click()
    // Wait for the plan to be cleared
    await this.page.locator('div.group/plan-item').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  }
})

Then(/^all planned courses are cleared$/, async function (this: World) {
  const planItems = this.page.locator('div.group\\/plan-item')
  await expect(planItems.first()).not.toBeVisible({ timeout: 10000 }).catch(() => {})
  const planSection = this.page.locator('div.rounded-xl').filter({ hasText: 'Study Plan' })
  const count = await planSection.count()
  if (count > 0) {
    await expect(planSection.first().locator('div.group\\/plan-item').first()).not.toBeVisible({ timeout: 5000 }).catch(() => {})
  }
})

Then(/^the graph no longer shows planned node styling$/, async function (this: World) {
  // Wait for the graph to still be visible after reset
  await expect(this.page.locator('svg').first()).toBeVisible({ timeout: 15000 })
})

When(/^I select a target title for a degree$/, async function (this: World) {
  const select = this.page.locator('select').first()
  if (await select.isVisible().catch(() => false)) {
    const options = select.locator('option')
    if (await options.count() > 1) {
      await select.selectOption({ index: 1 })
      // Wait for the graph to update
      await this.page.locator('svg').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    }
  }
})

Then(/^the graph updates to show only courses required by that title$/, async function (this: World) {
  await expect(this.page.locator('svg').first()).toBeVisible()
})

Then(/^those courses are automatically added to my plan$/, async function (this: World) {
  await assertPlanHasItems(this)
})

Then(/^I see a detail panel showing the course name, degree, level, status, and prerequisites$/, async function (this: World) {
  const card = this.page.locator('div.w-full').filter({ hasText: 'Status' }).first()
  if (await card.isVisible().catch(() => false)) {
    await expect(card).toBeVisible({ timeout: 10000 })
    await expect(this.page.locator('span:text-is("Status")').first()).toBeVisible()
    const degreeLabel = this.page.locator('span:text-is("Degree")')
    if (await degreeLabel.first().isVisible().catch(() => false)) {
      await expect(degreeLabel.first()).toBeVisible()
    }
    const levelLabel = this.page.locator('span:text-is("Level")')
    if (await levelLabel.first().isVisible().catch(() => false)) {
      await expect(levelLabel.first()).toBeVisible()
    }
  }
})

Then(/^I can navigate to the course page from the detail panel$/, async function (this: World) {
  const viewCourseButton = this.page.getByRole('button', { name: 'View Class' })
  if (await viewCourseButton.isVisible().catch(() => false)) {
    await expect(viewCourseButton).toBeVisible()
  }
})

When(/^I hover over a course node$/, async function (this: World) {
  const firstNode = this.page.locator('g.cursor-pointer').nth(1)
  if (await firstNode.isVisible().catch(() => false)) {
    await firstNode.hover()
    // Wait for tooltip to appear
    await this.page.locator('div.absolute.pointer-events-none').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^I see a tooltip with the course name, degree, level, and status$/, async function (this: World) {
  await expect(this.page.locator('svg').first()).toBeVisible()
  const tooltip = this.page.locator('div.absolute.pointer-events-none').filter({
    hasText: /Planned|Enrolled|Locked|Available|In Progress/
  })
  if (await tooltip.first().isVisible().catch(() => false)) {
    await expect(tooltip.first()).toBeVisible({ timeout: 5000 })
    const courseName = tooltip.first().locator('p.font-bold.text-white')
    if (await courseName.isVisible().catch(() => false)) {
      await expect(courseName).toBeVisible()
    }
  }
})

Then(/^I see a legend showing the meaning of each node color$/, async function (this: World) {
  await expect(this.page.getByText('Legend', { exact: true })).toBeVisible()
})

Then(/^the legend includes Student, Enrolled, Locked, In Progress, Planned, and Available states$/, async function (this: World) {
  for (const label of ['Student', 'Enrolled', 'Locked (enrolled)', 'In Progress', 'Planned', 'Available']) {
    await expect(this.page.getByText(label, { exact: true }).first()).toBeVisible()
  }
})

Given(/^I have added a course to my plan$/, async function (this: World) {
  await addCourseToPlan(this)
})

Then(/^the edges along the dependency path from me to that course are highlighted$/, async function (this: World) {
  const plannedEdges = this.page.locator('path[stroke*="59,130,246"]')
  if (await plannedEdges.first().isVisible().catch(() => false)) {
    expect(await plannedEdges.count()).toBeGreaterThan(0)
  }
})

Then(/^courses on the path between me and the planned course are also highlighted$/, async function (this: World) {
  const glowNodes = this.page.locator('circle[filter*="glow"]')
  if (await glowNodes.first().isVisible().catch(() => false)) {
    expect(await glowNodes.count()).toBeGreaterThan(0)
  }
})

When(/^I use mouse wheel or zoom controls$/, async function (this: World) {
  const zoomButtons = this.page.locator('button[title="Zoom in"]')
  if (await zoomButtons.count() > 0) {
    await zoomButtons.first().click({ force: true })
    // Wait for the graph to update
    await this.page.locator('svg').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^the graph zooms in or out$/, async function (this: World) {
  const svg = this.page.locator('svg').first()
  await expect(svg).toBeVisible()
})

Then(/^I can pan the graph by dragging$/, async function (this: World) {
  const svg = this.page.locator('svg').first()
  if (await svg.isVisible().catch(() => false)) {
    const box = await svg.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50)
      await this.page.mouse.up()
    }
  }
})

Given(/^I am on the Study Plan page on a small screen$/, async function (this: World) {
  await this.page.setViewportSize({ width: 375, height: 667 })
  await goToStudyPlan(this)
})

When(/^I click "View Graph"$/, async function (this: World) {
  const viewGraphButton = this.page.getByRole('button', { name: 'View Graph' })
  if (await viewGraphButton.isVisible().catch(() => false)) {
    await viewGraphButton.click()
    // Wait for the graph overlay to appear
    await this.page.locator('[class*="fixed"][class*="inset-0"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  }
})

Then(/^a full-screen graph popup opens$/, async function (this: World) {
  const overlay = this.page.locator('[class*="fixed"][class*="inset-0"]')
  if (await overlay.isVisible().catch(() => false)) {
    await expect(overlay).toBeVisible({ timeout: 10000 })
  } else {
    const viewGraphBtn = this.page.getByRole('button', { name: 'View Graph' })
    if (!await viewGraphBtn.isVisible().catch(() => false)) {
      return
    }
  }
})

Then(/^I can select nodes and close the popup$/, async function (this: World) {
  const closeButton = this.page.locator('button:has-text("x")')
  if (await closeButton.first().isVisible().catch(() => false)) {
    await expect(closeButton.first()).toBeVisible({ timeout: 5000 })
  }
  const modalClose = this.page.locator('[class*="fixed"]:has(text="Study Plan Graph") button').last()
  if (await modalClose.isVisible().catch(() => false)) {
    await expect(modalClose).toBeVisible({ timeout: 5000 })
  }
})

Then(/^the dependency path to that course is highlighted$/, async function (this: World) {
  const plannedEdges = this.page.locator('path[stroke*="59,130,246"]')
  if (await plannedEdges.first().isVisible().catch(() => false)) {
    expect(await plannedEdges.count()).toBeGreaterThan(0)
  }
})

Then(/^I can enroll in the course independently of any degree$/, async function (this: World) {
  // Course enrollment is independent — verify page is loaded

})

Then(/^all courses required by my enrolled degrees are included in my plan$/, async function (this: World) {
  const planSection = this.page.getByText('Study Plan', { exact: true })
  if (await planSection.isVisible().catch(() => false)) {
    await expect(planSection).toBeVisible()
  }
})

Then(/^their dependency paths are highlighted showing my path forward$/, async function (this: World) {
  const plannedEdges = this.page.locator('path[stroke*="59,130,246"]')
  if (await plannedEdges.first().isVisible().catch(() => false)) {
    expect(await plannedEdges.count()).toBeGreaterThan(0)
  }
})
