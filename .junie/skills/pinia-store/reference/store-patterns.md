# Store Pattern Reference

Detailed examples extracted from existing stores for reference.

## Minimal Store (studyPlan.ts)

Simple state with Set-based collections, no versioning needed:

```ts
export const useStudyPlanStore = defineStore('studyPlan', () => {
  const studyPlan = ref<Set<string>>(new Set())

  function saveToStorage() {
    if (import.meta.client) {
      try {
        localStorage.setItem('kiss-study-plan', JSON.stringify([...studyPlan.value]))
      } catch { /* unavailable */ }
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem('kiss-study-plan')
      if (raw) studyPlan.value = new Set(JSON.parse(raw) as string[])
    } catch { /* corrupted */ }
  }

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

  watch([studyPlan], () => saveToStorage(), { deep: true })

  return { studyPlan, loadFromStorage, saveToStorage }
})
```

## Versioned Store (enrollment.ts)

Complex store with multiple state objects and version-gated loading:

```ts
function saveToStorage() {
  if (import.meta.client) {
    const data = {
      profile: profile.value,
      enrollments: enrollments.value,
      version: 10  // Increment when schema changes
    }
    try {
      localStorage.setItem('kiss-enrollment', JSON.stringify(data))
    } catch { /* unavailable */ }
  }
}

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('kiss-enrollment')
    if (!raw) return
    const data = JSON.parse(raw)

    // Merge with defaults for new fields
    if (data.profile) {
      profile.value = {
        ...profile.value,
        ...data.profile,
        stats: { ...defaultStats, ...(data.profile.stats || {}) }
      }
    }

    // Version-gated loading
    if (data.newFeature && data.version >= 10) {
      newFeature.value = data.newFeature
    }
  } catch { /* corrupted */ }
}
```

## Per-Key Persistence (schedule.ts)

Some stores need per-key persistence (e.g., daily completions):

```ts
// Save individual keys directly
function toggleDailyCompleted(dateKey: string, taskId: string) {
  // ... toggle logic ...
  if (import.meta.client) {
    try {
      localStorage.setItem(`kiss-daily-${dateKey}`, JSON.stringify([...set]))
    } catch { /* unavailable */ }
  }
}

// Load on demand
function loadDailyCompleted(dateKey: string) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(`kiss-daily-${dateKey}`)
    if (raw) dailyCompleted.value[dateKey] = new Set(JSON.parse(raw) as string[])
  } catch { /* corrupted */ }
}
```

## On-Demand Loading (clubActivities.ts)

For stores where data is loaded per-entity rather than globally:

```ts
// No global load — load per club when visited
function loadFromStorage(clubSlug: string) {
  if (!import.meta.client) return
  try {
    const stored = localStorage.getItem(`club-activities-${clubSlug}`)
    if (stored) {
      completedActivities.value[clubSlug] = new Set(JSON.parse(stored) as string[])
    }
  } catch { /* corrupted */ }
}

// Save per club
function saveToStorage(clubSlug: string) {
  if (import.meta.client) {
    try {
      const set = completedActivities.value[clubSlug]
      if (set) {
        localStorage.setItem(`club-activities-${clubSlug}`, JSON.stringify([...set]))
      }
    } catch { /* unavailable */ }
  }
}
```

## Naming Conventions

- **Store function:** `use<Name>Store` (camelCase, e.g., `useEnrollmentStore`)
- **Store ID:** kebab-case string passed to `defineStore()` (e.g., `'enrollment'`)
- **localStorage keys:** `kiss-<store-name>` prefix (e.g., `'kiss-enrollment'`)
- **Per-entity keys:** `kiss-<store>-<entity-id>` (e.g., `'kiss-daily-2024-1-15'`)
