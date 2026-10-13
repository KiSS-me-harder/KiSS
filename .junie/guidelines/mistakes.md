# Common Agent Mistakes — KiSS

**Keep this file brief.** Each entry: mistake → why it breaks → what to do instead.

## State Management

### Direct `localStorage` in components/pages
- **Mistake:** Calling `localStorage.getItem`/`setItem` inside `.vue` components or pages.
- **Why:** Breaks reactivity, causes SSR hydration mismatches, scatters persistence logic.
- **Fix:** Use a Pinia store in `app/stores/`. All persistent state lives there. See `AGENTS.md` store pattern.

### `process.client` instead of `import.meta.client`
- **Mistake:** Using `process.client` / `process.server` (Nuxt 2 / SSR-only syntax).
- **Why:** This project uses Nuxt 3 with `ssr: true` — `process.client` is undefined at runtime.
- **Fix:** Always use `import.meta.client` / `import.meta.server`.

### Skipping hydration guard in stores
- **Mistake:** Loading `localStorage` immediately in a store without checking `nuxtApp.isHydrated`.
- **Why:** SSR renders first, then hydration overwrites with stale server state — user data is lost on page load.
- **Fix:** Guard with `if (nuxtApp.isHydrated) load()` else `watch(isHydrated, load, { once: true })`.

## Content & Nuxt

### Missing `content.config.ts` registration
- **Mistake:** Adding new content folders without registering them in `content.config.ts`.
- **Why:** `queryContent()` won't find the files — pages render empty.
- **Fix:** Add the collection to `content.config.ts` with the correct type and glob pattern.

### Using `queryContent()` without `.where()` on large collections
- **Mistake:** Fetching all content then filtering in JS.
- **Why:** Slow, loads unnecessary data into memory during SSR.
- **Fix:** Use `.where({ field: value })` to filter at the query level.

### Runtime data fetching with `useAsyncData`/`useFetch`
- **Mistake:** Calling `useAsyncData()` or `useFetch()` inside event handlers, `watch` callbacks, or any code path that executes after the component has mounted — produces error `NUXT_E3003`.
- **Why:** These functions must be called during component setup so Nuxt can await the data fetch before rendering. Calling them after mount means the fetch cannot be awaited, breaking SSR and causing runtime errors.
- **Fix:** Move `useAsyncData`/`useFetch` calls to the top level of `<script setup>` or a composable called during setup. For post-mount requests (e.g., button clicks, search input), use `$fetch()` instead.

## Build & Validation

### Running `pnpm test` without a dev server

- **Mistake:** Running `pnpm test` without ensuring a dev server is running on port 3000.
- **Why:** The E2E test suite connects to an existing dev server — it does not start one. All page navigation fails with "Cannot navigate to invalid URL".
- **Fix:** Check if port 3000 is in use first. If not, start `pnpm dev` before running `pnpm test`.

### Running `pnpm build` instead of `pnpm generate`
- **Mistake:** Using `build` to validate changes.
- **Why:** `build` produces a server-rendered app; `generate` prerenders all routes and catches route-level errors.
- **Fix:** Use `pnpm generate` and check for "N routes prerendered" in output.

### Running `pnpm generate` for cosmetic-only changes
- **Mistake:** Full regenerate after color/spacing/text tweaks.
- **Why:** Wastes time — cosmetic changes don't affect route rendering.
- **Fix:** Skip to `pnpm typecheck` or visual check for pure style changes.

### Killing the dev server to apply changes
- **Mistake:** Stopping `pnpm dev` and restarting it after every code change.
- **Why:** The Nuxt dev server applies changes automatically via hot module replacement (HMR) — restarting wastes time and disrupts the workflow.
- **Fix:** Leave `pnpm dev` running and save files directly. Changes are reflected immediately in the browser.

### Restarting the dev server to verify changes
- **Mistake:** Restarting `pnpm dev` to see if the server picks up changes, assuming HMR might not have worked.
- **Why:** The dev server always auto-reloads — restarting only risks disrupting the user and other agents who depend on it. If changes don't appear, investigate the actual cause (e.g., cache, import path) instead of restarting.
- **Fix:** Assume the dev server picks up changes automatically. Save files and refresh the browser. If changes still don't appear, check for the real issue rather than restarting.

### Running the full test suite to check a specific page
- **Mistake:** Running `pnpm test:e2e` to check console logs or behavior of a single page, executing all 118 scenarios when only one is relevant. Note that `pnpm test:e2e` always runs the full suite — it does not accept a feature file argument.
- **Why:** Wastes significant time running unrelated scenarios — the diagnostics console logs are captured per-feature-file in `test/reports/`, so running the full suite produces many log files when you only need one.
- **Fix:** Use `pnpm test:e2e:single` with the feature file path, e.g., `pnpm test:e2e:single features/pages/study-plan.feature` to test just that page. Feature files are organized under `features/pages/` and `features/components/` with potentially deep nesting — use `glob_search` or `find` to locate the correct file.
- **Exception:** If you need a screenshot to understand what the user is requesting, it is perfectly fine to run `pnpm test:e2e:single` for just the feature file corresponding to the page or component they need to work on. This generates a screenshot in `test/results/screenshots/success/` that you can inspect to see the current visual state of the page.

