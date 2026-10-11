import { After, Before, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'
import { World } from './world'

setWorldConstructor(World)
setDefaultTimeout(15_000)

Before({ timeout: 60_000 }, async function () {
  this.browser = await chromium.launch()
  this.context = await this.browser.newContext({
    baseURL: 'http://localhost:3000/KiSS/'
  })
  this.page = await this.context.newPage()
})

After(async function () {
  await this.context?.close()
  await this.browser?.close()
})
