import type { Page } from 'playwright-core'

export class World {
  page: Page
  consoleErrors: string[] = []

  constructor() {
    this.page = null as unknown as Page
  }
}
