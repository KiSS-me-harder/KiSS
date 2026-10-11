<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'
import { useScheduleStore } from '~/stores/schedule'
import { useStudyPlanStore } from '~/stores/studyPlan'

const store = useEnrollmentStore()
const scheduleStore = useScheduleStore()
const planStore = useStudyPlanStore()
const { app } = useRuntimeConfig()

const { data: allClasses } = await useAsyncData('today-tasks-classes', () => queryCollection('classes').all())

// Load clubs and activities for club membership section
const { data: allClubs } = await useAsyncData('today-tasks-clubs', () => queryCollection('clubs').all())
const { data: allActivities } = await useAsyncData('today-tasks-activities', () => queryCollection('activities').all())

// Build a map of club slug -> activity slugs
const clubActivitiesMap = computed(() => {
  const map: Record<string, string[]> = {}
  if (!allClubs.value) return map
  for (const club of allClubs.value) {
    const meta = (club as Record<string, unknown>)?.meta
    const clubActs = meta?.clubActivities
    if (Array.isArray(clubActs) && clubActs.length > 0) {
      // Use the slug field directly
      const clubSlug = (club as Record<string, unknown>).slug
      if (clubSlug) {
        map[clubSlug] = clubActs
      }
    }
  }
  return map
})

// Get activity slugs from joined clubs
const subscribedActivitySlugs = computed(() => {
  return store.getClubActivitySlugs(clubActivitiesMap.value)
})

// Get activity details for subscribed activities
const subscribedActivities = computed(() => {
  if (!allActivities.value || subscribedActivitySlugs.value.length === 0) return []
  const slugs = new Set(subscribedActivitySlugs.value)
  return allActivities.value.filter((a) => {
    const stem = (a as Record<string, unknown>).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) return false
    return slugs.has(parts[1])
  })
})

// Helper: extract short activity slug from stem
function getActivitySlug(activity: Record<string, unknown>): string {
  const stem = activity?.stem || ''
  const parts = stem.split('/')
  return parts.length >= 2 ? parts[1] : stem
}

// Group subscribed activities by category
const subscribedActivityGroups = computed(() => {
  const groups: Record<string, unknown[]> = {}
  for (const activity of subscribedActivities.value) {
    const meta = (activity as Record<string, unknown>)?.meta || {}
    const category = meta.category || 'General'
    if (!groups[category]) groups[category] = []
    groups[category].push(activity)
  }
  return groups
})

// ── Enrolled class tasks ──

interface ClassTaskItem {
  id: string
  title: string
  completed: boolean
  completedKey: string // unique key for tracking completion across days
}

interface ClassTaskGroup {
  slug: string
  name: string
  degree: string
  degreeLabel: string
  image: string
  currentLevel: number
  examTasks: ClassTaskItem[]
  metrics: LessonMetric[]
}

interface LessonMetric {
  id: string
  label: string
  unit: string
  target: number
  currentValue: number
}

// Get today's date key for daily task completion tracking
const todayKey = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
})

// Load daily completions from store on mount
onMounted(() => {
  scheduleStore.loadDailyCompleted(todayKey.value)
})

function toggleTaskCompleted(taskId: string) {
  scheduleStore.toggleDailyCompleted(todayKey.value, taskId)
}

