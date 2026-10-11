---
name: nuxt-page
description: Create or modify route-based pages in `app/pages/` with content queries and store integration.
---

# Nuxt Page

Create or modify route-based pages in `app/pages/` with content queries and store integration.

## When to Use

- Adding a new page (new route)
- Modifying an existing page's data fetching or layout
- Creating dynamic routes with parameters (e.g., `[slug]`, `[id]`)
- Integrating content queries with Pinia stores in a page

## Steps

1. **Read the feature file** — `features/pages/<name>.feature` for expected behavior.
2. **Check existing pages** — Avoid duplicating routes; see `app/pages/` structure.
3. **Create the page file** — `app/pages/<route>.vue` (folders create nested routes).
4. **Use `<script setup lang="ts">`** — Top-level script with `await` support.
5. **Fetch content** — Use `useAsyncData()` with `queryCollection()`.
6. **Integrate stores** — Import and use relevant Pinia stores.
7. **Set page meta** — Use `definePageMeta()` for layout, etc.
8. **Write the template** — Use Tailwind CSS, Nuxt UI components (`<UIcon>`, `<NuxtLink>`).
9. **Validate** — Run `pnpm generate` to confirm the route renders.

## Page Pattern

```vue
<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'

definePageMeta({
  layout: 'default'  // or 'blank' for full-screen pages
})

const route = useRoute()
const { app } = useRuntimeConfig()

// Route params
const slug = computed(() => route.params.slug as string)

// Fetch content
const { data: items } = await useAsyncData(
  () => `page-key-${slug.value}`,
  () => queryCollection('classes')
    .where('stem', 'LIKE', `classes/degree/${slug.value}%`)
    .all(),
  { watch: [slug] }
)

// Use stores
const store = useEnrollmentStore()
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Page content -->
  </div>
</template>
```

## Routing Patterns

| File | Route |
|------|-------|
| `pages/index.vue` | `/` |
| `pages/classes/index.vue` | `/classes` |
| `pages/classes/[degree]/[slug].vue` | `/classes/:degree/:slug` |
| `pages/classes/[degree]/[slug]/[level].vue` | `/classes/:degree/:slug/:level` |

## Content Query Patterns

```ts
// Fetch all from a collection
const { data } = await useAsyncData('key', () => queryCollection('degrees').all())

// Filter by stem (file path)
const { data } = await useAsyncData('key', () =>
  queryCollection('classes')
    .where('stem', 'LIKE', `classes/degree/slug%`)
    .all()
)

// Access frontmatter
const title = item.title
const meta = item.meta  // YAML frontmatter fields
const stem = item.stem  // file path
```

## Rendering Content

```vue
<!-- Render Markdown body -->
<ContentRenderer :value="contentItem" />

<!-- Access frontmatter fields -->
<h1>{{ item.title }}</h1>
<p>{{ item.meta?.description }}</p>
```

## Key Rules

- Use `<script setup lang="ts">` — not Options API.
- Top-level `await` is supported in setup scripts.
- Use `useAsyncData()` with unique keys — keys should include route params.
- Watch route params with `{ watch: [param] }` to refetch on navigation.
- Access frontmatter via `item.meta?.fieldName`.
- Use `definePageMeta({ layout: '...' })` for layout selection.
- Use `import.meta.client` for client-only logic, not `process.client`.
- Use Tailwind CSS classes — no scoped CSS needed.
- Use Nuxt UI components: `<UIcon>`, `<NuxtLink>`, etc.

## References

- `reference/page-examples.md` — Full page implementation examples
- `app/pages/classes/[degree]/[slug]/[level].vue` — Dynamic route with content
- `app/pages/study-plan.vue` — Page with store + content integration
- `app/components/home/TodayTasks.vue` — Component with multiple content queries
