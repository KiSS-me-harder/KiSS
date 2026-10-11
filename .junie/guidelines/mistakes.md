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

## Build & Validation

### Running `pnpm build` instead of `pnpm generate`
- **Mistake:** Using `build` to validate changes.
- **Why:** `build` produces a server-rendered app; `generate` prerenders all routes and catches route-level errors.
- **Fix:** Use `pnpm generate` and check for "N routes prerendered" in output.

### Running `pnpm generate` for cosmetic-only changes
- **Mistake:** Full regenerate after color/spacing/text tweaks.
- **Why:** Wastes time — cosmetic changes don't affect route rendering.
- **Fix:** Skip to `pnpm typecheck` or visual check for pure style changes.

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