// Build task groups from enrolled classes
const enrolledTaskGroups = computed(() => {
  const enrollments = store.enrollments.value
  if (!allClasses.value || !enrollments || enrollments.length === 0) return []

  const groups: ClassTaskGroup[] = []

  for (const enrollment of enrollments) {
    const { slug, className, degree } = enrollment

    // Find all lessons for this class
    const prefix = `classes/${degree}/${className}/`
    const classLessons = allClasses.value.filter(item => (item as Record<string, unknown>).stem?.startsWith(prefix))

    if (classLessons.length === 0) continue

    // Find current level (first incomplete level)
    const enrollmentLevels = enrollment.levels.sort((a, b) => a.level - b.level)
    const currentLevel = enrollmentLevels.find(l => !l.completed)?.level ?? enrollmentLevels[enrollmentLevels.length - 1]?.level

    if (currentLevel === undefined) continue

    // Find the lesson for the current level
    const currentLesson = classLessons.find((item) => {
      const level = parseInt((item as Record<string, unknown>).meta?.level, 10)
      return level === currentLevel
    })

    if (!currentLesson) continue

    const meta = (currentLesson as Record<string, unknown>).meta || {}
    const examTasks = (meta.exam || []).map((task: string, i: number) => ({
      id: `${slug}-${currentLevel}-exam-${i}`,
      title: task,
      completed: scheduleStore.isDailyCompleted(todayKey.value, `${slug}-${currentLevel}-exam-${i}`),
      completedKey: `${slug}-${currentLevel}-exam-${i}`
    }))

    // Build metrics from lesson
    const lessonMetrics: LessonMetric[] = (meta.metrics || []).map((m: Record<string, unknown>) => ({
      id: m.id,
      label: m.label,
      unit: m.unit,
      target: m.target,
      currentValue: m.currentValue || 0
    }))

    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    groups.push({
      slug,
      name: meta.class || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      degree,
      degreeLabel,
      image: `${app.baseURL}img/degrees/${degree}.webp`,
      currentLevel,
      examTasks,
      metrics: lessonMetrics
    })
  }

  return groups.sort((a, b) => a.name.localeCompare(b.name))
})

// ── Metric activities removed — metrics are now milestone-based, not daily tasks ──

// ── Single-shot task queue ──
// These are one-time tasks that auto-dismiss when the condition is resolved

interface SingleShotTask {
  id: string
  title: string
  description: string
  icon: string
  to: string
  linkText: string
}

// Load routine assignments from store
const routineAssignments = computed(() => scheduleStore.routineAssignments)

// Force re-evaluation when the store loads from localStorage after hydration
const tasksForceUpdate = ref(0)

if (import.meta.client) {
  // Watch the store refs deeply so any change triggers a re-evaluation
  watch([store.clubMemberships, store.enrollments], () => {
    tasksForceUpdate.value++
  }, { deep: true })

  // Also force re-evaluation after Nuxt hydration completes, in case the store
  // loaded data before this component's watch was set up
  const nuxtApp = useNuxtApp()
  if (!nuxtApp.isHydrated) {
    watch(() => nuxtApp.isHydrated, (hydrated) => {
      if (hydrated) {
        tasksForceUpdate.value++
      }
    }, { once: true })
  }

  // Also listen for storage events from other tabs
  window.addEventListener('storage', () => {
    tasksForceUpdate.value++
  })
}

const singleShotTasks = computed(() => {
  const tasks: SingleShotTask[] = []

  // Force re-evaluation when tasksForceUpdate changes
  const _ = tasksForceUpdate.value

  // Skip all checks during SSR — store data is only available on the client
  if (!import.meta.client) return tasks

  // Access store refs safely — they are initialized as empty arrays,
  // but during SSR hydration there's a brief window where .value might be undefined
  const clubCount = store.clubMemberships.length ?? 0
  const enrollmentCount = store.enrollments.length ?? 0

  // 1. Join a club — show task only if member of 0 clubs
  if (clubCount === 0) {
    tasks.push({
      id: 'join-club',
      title: 'Join a Club',
      description: 'Join a club to get recommended activities for your daily routine.',
      icon: 'i-lucide-users',
      to: '/clubs',
      linkText: 'Browse clubs →'
    })
  }

  // 2. Join a degree — show task only if enrolled in 0 classes
  if (enrollmentCount === 0) {
    tasks.push({
      id: 'join-degree',
      title: 'Join a Degree',
      description: 'Enroll in a degree program to start your first class.',
      icon: 'i-lucide-graduation-cap',
      to: '/degrees',
      linkText: 'Browse degrees →'
    })
  }

  // 3. Club activities not in routine — suggest adding them
  const routineActivitySlugs = new Set(routineAssignments.value.map(a => a.activitySlug))
  const unsubscribedActivities = subscribedActivities.value.filter((a) => {
    const stem = (a as Record<string, unknown>).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) return false
    return !routineActivitySlugs.has(parts[1])
  })

  if (unsubscribedActivities.length > 0) {
    // Group by category for the task descriptions
    const categories = new Set()
    for (const a of unsubscribedActivities) {
      const meta = (a as Record<string, unknown>)?.meta || {}
      categories.add(meta.category || 'General')
    }
    const categoryList = [...categories].join(', ')
    tasks.push({
      id: 'add-club-activities-to-routine',
      title: `Add ${unsubscribedActivities.length} Club Activit${unsubscribedActivities.length === 1 ? 'y' : 'ies'} to Routine`,
      description: `You have club activities from ${categoryList} not scheduled in your routine.`,
      icon: 'i-lucide-list-checks',
      to: '#routine',
      linkText: 'Add to routine →'
    })
  }

  // 4. Unscheduled enrolled classes (classes in study plan not yet enrolled)
  if (plannedClasses.value.length > 0) {
    tasks.push({
      id: 'enroll-planned-classes',
      title: `Enroll in ${plannedClasses.value.length} Planned Class${plannedClasses.value.length === 1 ? '' : 'es'}`,
      description: 'You have classes in your study plan that you haven\'t enrolled in yet.',
      icon: 'i-lucide-book-open',
      to: '/study-plan',
      linkText: 'Open study plan →'
    })
  }

  return tasks
})

