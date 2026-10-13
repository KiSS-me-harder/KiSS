import type { Page } from '@playwright/test'
import { createWriteStream, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const resultsDirectory = 'test/results'
const consoleDirectory = resultsDirectory + '/console'
const screenshotSuccessDirectory = resultsDirectory + '/screenshots/success'
const screenshotFailureDirectory = resultsDirectory + '/screenshots/failure'
rmSync(resultsDirectory, { recursive: true, force: true })

export function captureBrowserDiagnostics(
  page: Page,
  scenarioId: string,
  scenarioName: string
) {
  mkdirSync(consoleDirectory, { recursive: true })

  const workerId = process.env.CUCUMBER_WORKER_ID ?? '0'
  const safeId = scenarioId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const file = join(consoleDirectory, `${workerId}-${safeId}.jsonl`)
  const stream = createWriteStream(file)

  const issues = new Map<string, number>()

  function record(
    level: string,
    type: string,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    stream.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      scenario: scenarioName,
      level,
      type,
      message,
      ...details
    }) + '\n')

    if (level === 'error' || level === 'warning') {
      const key = `${type}: ${message} ${details.url ?? ''}`
      issues.set(key, (issues.get(key) ?? 0) + 1)
    }
  }

  function watchPage(p: Page) {
    p.on('console', (msg) => {
      record(msg.type(), 'console', msg.text(), {
        url: p.url(),
        source: msg.location()
      })
    })

    p.on('pageerror', (error) => {
      record('error', 'pageerror', error.stack ?? error.message, {
        url: p.url()
      })
    })

    p.on('requestfailed', (request) => {
      record(
        'error',
        'requestfailed',
        request.failure()?.errorText ?? 'Unknown failure',
        { url: request.url() }
      )
    })

    p.on('response', (response) => {
      if (response.status() >= 400) {
        record('error', 'http', `${response.status()} ${response.request().method()}`, {
          url: response.url()
        })
      }
    })
  }

  watchPage(page)

  // Capture new tabs and popups too.
  page.context().on('page', watchPage)

  return {
    file,
    issues,

    async screenshot(status: 'success' | 'failure') {
      if (page.isClosed()) return null
      const directory = status === 'success' ? screenshotSuccessDirectory : screenshotFailureDirectory
      mkdirSync(directory, { recursive: true })
      const path = join(
        directory,
        `${workerId}-${safeId}.png`
      )
      await page.screenshot({
        path,
        fullPage: true,
        animations: 'disabled',
        timeout: 10_000
      })

      return path
    },
    async close() {
      await new Promise<void>((resolve, reject) => {
        stream.once('error', reject)
        stream.end(resolve)
      })
    }
  }
}

export type BrowserDiagnostics
  = ReturnType<typeof captureBrowserDiagnostics>
