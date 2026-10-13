/**
 * Activity data parsing helpers for the activities index page.
 * Extracted from useActivitiesIndex to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Activity entry type for the activities index.
 */
export type ActivityEntryType = {
  slug: string
  title: string
  description: string
  longDescription: string
  icon: string
  category: string
  fields: { id: string, label: string, unit: string, required?: boolean }[]
  contributions: { metric: string, map: Record<string, string> }[]
}

/**
 * Category icon mapping.
 */
export const categoryIcons: Record<string, string> = {
  'Anal Training': 'i-lucide-scala',
  'Oral Training': 'i-lucide-mic',
  'Body Development': 'i-lucide-heart',
  'Flexibility': 'i-lucide-move',
  'Mental Training': 'i-lucide-brain',
  'Fashion': 'i-lucide-shirt',
  'Performance': 'i-lucide-music',
  'Discipline': 'i-lucide-lock',
  'Pet Play': 'i-lucide-paw-print',
  'Roleplay': 'i-lucide-theater',
  'Sensory Play': 'i-lucide-eye-off',
  'Service': 'i-lucide-hand-helping',
  'Voyeur & Exhibition': 'i-lucide-eye',
  'Impact Play': 'i-lucide-zap',
  'General': 'i-lucide-dumbbell'
}

/**
 * Category display order.
 */
export const categoryOrder = [
  'Anal Training', 'Oral Training', 'Body Development', 'Flexibility',
  'Mental Training', 'Fashion', 'Performance',
  'Discipline', 'Pet Play', 'Roleplay', 'Sensory Play', 'Service',
  'Voyeur & Exhibition', 'Impact Play', 'General'
]

/**
 * Parses raw activity content entries into structured activity data.
 * @param allActivities - Raw activity content entries.
 * @returns Sorted array of activity entries.
 */
export function parseActivities(allActivities: unknown[]): ActivityEntryType[] {
  if (!allActivities) return []
  const activityMap = new Map<string, ActivityEntryType>()
  for (const item of allActivities) {
    const stem = (item as { stem?: string }).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) continue
    const activitySlug = parts[1]
    if (!activitySlug || parts[2] !== '_index') continue
    const meta = (item as { meta?: Record<string, unknown> }).meta || {}
    const fields = meta.fields || []
    const contribs = meta.contributions || []
    activityMap.set(activitySlug, {
      slug: activitySlug,
      title: (item as { title?: string }).title || activitySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: (meta.description as string) || '',
      longDescription: (meta.longDescription as string) || '',
      icon: (meta.icon as string) || 'i-lucide-dumbbell',
      category: (meta.category as string) || 'General',
      fields: Array.isArray(fields) ? fields as ActivityEntryType['fields'] : [],
      contributions: Array.isArray(contribs) ? contribs as ActivityEntryType['contributions'] : []
    })
  }
  return Array.from(activityMap.values()).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Groups activities by category with proper ordering (activities page).
 * @param activities - Array of activity entries.
 * @returns Array of category groups sorted by defined order.
 */
export function groupActivitiesByCategoryForActivities(activities: ActivityEntryType[]) {
  type ActivityEntry = {
    slug: string
    title: string
    description: string
    longDescription: string
    icon: string
    category: string
    fields: { id: string, label: string, unit: string }[]
    contributions: { metric: string, map: Record<string, string> }[]
  }
  const categoryMap = new Map<string, { name: string, icon: string, activities: ActivityEntry[] }>()
  for (const activity of activities) {
    const cat = activity.category || 'General'
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        name: cat,
        icon: categoryIcons[cat] || 'i-lucide-dumbbell',
        activities: []
      })
    }
    categoryMap.get(cat)!.activities.push(activity as ActivityEntry)
  }
  return Array.from(categoryMap.values()).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a.name)
    const bIdx = categoryOrder.indexOf(b.name)
    if (aIdx === -1 && bIdx === -1) return a.name.localeCompare(b.name)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
}

/**
 * Initializes field values for all activities.
 * @param activities - Array of activity entries.
 * @returns Record of activity slugs to field value maps.
 */
