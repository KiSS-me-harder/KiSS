# KiSS Project Architecture

**Nuxt 3 static site** (`ssr: true`, deployed via `nuxt generate`). Full-stack frontend with Contentlayer for data and Pinia for state.

## Root Layout

| Directory | Purpose |
|-----------|---------|
| `app/` | All application code — pages, components, logic |
| `content/` | Markdown/YAML data files queried at build time via Contentlayer |
| `features/` | Gherkin feature specs — source of truth for expected behavior |
| `test/` | Tests: `unit/` (Vitest), `nuxt/` (Nuxt test utils), `e2e/` (Playwright) |
| `public/` | Static assets served as-is (favicon, icons, etc.) |
| `dist/` | Generated static output from `pnpm generate` |

## `app/` Structure

| Folder | Purpose |
|--------|---------|
| `pages/` | Route-based pages. Folders create nested routes (e.g., `pages/classes/[slug].vue`). |
| `components/` | Reusable Vue components. Subfolders organize by domain (e.g., `customers/`, `home/`). |
| `stores/` | Pinia stores — all persistent reactive state. Use these, never `localStorage` directly. |
| `composables/` | Shared composables (e.g., `useDashboard.ts`). |
| `types/` | TypeScript type definitions (e.g., `index.d.ts`). |
| `plugins/` | Nuxt plugins that run at app initialization. |
| `layouts/` | Page layouts (`default.vue`, `blank.vue`). |
| `assets/` | Compiled assets (styles, images processed by Vite). |
| `utils/` | Utility functions and helpers. |

## `content/` Structure

Markdown/YAML files organized by domain. Registered in `content.config.ts` as collections and queried via `queryContent()`.

| Folder | Content |
|--------|---------|
| `classes/` | Class definitions with prerequisites and tier levels |
| `degrees/` | Degree programs and title requirements |
| `clubs/` | Club definitions and activities |
| `activities/` | Activity types and session templates |
| `library/` | Media entries (videos, images, audio, books) |
| `faculty/` | Teacher profiles |
| `metrics/` | Training milestones and progress metrics |
| `punishments/` | Detention and punishment definitions |
| `binaural/` | Binaural beat audio configurations |

## Key Config Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Nuxt configuration (SSR mode, modules, runtime config) |
| `content.config.ts` | Contentlayer collection definitions — **required** when adding new content folders |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `cucumber.config.ts` | Gherkin test runner configuration |
| `eslint.config.mjs` | Linting rules |

## Data Flow

1. **Static data** lives in `content/` as Markdown/YAML → queried via `queryContent()` in pages/components
2. **User state** lives in Pinia stores (`app/stores/`) → persisted to `localStorage` with hydration guards
3. **Feature specs** in `features/` describe expected behavior — read before implementing changes

## Existing Pinia Stores

- `enrollment.ts` — Class enrollments, degree subscriptions, progress
- `studyPlan.ts` — Study plan filters (degrees, titles, planned classes)
- `schedule.ts` — Routine assignments, class schedules, daily task completions
- `clubActivities.ts` — Per-club completed activity tracking
