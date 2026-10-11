import type { Browser, BrowserContext, Page } from '@playwright/test'

export class World {
  browser: Browser
  context: BrowserContext
  page: Page

  constructor() {
    this.browser = null as unknown as Browser
    this.context = null as unknown as BrowserContext
    this.page = null as unknown as Page
  }
}
