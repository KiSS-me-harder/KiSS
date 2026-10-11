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

## Husky Hooks

### All hooks must pass before task completion

- **Pre-commit:** `pnpm lint --fix` (auto-fixes linting issues).
- **Pre-push:** `pnpm lint` (final check).

Run `pnpm lint` before marking a task complete. Fix all reported issues.
