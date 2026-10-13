/**
 * Composable for club detail page logic.
 * Handles club data, activities, membership, and progress tracking.
 */
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import { useClubActivitiesStore } from '~/stores/clubActivities'
import { checkClubPrerequisite, toggleClubMembership, toggleClubActivity, isClubActivityCompleted, buildClubBreadcrumbs, buildClubStructuredData, filterActivitiesByType, countCompletedActivities, calculateTotalXP, activityTypesConfig } from '~/utils/clubPageHelpers'
import type { Activity } from '~/utils/clubPageHelpers'

export async function useClubPage(slug: ComputedRef<string>) {
  const store = useEnrollmentStore()
  const clubActivitiesStore = useClubActivitiesStore()

  const { data: club } = await useAsyncData(
    () => `club-${slug.value}`,
    () => queryCollection('clubs')
      .path(`/clubs/${slug.value}`)
      .first(),
    { watch: [slug] }
  )

  const { data: allActivities } = await useAsyncData('club-activities-all', () => queryCollection('activities').all())

  const title = computed(() => club.value?.title)
  const description = computed(() => club.value?.description)
  const body = computed(() => club.value?.body)

  const requiredDegree = computed(() => {
    const meta = club.value?.meta
    return meta?.requiredDegree as string | undefined
  })

  const hasPrerequisite = computed(() => checkClubPrerequisite(requiredDegree.value, store))

  const activities = computed<Activity[]>(() => {
    const meta = club.value?.meta
    const raw = meta?.activities
    if (!Array.isArray(raw) || raw.length === 0) return []
    return raw
  })

  const clubActivitySlugs = computed(() => {
    const meta = club.value?.meta
    const clubActs = meta?.clubActivities
    if (!Array.isArray(clubActs) || clubActs.length === 0) return []
    return clubActs
  })

  const clubActivities = computed(() => {
    if (!allActivities.value || clubActivitySlugs.value.length === 0) return []
    const slugs = new Set(clubActivitySlugs.value)
    return allActivities.value.filter((a) => {
      const stem = a.stem || ''
      const parts = stem.split('/')
      if (parts.length < 3) return false
      return slugs.has(parts[1])
    })
  })

  const isMember = computed(() => store.isClubMember(slug.value))
  const joinFailed = ref(false)

  function toggleMembership() {
    toggleClubMembership(slug.value, isMember.value, requiredDegree.value, joinFailed, store)
  }

  watch(slug, (newSlug) => {
    if (newSlug) clubActivitiesStore.loadFromStorage(newSlug)
  }, { immediate: true })

  function toggleActivity(activity: Activity) {
    toggleClubActivity(activity, slug.value, clubActivitiesStore)
  }

  function isCompleted(activity: Activity): boolean {
    return isClubActivityCompleted(activity, slug.value, clubActivitiesStore)
  }

  const completedCount = computed(() => countCompletedActivities(activities.value, isCompleted))
  const totalXP = computed(() => calculateTotalXP(activities.value, isCompleted))

  const activeFilter = ref<'all' | 'challenge' | 'game' | 'task'>('all')
  const filteredActivities = computed(() => filterActivitiesByType(activities.value, activeFilter.value))

  const items = computed<BreadcrumbItem[]>(() => buildClubBreadcrumbs(title.value, slug.value))

  useHead({ title })
  useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'website' })

  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: computed(() => buildClubStructuredData(title.value, description.value, slug.value))
    }]
  })

  return {
    club, title, description, body, requiredDegree, hasPrerequisite,
    activities, clubActivities, isMember, joinFailed, toggleMembership,
    toggleActivity, isCompleted, completedCount, totalXP,
    activityTypes: activityTypesConfig, activeFilter, filteredActivities, items
  }
}
