import { useEnrollmentStore } from '~/stores/enrollment'
import type { ActivityEntryType } from '~/utils/activitiesHelpers'
import { parseActivities, groupActivitiesByCategoryForActivities, initializeFieldValues, formatDate, getRecentSessions, deleteSession as deleteSessionHelper, submitSession as submitSessionHelper, handleHashNavigation as handleHashNavHelper } from '~/utils/activitiesHelpers'

/**
 * Composable for the activities index page.
 * Provides activity data grouped by category, hash-based navigation,
 * field value tracking, and session management.
 */
export async function useActivitiesIndex() {
  const store = useEnrollmentStore()
  const route = useRoute()
  const showHelp = ref(false)
  const selectedActivity = ref<ActivityEntryType | null>(null)

  const openCategories = ref<Set<string>>(new Set([
    'Anal Training', 'Oral Training', 'Mental Training', 'Fashion', 'Performance'
  ]))

  function toggleCategory(name: string) {
    if (openCategories.value.has(name)) {
      openCategories.value.delete(name)
    } else {
      openCategories.value.add(name)
    }
  }
  function isCategoryOpen(name: string) {
    return openCategories.value.has(name)
  }

  const highlightedActivity = ref<string | null>(null)

  function handleHashNavigation() {
    if (!import.meta.client) return
    const hash = route.hash?.slice(1)
    handleHashNavHelper(hash, categories.value, openCategories.value, highlightedActivity.value != null ? highlightedActivity : { value: null })
  }

  watch(() => route.hash, () => handleHashNavigation())
  onMounted(() => handleHashNavigation())

  const { data: allActivities } = await useAsyncData('activities-all', () => queryCollection('activities').all())

  const activities = computed(() => parseActivities(allActivities.value || []))

  const fieldValues = ref<Record<string, Record<string, number>>>(initializeFieldValues(activities.value))

  function getFieldValue(activitySlug: string, fieldId: string): number {
    return fieldValues.value[activitySlug]?.[fieldId] ?? 0
  }

  function onFieldChange(activitySlug: string, fieldId: string, event: Event) {
    const target = event.target as HTMLInputElement
    const value = parseFloat(target.value)
    if (!fieldValues.value[activitySlug]) {
      fieldValues.value[activitySlug] = {}
    }
    fieldValues.value[activitySlug][fieldId] = isNaN(value) ? 0 : value
  }

  const categories = computed(() => groupActivitiesByCategoryForActivities(activities.value))

  function submitSession(activity: ActivityEntryType) {
    submitSessionHelper(activity, fieldValues.value, store)
  }

  function getFieldUnit(activity: ActivityEntryType, fieldId: string): string {
    const field = activity.fields?.find(f => f.id === fieldId)
    return field?.unit || ''
  }

  function getRecentSessionsWrapper(activity: ActivityEntryType) {
    return getRecentSessions(activity, store)
  }

  function deleteSessionWrapper(activity: ActivityEntryType, sessionIndex: number) {
    deleteSessionHelper(activity, sessionIndex, store)
  }

  const breadcrumbs = ref([
    { label: 'Activities', icon: 'i-lucide-dumbbell', to: '/activities' }
  ])

  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  useHead({ title: 'Activities - KiSS' })

  return {
    store, showHelp, selectedActivity, fieldValues,
    openCategories, toggleCategory, isCategoryOpen,
    highlightedActivity, handleHashNavigation,
    getFieldValue, onFieldChange,
    activities, categories, breadcrumbs, todayFormatted,
    submitSession, getFieldUnit, getRecentSessions: getRecentSessionsWrapper, deleteSession: deleteSessionWrapper, formatDate
  }
}
