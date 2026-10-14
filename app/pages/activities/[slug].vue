<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbs" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Not found -->
        <div v-if="!activity" class="text-center py-12 text-white/50">
          <UIcon name="i-lucide-alert-circle" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-lg">
            Activity not found.
          </p>
          <NuxtLink
            to="/activities"
            class="inline-flex items-center gap-1.5 mt-4 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Back to Activities
          </NuxtLink>
        </div>

        <template v-else>
          <!-- Activity Header -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <UIcon :name="activity.icon || 'i-lucide-dumbbell'" class="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">
                {{ activity.title }}
              </h1>
              <p class="text-white/60 mt-1">
                {{ activity.description }}
              </p>
              <div v-if="activity.contributions.length > 0" class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="contribution in activity.contributions"
                  :key="contribution.metric"
                  class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400"
                >
                  <UIcon name="i-lucide-arrow-right" class="w-3 h-3" />{{ contribution.metric }}
                </span>
              </div>
            </div>
          </div>

          <!-- Body Content -->
          <div
            v-if="activityRaw?.body"
            class="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white/90 prose-ul:text-white/70"
          >
            <ContentRenderer :value="activityRaw" />
          </div>

          <!-- Activity Log Form -->
          <ActivityCard
            :activity="activity!"
            :highlighted="false"
            :get-field-value="getFieldValue"
            :get-field-unit="getFieldUnit"
            :get-recent-sessions="getRecentSessionsWrapper"
            :on-field-change="onFieldChange"
            :submit-session="submitSessionWrapper"
            :delete-session="deleteSessionWrapper"
            :format-date="formatDate"
            :today-formatted="todayFormatted"
          />

          <!-- Related Courses -->
          <div v-if="relatedCourses?.length > 0" class="space-y-3">
            <h2 class="text-lg font-semibold text-white">
              Related Courses
            </h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="course in relatedCourses"
                :key="course.slug"
                :to="`/courses/${course.slug}`"
                class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 hover:border-white/20"
              >
                <UIcon name="i-lucide-book-open" class="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-white">{{ course.title }}</p>
                  <p class="text-xs text-white/50">{{ course.description }}</p>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Related Degrees -->
          <div v-if="relatedDegrees?.length > 0" class="space-y-3">
            <h2 class="text-lg font-semibold text-white">
              Related Degrees
            </h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <NuxtLink
                v-for="degree in relatedDegrees"
                :key="degree.slug"
                :to="`/degrees/${degree.slug}`"
                class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 hover:border-white/20"
              >
                <UIcon name="i-lucide-award" class="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-white">{{ degree.title }}</p>
                  <p class="text-xs text-white/50">{{ degree.description }}</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import ActivityCard from '~/components/activities/ActivityCard.vue'
import { useEnrollmentStore } from '~/stores/enrollment'
import type { ActivityEntryType } from '~/utils/activitiesHelpers'
import { parseActivities, submitSession as submitSessionHelper, getRecentSessions, deleteSession as deleteSessionHelper, formatDate } from '~/utils/activitiesHelpers'

const route = useRoute()
const store = useEnrollmentStore()

const slug = computed(() => route.params.slug as string)

// Query the activity by slug
const { data: activityRaw } = await useAsyncData(
  () => `activity-${slug.value}`,
  () => queryCollection('activities').path(`/activities/${slug.value}`).first(),
  { watch: [slug] }
)

// Parse the activity into the ActivityEntryType format
const activity = computed<ActivityEntryType | null>(() => {
  if (!activityRaw.value) return null
  const parsed = parseActivities([activityRaw.value])
  return parsed.length ? parsed[0] : null
})

// Related courses and degrees from frontmatter
const relatedCourseSlugs = computed(() => {
  if (!activityRaw.value) return []
  const meta = (activityRaw.value as { meta?: Record<string, unknown> }).meta || {}
  const courses = meta.relatedCourses as string[] | undefined
  return Array.isArray(courses) ? courses : []
})

const relatedDegreeSlugs = computed(() => {
  if (!activityRaw.value) return []
  const meta = (activityRaw.value as { meta?: Record<string, unknown> }).meta || {}
  const degrees = meta.relatedDegrees as string[] | undefined
  return Array.isArray(degrees) ? degrees : []
})

// Fetch related courses (courses have nested _index.md structure)
const { data: relatedCourses } = await useAsyncData(
  () => `related-courses-${slug.value}`,
  async () => {
    if (relatedCourseSlugs.value.length === 0) return []
    const results: { slug: string, title: string, description: string }[] = []
    for (const courseSlug of relatedCourseSlugs.value) {
      const courses = await queryCollection('courses').where('stem', 'LIKE', `courses/${courseSlug}/%`).all()
      const index = courses.find((c: { stem?: string }) => c.stem?.endsWith('/_index'))
      if (index) {
        results.push({
          slug: courseSlug,
          title: (index.title as string) || courseSlug,
          description: ((index.meta || {}) as { description?: string }).description || ''
        })
      }
    }
    return results
  }
)

// Fetch related degrees (degrees are flat files)
const { data: relatedDegrees } = await useAsyncData(
  () => `related-degrees-${slug.value}`,
  async () => {
    if (relatedDegreeSlugs.value.length === 0) return []
    const results: { slug: string, title: string, description: string }[] = []
    for (const degreeSlug of relatedDegreeSlugs.value) {
      const degree = await queryCollection('degrees').where('stem', `degrees/${degreeSlug}`).first()
      if (degree) {
        results.push({
          slug: degreeSlug,
          title: (degree.title as string) || degreeSlug,
          description: ((degree.meta || {}) as { description?: string }).description || ''
        })
      }
    }
    return results
  }
)

// Field values for the form
const fieldValues = ref<Record<string, Record<string, number>>>({})

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

function getFieldUnit(act: Record<string, unknown>, fieldId: string): string {
  const fields = (act.fields as { id: string, unit: string }[]) || []
  const field = fields.find(f => f.id === fieldId)
  return field?.unit || ''
}

function getRecentSessionsWrapper(act: Record<string, unknown>) {
  return getRecentSessions(act as ActivityEntryType, store)
}

function deleteSessionWrapper(act: Record<string, unknown>, index: number) {
  deleteSessionHelper(act as ActivityEntryType, index, store)
}

function submitSessionWrapper(act: Record<string, unknown>) {
  submitSessionHelper(act as ActivityEntryType, fieldValues.value, store)
}

const breadcrumbs = computed(() => [
  { label: 'Activities', icon: 'i-lucide-dumbbell', to: '/activities' },
  { label: activity.value?.title || slug.value }
])

const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const pageActivityTitle = computed(() => activity.value?.title || slug.value)
useHead({ title: `${pageActivityTitle.value} - Activities - KiSS` })
</script>