export function initializeFieldValues(activities: ActivityEntryType[]): Record<string, Record<string, number>> {
  const fieldValues: Record<string, Record<string, number>> = {}
  for (const activity of activities) {
    const values: Record<string, number> = {}
    for (const field of activity.fields) {
      values[field.id] = 0
    }
    fieldValues[activity.slug] = values
  }
  return fieldValues
}

/**
 * Formats a timestamp as a relative date string.
 * @param timestamp - Unix timestamp in milliseconds.
 * @returns Human-readable relative time string.
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Retrieves recent sessions for an activity from the enrollment store.
 * @param activity - The activity entry.
 * @param store - Enrollment store instance.
 * @returns Sorted array of sessions (newest first).
 */
export function getRecentSessions(
  activity: ActivityEntryType | null,
  store: ReturnType<typeof useEnrollmentStore>
): Array<{ timestamp: number, values: Record<string, number> }> {
  if (!activity || !activity.contributions?.length) return []
  const sessions: Array<{ timestamp: number, values: Record<string, number> }> = []
  for (const contribution of activity.contributions) {
    const dataPoints = store.getMetricDataPoints(contribution.metric)
    for (const dp of dataPoints) {
      if (dp.activitySlug !== activity.slug) continue
      let session = sessions.find(s => Math.abs(s.timestamp - dp.timestamp) < 1000)
      if (!session) {
        session = { timestamp: dp.timestamp, values: {} }
        sessions.push(session)
      }
      for (const [activityField, metricField] of Object.entries(contribution.map || {})) {
        if (metricField === dp.fieldId) {
          session.values[activityField] = dp.value
          break
        }
      }
    }
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Deletes a session for an activity from the enrollment store.
 * @param activity - The activity entry.
 * @param sessionIndex - Index of the session to delete.
 * @param store - Enrollment store instance.
 */
export function deleteSession(
  activity: ActivityEntryType,
  sessionIndex: number,
  store: ReturnType<typeof useEnrollmentStore>
) {
  const sessions = getRecentSessions(activity, store)
  const session = sessions[sessionIndex]
  if (!session) return
  for (const contribution of activity.contributions) {
    const progress = store.getMetricProgress(contribution.metric)
    if (progress?.dataPoints) {
      for (let i = progress.dataPoints.length - 1; i >= 0; i--) {
        const dp = progress.dataPoints[i]
        if (dp && dp.activitySlug === activity.slug && Math.abs(dp.timestamp - session.timestamp) < 1000) {
          store.deleteDataPoint(contribution.metric, i)
        }
      }
    }
  }
}

/**
 * Submits an activity session, logging contributions and resetting fields.
 * @param activity - The activity entry.
 * @param fieldValues - Current field values record.
 * @param store - Enrollment store instance.
 */
export function submitSession(
  activity: ActivityEntryType | null,
  fieldValues: Record<string, Record<string, number>>,
  store: ReturnType<typeof useEnrollmentStore>
) {
  if (!activity || !activity.contributions?.length) return
  const values = fieldValues[activity.slug]
  if (values) {
    store.logActivity(activity.slug, activity.contributions, { ...values })
    for (const field of activity.fields) {
      values[field.id] = 0
    }
  }
}

/**
 * Handles hash-based navigation to a specific activity.
 * @param hash - The URL hash without the # symbol.
 * @param categories - Array of activity categories.
 * @param openCategories - Set of open category names.
 * @param highlightedActivity - Ref for the highlighted activity slug.
 */
export function handleHashNavigation(
  hash: string | undefined,
  categories: { name: string, activities: { slug: string }[] }[],
  openCategories: Set<string>,
  highlightedActivity: { value: string | null }
) {
  if (!hash) return
  for (const category of categories) {
    const activity = category.activities.find(a => a.slug === hash)
    if (activity) {
      if (!openCategories.has(category.name)) {
        openCategories.add(category.name)
      }
      highlightedActivity.value = hash
      nextTick(() => {
        const el = document.getElementById(`activity-${hash}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-transparent')
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-transparent')
            highlightedActivity.value = null
          }, 2000)
        }
      })
      return
    }
  }
}