// ── Study plan classes (planned but not yet enrolled) ──

const plannedClasses = computed(() => {
  const planIds = Array.from(planStore.studyPlan)

  // Filter out already enrolled classes
  const enrollments = store.enrollments.value
  const enrolledSlugs = new Set((enrollments || []).map(e => e.slug))
  const planned = planIds.filter(id => !enrolledSlugs.has(id) && id !== 'student')

  return planned.map((id) => {
    const parts = id.split('/')
    const degree = parts[0] || ''
    const className = parts[1] || ''
    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const name = className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return {
      slug: id,
      name,
      degree,
      degreeLabel,
      image: `${app.baseURL}img/degrees/${degree}.webp`,
      to: `/classes/${id}`
    }
  })
})

const hasTasks = computed(() => singleShotTasks.value.length > 0 || enrolledTaskGroups.value.length > 0 || subscribedActivities.value.length > 0 || plannedClasses.value.length > 0)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-clipboard-list" class="size-5 text-muted" />
        <h2 class="text-base font-semibold">
          Today's Tasks
        </h2>
      </div>
      <span v-if="hasTasks" class="text-xs text-muted">
        <template v-if="enrolledTaskGroups.length">{{ enrolledTaskGroups.length }} class{{ enrolledTaskGroups.length !== 1 ? 'es' : '' }}</template>
        <template v-if="enrolledTaskGroups.length && subscribedActivities.length"> · </template>
        <template v-if="subscribedActivities.length">{{ subscribedActivities.length }} activit{{ subscribedActivities.length !== 1 ? 'ies' : 'y' }}</template>
      </span>
    </div>

    <div v-if="!hasTasks" class="text-center py-8 text-muted">
      <UIcon name="i-lucide-clipboard-list" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">
        No tasks for today.
      </p>
      <p class="text-xs mt-1">
        Enroll in classes or join clubs to see tasks here.
      </p>
    </div>

    <div v-else class="space-y-4">
      <!-- Single-Shot Task Queue -->
      <template v-if="singleShotTasks.length">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-4 text-amber-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Action Items
          </h3>
          <span class="text-xs text-muted">({{ singleShotTasks.length }})</span>
        </div>

        <UCard
          v-for="task in singleShotTasks"
          :key="task.id"
        >
          <div class="flex items-start gap-3 p-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <UIcon :name="task.icon" class="w-4 h-4 text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">
                {{ task.title }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ task.description }}
              </p>
            </div>
            <NuxtLink
              :to="task.to"
              class="text-xs text-primary hover:underline shrink-0 self-center"
            >
              {{ task.linkText }}
            </NuxtLink>
          </div>
        </UCard>
      </template>

      <!-- Enrolled Class Tasks -->
      <template v-if="enrolledTaskGroups.length">
        <UCard
          v-for="group in enrolledTaskGroups"
          :key="group.slug"
          :ui="{
            root: 'overflow-hidden',
            body: 'p-0'
          }"
        >
          <div class="flex flex-col sm:flex-row gap-4 p-4">
            <div class="shrink-0">
              <div class="w-24 h-32 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center relative">
                <img
                  v-if="group.image"
                  :src="group.image"
                  :alt="group.name"
                  class="w-full h-full object-cover"
                >
                <UIcon v-else name="i-lucide-image" class="size-12 text-muted" />
              </div>
              <p class="text-xs text-muted mt-1 text-center truncate" :title="group.name">
                {{ group.name }}
              </p>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                    {{ group.degreeLabel }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                    Level {{ group.currentLevel }}
                  </span>
                </div>
                <NuxtLink
                  :to="`/classes/${group.slug}`"
                  class="text-xs text-primary hover:underline"
                >
                  Open class →
                </NuxtLink>
              </div>

              <!-- Exam / Homework Tasks -->
              <div v-if="group.examTasks.length">
                <p class="text-xs font-semibold text-warning mb-2 uppercase">
                  Homework & Exams
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="task in group.examTasks"
                    :key="task.id"
                    class="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated/50 transition-colors cursor-pointer"
                    :class="{ 'opacity-50': task.completed }"
                    @click="toggleTaskCompleted(task.completedKey)"
                  >
                    <UIcon
                      :name="task.completed ? 'i-lucide-check-circle' : 'i-lucide-circle'"
                      class="size-4 shrink-0"
                      :class="task.completed ? 'text-success' : 'text-muted'"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate" :class="{ 'line-through': task.completed }">
                        {{ task.title }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lesson Metrics -->
              <div v-if="group.metrics.length" class="mt-3">
                <p class="text-xs font-semibold text-muted mb-2 uppercase">
                  Lesson Metrics
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="metric in group.metrics"
                    :key="metric.id"
                    class="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                  >
                    <UIcon name="i-lucide-target" class="size-4 text-purple-400 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate">
                        {{ metric.label }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <div class="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            :style="{ width: `${Math.min(100, (metric.currentValue / metric.target) * 100)}%` }"
                          />
                        </div>
                        <span class="text-xs text-muted shrink-0">
                          {{ metric.currentValue }}/{{ metric.target }} {{ metric.unit }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Club Activities -->
      <template v-if="Object.keys(subscribedActivityGroups).length > 0">
        <div class="flex items-center gap-2 pt-2">
          <UIcon name="i-lucide-users" class="size-4 text-purple-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Club Activities
          </h3>
          <span class="text-xs text-muted">({{ subscribedActivities.length }})</span>
        </div>

        <template v-for="(activities, category) in subscribedActivityGroups" :key="category">
          <UCard>
            <div class="p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                  {{ category }}
                </span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="activity in activities"
                  :key="activity.stem"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
                >
                  <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <UIcon
                      :name="(activity as Record<string, unknown>).meta?.icon || 'i-lucide-circle-dot'"
                      class="w-4 h-4 text-purple-400"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-white truncate">
                      {{ (activity as Record<string, unknown>).title }}
                    </p>
                    <p v-if="(activity as Record<string, unknown>).meta?.description" class="text-xs text-muted line-clamp-1">
                      {{ (activity as Record<string, unknown>).meta.description }}
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/activities#${getActivitySlug(activity)}`"
                    class="text-xs text-primary hover:underline shrink-0"
                  >
                    Log →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </UCard>
        </template>
      </template>

      <!-- Planned Classes (not yet enrolled) -->
      <template v-if="plannedClasses.length">
        <div class="flex items-center gap-2 pt-2">
          <UIcon name="i-lucide-git-branch" class="size-4 text-blue-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Planned Classes
          </h3>
        </div>

        <UCard>
          <div class="p-4 space-y-2">
            <div
              v-for="planned in plannedClasses"
              :key="planned.slug"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
            >
              <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="w-4 h-4 text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">
                  {{ planned.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ planned.degreeLabel }}
                </p>
              </div>
              <NuxtLink
                :to="planned.to"
                class="text-xs text-primary hover:underline shrink-0"
              >
                Enroll →
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>
