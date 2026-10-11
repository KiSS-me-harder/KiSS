<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Activities
            </h1>
            <p class="text-white/60 mt-1">
              Log your training sessions below. Each activity contributes data to your metrics.
            </p>
          </div>
        </div>

        <div v-if="activities.length === 0" class="text-center py-12 text-white/50">
          <UIcon name="i-lucide-dumbbell" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-lg">
            No activities defined yet.
          </p>
          <p class="text-sm mt-1">
            Add activity content files to content/activities/ to get started.
          </p>
        </div>

        <!-- Collapsible categories -->
        <div v-for="category in categories" :key="category.name" class="space-y-3">
          <!-- Category header (clickable to toggle) -->
          <button
            class="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 transition-all duration-200 hover:bg-white/10 hover:border-white/20"
            @click="toggleCategory(category.name)"
          >
            <div class="flex items-center gap-3">
              <UIcon :name="category.icon" class="w-5 h-5 text-purple-400" />
              <span class="text-base font-semibold text-white">{{ category.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{{ category.activities.length }}</span>
            </div>
            <UIcon
              :name="isCategoryOpen(category.name) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-5 h-5 text-white/40 transition-transform duration-200"
            />
          </button>

          <!-- Category activities -->
          <div v-if="isCategoryOpen(category.name)" class="space-y-3 pl-0 sm:pl-3">
            <div
              v-for="activity in category.activities"
              :id="`activity-${activity.slug}`"
              :key="activity.slug"
              class="rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-200"
              :class="{ 'ring-2 ring-purple-500': highlightedActivity === activity.slug }"
            >
              <!-- Activity header -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <UIcon :name="activity.icon || 'i-lucide-dumbbell'" class="w-5 h-5 text-purple-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold text-white">
                      {{ activity.title }}
                    </h3>
                    <button
                      class="shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                      title="What is this activity?"
                      @click="selectedActivity = activity; showHelp = true"
                    >
                      <UIcon name="i-lucide-circle-help" class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-sm text-white/50 mt-0.5">
                    {{ activity.description }}
                  </p>
                  <!-- Contributed metrics -->
                  <div v-if="activity.contributions.length > 0" class="flex flex-wrap gap-1.5 mt-2">
                    <span
                      v-for="contribution in activity.contributions"
                      :key="contribution.metric"
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400"
                    >
                      <UIcon name="i-lucide-arrow-right" class="w-3 h-3" />
                      {{ contribution.metric }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Inline form -->
              <form class="space-y-3" @submit.prevent="submitSession(activity)">
                <div class="flex flex-wrap gap-3">
                  <div
                    v-for="field in activity.fields"
                    :key="field.id"
                    class="flex-1 min-w-[140px]"
                  >
                    <label :for="`${activity.slug}-${field.id}`" class="block text-xs font-medium text-white/60 mb-1.5">
                      {{ field.label }}
                      <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                      <span class="text-white/30 ml-1">({{ field.unit }})</span>
                    </label>
                    <input
                      :id="`${activity.slug}-${field.id}`"
                      type="number"
                      step="0.1"
                      min="0"
                      :required="field.required"
                      class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                      :value="getFieldValue(activity.slug, field.id)"
                      @input="onFieldChange(activity.slug, field.id, $event)"
                    >
                  </div>
                </div>
                <div class="flex items-center justify-between pt-1">
                  <div class="flex items-center gap-1.5 text-xs text-white/30">
                    <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                    <span>{{ todayFormatted }}</span>
                  </div>
                  <button
                    type="submit"
                    class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-500/80 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-md shadow-purple-500/10"
                  >
                    <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                    Log
                  </button>
                </div>
              </form>

              <!-- Recent sessions -->
              <div v-if="getRecentSessions(activity).length > 0" class="mt-4 pt-4 border-t border-white/5">
                <p class="text-xs font-medium text-white/40 mb-2">
                  Recent sessions
                </p>
                <div class="space-y-1.5 max-h-32 overflow-y-auto">
                  <div
                    v-for="(session, sIdx) in getRecentSessions(activity).slice(0, 5)"
                    :key="sIdx"
                    class="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white/5"
                  >
                    <span class="text-white/50">{{ formatDate(session.timestamp) }}</span>
                    <div class="flex items-center gap-2">
                      <span v-for="(val, fId) in session.values" :key="fId" class="text-white/70">
                        {{ val }}{{ getFieldUnit(activity, fId) }}
                      </span>
                      <button
                        class="text-white/20 hover:text-red-400 transition-colors"
                        @click="deleteSession(activity, sIdx)"
                      >
                        <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Activity Help Dialog -->
  <UModal v-model:open="showHelp" class="max-w-lg">
    <template #header>
      <div class="text-lg font-semibold text-white">
        {{ selectedActivity?.title || '' }}
      </div>
    </template>
    <template #body>
      <div v-if="selectedActivity" class="py-2">
        <p class="text-white/70 leading-relaxed">
          {{ selectedActivity.longDescription || selectedActivity.description }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton
          label="Close"
          color="neutral"
          variant="outline"
          @click="showHelp = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

const store = useEnrollmentStore()
const showHelp = ref(false)
const selectedActivity = ref(null)

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Activities',
    icon: 'i-lucide-dumbbell',
    to: '/activities'
  }
])

const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

// Collapsible categories state
const openCategories = ref<Set<string>>(new Set(['Anal Training', 'Oral Training', 'Mental Training', 'Fashion', 'Performance']))

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

// Hash-based navigation: highlight and scroll to activity from URL fragment
const route = useRoute()
const highlightedActivity = ref<string | null>(null)

function handleHashNavigation() {
  if (!import.meta.client) return
  const hash = route.hash?.slice(1) // Remove the '#' prefix
  if (!hash) return

  // Find the activity and its category
  for (const category of categories.value) {
    const activity = category.activities.find(a => a.slug === hash)
    if (activity) {
      // Open the category if closed
      if (!openCategories.value.has(category.name)) {
        openCategories.value.add(category.name)
      }
      highlightedActivity.value = hash
      // Scroll into view after DOM updates
      nextTick(() => {
        const el = document.getElementById(`activity-${hash}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-transparent')
          // Remove highlight after animation
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

// Watch for hash changes and run on mount
watch(() => route.hash, () => handleHashNavigation())
onMounted(() => {
  handleHashNavigation()
})

// Field values for forms
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

const { data: allActivities } = await useAsyncData('activities-all', () => queryCollection('activities').all())

// Group activities by slug, combining _index.md files
const activities = computed(() => {
  if (!allActivities.value) return []

  const activityMap = new Map<string, any>()

  for (const item of allActivities.value) {
    const stem = (item as any).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) continue
    const activitySlug = parts[1]

    if (parts[2] === '_index') {
      const itemAny = item as any
      const meta = itemAny.meta || {}
      const fields = meta.fields || []
      const contribs = meta.contributions || []
      activityMap.set(activitySlug, {
        slug: activitySlug,
        title: itemAny.title || activitySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: meta.description || '',
        longDescription: meta.longDescription || '',
        icon: meta.icon || 'i-lucide-dumbbell',
        category: meta.category || 'General',
        fields: Array.isArray(fields) ? fields : [],
        contributions: Array.isArray(contribs) ? contribs : []
      })
    }
  }

  return Array.from(activityMap.values()).sort((a, b) => a.title.localeCompare(b.title))
})

// Initialize field values for all activities
for (const activity of activities.value) {
  fieldValues.value[activity.slug] = {}
  for (const field of activity.fields) {
    fieldValues.value[activity.slug][field.id] = 0
  }
}

const categories = computed(() => {
  const categoryMap = new Map<string, { name: string, icon: string, activities: typeof activities.value[number][] }>()

  const categoryIcons: Record<string, string> = {
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

  // Define category order
  const categoryOrder = [
    'Anal Training', 'Oral Training', 'Body Development', 'Flexibility',
    'Mental Training', 'Fashion', 'Performance',
    'Discipline', 'Pet Play', 'Roleplay', 'Sensory Play', 'Service',
    'Voyeur & Exhibition', 'Impact Play', 'General'
  ]

  for (const activity of activities.value) {
    const cat = activity.category || 'General'
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        name: cat,
        icon: categoryIcons[cat] || 'i-lucide-dumbbell',
        activities: []
      })
    }
    categoryMap.get(cat)!.activities.push(activity)
  }

  // Sort categories by defined order
  return Array.from(categoryMap.values()).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a.name)
    const bIdx = categoryOrder.indexOf(b.name)
    if (aIdx === -1 && bIdx === -1) return a.name.localeCompare(b.name)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
})

function submitSession(activity: any) {
  if (!activity) return

  if (activity.contributions && activity.contributions.length > 0) {
    store.logActivity(
      activity.slug,
      activity.contributions,
      { ...fieldValues.value[activity.slug] }
    )
  }

  // Reset form
  for (const field of activity.fields) {
    fieldValues.value[activity.slug][field.id] = 0
  }
}

function getFieldUnit(activity: any, fieldId: string): string {
  const field = activity.fields?.find((f: any) => f.id === fieldId)
  return field?.unit || ''
}

// Get recent sessions from metric data points
function getRecentSessions(activity: any) {
  if (!activity || !activity.contributions.length) return []

  const sessions: Array<{ timestamp: number, values: Record<string, number> }> = []

  for (const contribution of activity.contributions) {
    const dataPoints = store.getMetricDataPoints(contribution.metric)
    for (const dp of dataPoints) {
      if (dp.activitySlug !== activity.slug) continue

      // Find or create session entry
      let session = sessions.find(s => Math.abs(s.timestamp - dp.timestamp) < 1000)
      if (!session) {
        session = { timestamp: dp.timestamp, values: {} }
        sessions.push(session)
      }

      // Map metric field back to activity field
      for (const [activityField, metricField] of Object.entries(contribution.map || {})) {
        if (metricField === dp.fieldId) {
          session.values[activityField] = dp.value
          break
        }
      }
    }
  }

  // Sort by most recent first
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

function deleteSession(activity: any, sessionIndex: number) {
  const sessions = getRecentSessions(activity)
  const session = sessions[sessionIndex]
  if (!session) return

  // Delete all data points for this session
  for (const contribution of activity.contributions) {
    const progress = store.getMetricProgress(contribution.metric)
    if (progress && progress.dataPoints) {
      for (let i = progress.dataPoints.length - 1; i >= 0; i--) {
        const dp = progress.dataPoints[i]
        if (dp.activitySlug === activity.slug && Math.abs(dp.timestamp - session.timestamp) < 1000) {
          store.deleteDataPoint(contribution.metric, i)
        }
      }
    }
  }
}

function formatDate(timestamp: number): string {
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

useHead({
  title: 'Activities - KiSS'
})
</script>
