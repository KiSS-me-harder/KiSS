---
name: pinia-store
description: Create or modify a Pinia store in `app/stores/` for persistent reactive state.
---

# Pinia Store

Create or modify a Pinia store in `app/stores/` for persistent reactive state.

## When to Use

- Adding new persistent state (user preferences, progress tracking, etc.)
- Moving `localStorage` calls from a component/page into a store
- Extending an existing store with new state or actions

## Steps

1. **Check existing stores** — Read `app/stores/*.ts` to avoid duplicating state. See AGENTS.md for the list.
2. **Create the store file** — `app/stores/<name>.ts` using `defineStore()` with composition API.
3. **Define state** — Use `ref()` / `reactive()` for state properties.
4. **Add computed properties** — Derive values from state with `computed()`.
5. **Write actions** — Functions that mutate state.
6. **Add persistence** — Implement `saveToStorage()` / `loadFromStorage()` with `localStorage`.
7. **Add hydration guard** — Load only after hydration (see pattern below).
8. **Add auto-save** — `watch(state, save, { deep: true })`.
9. **Return exports** — Expose state, computed, and actions in the `return` block.
10. **Validate** — Run `pnpm generate` to confirm no SSR errors.

## Store Pattern

```ts
export const useMyStore = defineStore('myStore', () => {
  // ── State ──
  const myState = ref<SomeType>(defaultValue)

  // ── Computed ──
  const derived = computed(() => myState.value.someProp)

  // ── Actions ──
  function updateState(value: SomeType) {
    myState.value = value
  }

  // ── Persistence ──
  function saveToStorage() { /* localStorage.setItem */ }
  function loadFromStorage() { /* localStorage.getItem */ }

  // Hydration guard — REQUIRED
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.isHydrated) {
      loadFromStorage()
    } else {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) loadFromStorage()
      }, { once: true })
    }
  }

  // Auto-save
  watch([myState], () => saveToStorage(), { deep: true })

  return { myState, derived, updateState, loadFromStorage, saveToStorage }
})
```

## Key Rules

- Use `import.meta.client`, **not** `process.client`.
- Always guard `localStorage` access with `import.meta.client`.
- Wrap `localStorage` calls in `try/catch` — storage may be unavailable.
- Merge loaded data with defaults to handle schema migrations.
- For versioned data, track a `version` field and conditionally load fields.
- Never call `localStorage` directly in components or pages.

## References

- `reference/store-patterns.md` — Detailed examples from existing stores
- `app/stores/enrollment.ts` — Complex store with versioning
- `app/stores/studyPlan.ts` — Minimal store example
- `app/stores/schedule.ts` — Store with per-key persistence