### Running the full test suite when `@rerun.txt` has contents
- **Mistake:** Running `pnpm test:e2e` (full suite) when `@rerun.txt` already lists failing scenarios.
- **Why:** Wastes time re-running scenarios that are already known to fail — the rerun file exists precisely to focus only on the failing tests, reducing run time from ~3 minutes to only the failing scenarios.
- **Fix:** Check `@rerun.txt` first. If it has contents, use `pnpm test:e2e:rerun` to run only the failing scenarios. Only run the full suite (`pnpm test:e2e`) when `@rerun.txt` is empty or does not exist.

## Component Design

### Using raw divs instead of Nuxt UI components
- **Mistake:** Building UI with `<div>` and manual Tailwind classes when Nuxt UI provides a ready-made component (e.g., `NButton`, `NCard`, `NBadge`).
- **Why:** Duplicates built-in styling, accessibility, and responsive behavior — more code to maintain, inconsistent look and feel.
- **Fix:** Use Nuxt UI components first. Reach for raw elements only when no suitable component exists.

### Monolithic Vue files
- **Mistake:** Writing a single `.vue` file with a massive template and script section.
- **Why:** Becomes unreadable and hard to maintain — agents tend to keep appending rather than structuring.
- **Fix:** Keep templates brief (50 lines is a warning sign, 100+ means split it). Keep scripts under 200 lines; 300+ is too much. Extract sections into child components or composables to keep files understandable.

## General

### Not reading feature files before implementing
- **Mistake:** Coding a feature without reading `features/*.feature` first.
- **Why:** Implementation drifts from expected behavior described in Gherkin scenarios.
- **Fix:** Read the matching `features/<name>.feature` before touching code.

### Skipping Husky hook checks
- **Mistake:** Marking a task complete without verifying `pnpm lint` passes.
- **Why:** Pre-commit hooks will reject the change — work is blocked.
- **Fix:** Run `pnpm lint` before submitting. Fix all reported issues.

### Placing skills in the wrong location
- **Mistake:** Creating Junie skills in a global `~/.junie/skills/` directory instead of the project's `.junie/skills/`.
- **Why:** Project-specific skills won't be available to agents working on this project, and global skills are not tracked with the project.
- **Fix:** Always place skills in the project's `.junie/skills/` folder. See `.junie/guidelines/architecture.md` for reference.

### Duplicate Scenarios instead of Scenario Outline
- **Mistake:** Writing tons of identical `Scenario` blocks that differ only in data values (e.g., testing 10 classes with 10 separate scenarios).
- **Why:** Bloates the feature file, makes maintenance painful — every step change must be repeated across all scenarios.
- **Fix:** Use `Scenario Outline` with an `Examples` table to parameterize the varying values. Keep one scenario template and list all data combinations in the table.

### Placing step helpers in `test/e2e/support/`
- **Mistake:** Putting navigation helpers, assertion utilities, or other step-level functions in `test/e2e/support/`.
- **Why:** `support/` is reserved for test framework infrastructure (world, setup, diagnostics) — mixing in step helpers blurs the boundary and makes the wrong files get imported.
- **Fix:** Place helpers used inside step definitions in `test/e2e/utils/`. See `.junie/guidelines/architecture.md` section "`test/e2e/` Structure" for the convention.

### Dumping all diagnostic context into responses
- **Mistake:** Reading and including every available screenshot, console log, or test result file in full — even when only one or two are relevant to the current issue.
- **Why:** Payload size limits are exceeded frequently, truncating responses and losing the actual analysis. Screenshots are base64-encoded and can be megabytes each; raw console JSONL files are 1+ MB.
- **Fix:** Use diagnostic artifacts judiciously — be aware of what's available but only inspect what's directly relevant:
  - **Screenshots:** Open only the screenshot for the specific failing scenario or page you're investigating. Never read all screenshots in a batch. Skip screenshots entirely when the issue is clearly non-visual (e.g., logic errors, type errors, lint failures).
  - **Console logs:** Use the summary script (see code-quality skill) to get counts and error messages — never read raw JSONL files. Only drill into a specific log file if the summary reveals an unfamiliar error worth investigating.
  - **Test output:** Pipe test commands to a file and read only the exit code and last ~50 lines (failure summary). Never include full test run output in responses.

## Code Quality

### Altering test suite configuration during code-quality
- **Mistake:** Modifying `cucumber.json` (e.g., changing `parallel`, `format`, adding `strict`) or other test configuration files while running the code-quality skill.
- **Why:** Test suite configuration is project infrastructure — changing it to make tests pass masks the real issues and can introduce flaky behavior or hide failures. The code-quality skill is for fixing code, not for tuning the test runner.
- **Fix:** The code-quality skill may only edit step definitions (`test/e2e/steps/`) and implementation code (`app/`). Never modify `cucumber.json`, `playwright.config.ts`, `vitest.config.ts`, or any files in `test/e2e/support/`.

### Stubbing step definitions to make tests pass
- **Mistake:** Replacing step definition logic with `throw errors.Pending`, empty functions, or hardcoded assertions just to get tests to pass.
- **Why:** This defeats the purpose of the test suite — stubbed steps no longer verify actual behavior, creating false confidence in the codebase.
- **Fix:** If a step definition is failing, fix the implementation code the step is testing, or write proper step logic that matches the feature file's intent.

### Suppressing errors to make tests pass
- **Mistake:** Adding `.catch(() => {})`, `try/catch` blocks that swallow errors, or modifying `diagnostics.ts` to filter out legitimate error messages.
- **Why:** Suppressing errors hides real problems — the test suite appears green while the application has unresolved issues.
- **Fix:** Fix the root cause of the error in the implementation code instead of silencing it.
