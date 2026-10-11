# Agent Guidelines for KiSS

## Building and Validating

### Use `pnpm generate` to validate the project

When verifying that changes work correctly, use `pnpm generate` rather than `pnpm build`.

While both scripts currently run `nuxt generate` under the hood, `pnpm generate` is the explicit, semantically correct command for this static-site project. It prerenders all routes and validates that the entire site builds without errors.

**Why not `pnpm build`?**
- The project uses Nuxt in full static generation mode (`ssr: true` with `nuxt generate` for release builds).
- `pnpm generate` makes the intent clear: we're generating a static site, not building a server-side application.
- Using `pnpm generate` ensures all routes are prerendered and any route-level errors are caught.

### When to run `pnpm generate`

Run `pnpm generate` **only when logic or structure changes** are made, such as:
- Adding, removing, or renaming pages/routes
- Changing component logic, computed properties, or event handlers
- Modifying data fetching, stores, or content queries
- Refactoring code that affects runtime behavior

**Skip `pnpm generate` for small cosmetic changes** that don't affect logic, such as:
- Adjusting colors, spacing, fonts, or other visual styles
- Tweaking Tailwind classes for appearance
- Updating text content, labels, or translations
- Changing image sizes, borders, or shadows
- Minor layout adjustments without structural changes

For cosmetic-only changes, a quick visual check or `pnpm typecheck` is sufficient validation.

### What to check after running `pnpm generate`

1. **Exit code 0** — the command completed without errors
2. **Routes prerendered** — look for a summary line like "172 routes prerendered" to confirm all pages were generated
3. **No errors in output** — check for any runtime errors during prerendering

### Other useful commands

- `pnpm dev` — Start the development server
- `pnpm preview` — Preview the generated static site locally
- `pnpm typecheck` — Run TypeScript type checking
- `pnpm lint` — Run ESLint
