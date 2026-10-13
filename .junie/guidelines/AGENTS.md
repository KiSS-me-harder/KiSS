# Agent Guidelines for KiSS

**Nuxt 3 static site** (`ssr: true`, deployed via `nuxt generate`). Contentlayer for data, Pinia for state.

See also: `.junie/guidelines/architecture.md` (project structure) · `.junie/guidelines/mistakes.md` (common pitfalls) · `.junie/guidelines/refactoring.md` (code organization).

## Implementation Workflow

### One artifact type per task

When asked to implement a feature, work in **sequential, separate tasks**:

1. **Feature file** — Write or update the Gherkin spec in `features/` first.
2. **E2E tests** — In the next task, write Playwright tests in `test/e2e/` that match the spec.
3. **Implementation** — Finally, write the code that passes those tests.

**Do not** update tests and implementation in the same task unless explicitly told to do so. If you need to modify multiple artifact types at once, request permission first. Only go back to update a previous step if given explicit permission.

### Read feature files before coding

Always read the relevant `features/*.feature` file before implementing changes. Feature files are the source of truth for expected behavior.

**Feature files are organized under `features/pages/` and `features/components/`, with subdirectories that can be nested at any depth.** For example, `features/pages/degrees/` contains degree-related page features, and `features/components/home/` contains today-related component features.

**To find the feature file for a given page or component, always search recursively** through all subdirectories — do not assume a fixed path. Use glob patterns like `features/**/*.feature` or `find features/ -name '*.feature'` to locate the correct file.

## Building and Validating

### Use `pnpm generate` to validate the project

Use `pnpm generate` (not `pnpm build`) — it prerenders all routes and catches route-level errors.

- **Run on:** Logic or structure changes (new routes, component logic, stores, content queries, refactors).
- **Skip for:** Cosmetic-only changes (colors, spacing, text, Tailwind tweaks) — use `pnpm typecheck` instead.
- **Check:** Exit code 0, "N routes prerendered" in output, no runtime errors.

### Run the E2E test suite

**Prerequisite:** A dev server must be running on port `3000` before running `pnpm test`.

- Check if port 3000 is already in use (e.g., `pnpm dev` is running). If so, proceed — do not start a second server.
- If port 3000 is **not** in use, start the dev server first: `pnpm dev` (in the background), then run `pnpm test`.
- The test suite (`test/e2e/`) connects to the running dev server — it does not start one automatically.

**Run targeted feature files, not the full suite.** When checking console logs or behavior for a specific page, run only that page's feature file (e.g., `pnpm test:e2e features/pages/study-plan.feature`) instead of the entire suite of 118 scenarios. Console logs are captured per-feature-file in `test/reports/`. Feature files are organized under `features/pages/` and `features/components/` with potentially deep nesting — use glob search to locate the correct file. See `.junie/guidelines/mistakes.md` for the full pitfall description.

### Other useful commands

- `pnpm dev` — Development server
- `pnpm preview` — Preview generated static site
- `pnpm typecheck` — TypeScript type checking
- `pnpm lint` — ESLint

## State Management

### Use Pinia Stores for all persistent state

**All persistent reactive state must use Pinia stores in `app/stores/`, never direct `localStorage` in components.**

### Creating a new store

Follow the existing pattern in `app/stores/`:
1. Use `defineStore()` with composition API (`ref`/`reactive`).
2. Persist with `saveToStorage()` / `loadFromStorage()` → `localStorage`.
3. **Guard against SSR:** Load only after hydration (`if (nuxtApp.isHydrated)` else `watch(isHydrated, load, { once: true })`).
4. Auto-save on changes with `watch(state, save, { deep: true })`.
5. Use `import.meta.client`, **not** `process.client`.

### Existing stores

- `enrollment.ts` — Class enrollments, degree subscriptions, progress.
- `studyPlan.ts` — Study plan filters (degrees, titles, planned classes).
- `schedule.ts` — Routine assignments, class schedule, daily tasks.
- `clubActivities.ts` — Per-club completed activity tracking.

Direct `localStorage` is acceptable only for non-reactive data (feature flags, analytics).

## Code Documentation

### JSDoc for all public APIs

**All public APIs must have JSDoc docstrings.** This includes:

- **Pinia stores** — The store's purpose and each exported function/method.
- **Composables** — The composable's purpose, parameters, and return value.
- **Utility functions** — What the function does, its parameters, and return type.
- **Type definitions** — Interfaces and type aliases exposed across modules.

Use concise, clear descriptions. Document the **what** and **why**, not the **how**.

Example:
```ts
/**
 * Retrieves the list of completed tasks for the given club.
 * @param clubSlug - The slug identifier of the club.
 * @returns Array of completed activity slugs, empty if none.
 */
export function getCompletedActivities(clubSlug: string): string[] {
  // ...
}
```

## Husky Hooks

### All hooks must pass before task completion

- **Pre-commit:** `pnpm lint --fix` (auto-fixes linting issues).
- **Pre-push:** `pnpm lint` (final check).

Run `pnpm lint` before marking a task complete. Fix all reported issues.
