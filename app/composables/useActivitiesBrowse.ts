/**
 * Composable for the activities browse index page.
 * Provides activities grouped by category with image paths for card display.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { categoryIcons, categoryOrder } from '~/utils/activitiesHelpers'

/**
 * Activity entry for the browse index page.
 */
export type BrowseActivityEntry = {
  slug: string
  title: string
  description: string
  category: string
  image: string
}

/**
 * Category group for the browse index page.
 */
export type BrowseCategoryGroup = {
  name: string
  icon: string
  activities: BrowseActivityEntry[]
}

/**
 * Composable for the activities browse index page.
 * Fetches all activities and groups them by category.
 * @returns Object with categoryGroups, collapsedGroups, toggleGroup, and breadcrumbs.
 */
export function useActivitiesBrowse() {
  const { app } = useRuntimeConfig()
  const baseURL = app.baseURL

  const { data: allActivities } = useAsyncData('activities-browse', () => queryCollection('activities').all())

  const categoryGroups = computed<BrowseCategoryGroup[]>(() => {
    if (!allActivities.value) return []

    const categoryMap = new Map<string, BrowseActivityEntry[]>()

    for (const item of allActivities.value) {
      const meta = (item as { meta?: Record<string, unknown> }).meta || {}
      const stem = (item as { stem?: string }).stem || ''
      const parts = stem.split('/')
      const slug = parts.length >= 2 ? parts[parts.length - 1] : stem

      const category = (meta.category as string) || 'General'
      const title = (item as { title?: string }).title || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const description = (meta.description as string) || ''

      const image = `${baseURL}img/activities/${slug}.webp`

      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category)!.push({ slug, title, description, category, image })
    }

    return Array.from(categoryMap.entries())
      .map(([name, activities]) => ({
        name,
        icon: categoryIcons[name] || 'i-lucide-dumbbell',
        activities: activities.sort((a, b) => a.title.localeCompare(b.title))
      }))
      .sort((a, b) => {
        const aIdx = categoryOrder.indexOf(a.name)
        const bIdx = categoryOrder.indexOf(b.name)
        if (aIdx === -1 && bIdx === -1) return a.name.localeCompare(b.name)
        if (aIdx === -1) return 1
        if (bIdx === -1) return -1
        return aIdx - bIdx
      })
  })

  const collapsedGroups = ref<Set<string>>(new Set())

  function toggleGroup(name: string) {
    if (collapsedGroups.value.has(name)) {
      collapsedGroups.value.delete(name)
    } else {
      collapsedGroups.value.add(name)
    }
  }

  const breadcrumbs = ref<BreadcrumbItem[]>([
    { label: 'Activities', icon: 'i-lucide-dumbbell', to: '/activities' }
  ])

  useHead({ title: 'Activities - KiSS' })

  return { categoryGroups, collapsedGroups, toggleGroup, breadcrumbs }
}
