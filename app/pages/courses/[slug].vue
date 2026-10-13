<!-- Class detail page -->
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
      <div v-if="courseData" class="space-y-6">
        <!-- Header Section -->
        <div class="relative rounded-xl overflow-hidden border border-white/10 shadow-lg">
          <img :src="courseData.image" :alt="courseData.title" class="w-full h-48 object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <div class="flex items-center gap-2 mb-1">
              <span v-if="isEnrolled" class="px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
                Enrolled
              </span>
            </div>
            <h1 class="text-xl font-bold text-white leading-tight">
              {{ courseData.title }}
            </h1>
            <div v-if="isEnrolled" class="mt-3">
              <div class="flex items-center justify-between text-[10px] text-white/60 mb-1">
                <span>Progress</span>
                <span>{{ completedCount }}/{{ totalLevels }} levels</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" :style="{ width: progressPercent + '%' }" />
              </div>
            </div>
            <div class="mt-3">
              <UButton
                v-if="!isEnrolled"
                size="xs"
                color="primary"
                @click="handleEnroll"
              >
                <template #leading>
                  <UIcon name="i-lucide-plus" class="size-3" />
                </template>
                Enroll in Course
              </UButton>
              <UButton
                v-else
                size="xs"
                color="error"
                variant="outline"
                @click="handleUnenroll"
              >
                <template #leading>
                  <UIcon name="i-lucide-minus" class="size-3" />
                </template>
                Unenroll
              </UButton>
            </div>
          </div>
        </div>

        <!-- Class Description -->
        <div v-if="courseData.description" class="rounded-xl border border-white/10 p-4 bg-white/5">
          <p class="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {{ courseData.description }}
          </p>
        </div>

        <!-- Level Groups -->
        <div v-for="group in levelGroups" :key="group.label" class="space-y-3">
          <button type="button" class="flex items-center gap-3 w-full group/header text-left" @click="toggleGroup(group.label)">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" :class="group.badgeColor">
                {{ group.badge }}
              </span>
              <div>
                <h2 class="text-sm font-semibold text-white">
                  {{ group.label }}
                </h2>
                <p class="text-[10px] text-muted">
                  {{ group.count }} levels
                </p>
              </div>
            </div>
            <div class="flex-1 h-px bg-white/10" />
            <UIcon :name="collapsedGroups.has(group.label) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'" class="w-4 h-4 text-white/40 transition-transform duration-200 group-hover/header:text-white/70" />
          </button>

          <div v-show="!collapsedGroups.has(group.label)" class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
            <ClassesClassLevelCard
              v-for="level in group.levels"
              :key="level.level"
              :level="level.level"
              :title="level.title"
              :description="level.description"
              :dependencies="level.dependencies"
              :class-image="courseData.image"
              :level-url="`/courses/${slug}/${level.level}`"
              :enrolled="isEnrolled"
              :is-eligible="isEligible(level)"
              :is-completed="isLevelCompleted(level.level)"
            />
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

const route = useRoute()
const { app } = useRuntimeConfig()

const slug = computed(() => route.params.slug as string)
const store = useEnrollmentStore()

const { data: allCourses } = useAsyncData(
  () => `class-levels-${slug.value}`,
  () => queryCollection('courses').all(),
  { watch: [slug] }
)

const { data: allDegrees } = useAsyncData(
  'course-detail-degrees',
  () => queryCollection('degrees').all()
)

const filteredCourses = computed(() => {
  if (!allCourses.value) return []
  const prefix = `courses/${slug.value}/`
  return allCourses.value.filter(item => item.stem?.startsWith(prefix))
})

// Find the first degree that contains this course
const courseDegree = computed(() => {
  if (!allDegrees.value) return ''
  for (const degree of allDegrees.value) {
    const levels = (degree as { levels?: unknown[] }).levels || []
    for (const level of levels as { courses?: { slug?: string }[] }[]) {
      for (const course of level.courses || []) {
        if ((course as { slug?: string }).slug === slug.value) {
          return (degree as { stem?: string }).stem?.split('/').pop() || ''
        }
      }
    }
  }
  return ''
})

const courseData = computed(() => {
  const classes = filteredCourses.value
  if (!classes || classes.length === 0) return null
  const className = slug.value
  const degreeValue = courseDegree.value
  const degreeLabel = degreeValue.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const indexItem = classes.find(item => item.stem?.endsWith('/_index'))
  const title = indexItem
    ? (indexItem.title || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    : className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const description = indexItem ? (indexItem.description || '') : ''
  return {
    slug: slug.value,
    title,
    degree: degreeValue,
    degreeLabel,
    image: degreeValue ? `${app.baseURL}img/degrees/${degreeValue}.webp` : `${app.baseURL}img/courses/${className}.webp`,
    description
  }
})

const levelGroups = computed(() => {
  const classes = filteredCourses.value
  if (!classes) return []
  const groups: {
    label: string
    badge: string
    badgeColor: string
    count: number
    levels: { level: number, title: string, description: string, dependencies: { course: string, level: number }[] }[]
  }[] = [
    { label: 'Beginner', badge: '1', badgeColor: 'bg-green-500', count: 0, levels: [] },
    { label: 'Intermediate', badge: '2', badgeColor: 'bg-blue-500', count: 0, levels: [] },
    { label: 'Advanced', badge: '3', badgeColor: 'bg-red-500', count: 0, levels: [] }
  ]
  for (const item of classes) {
    const parts = (item.stem as string)?.split('/') || []
    const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
    let groupIndex: number | undefined
    if (isNaN(level)) continue
    if (level >= 100 && level < 200) groupIndex = 0
    else if (level >= 200 && level < 300) groupIndex = 1
    else if (level >= 300 && level < 400) groupIndex = 2
    else continue
    const gi = groups[groupIndex]
    if (gi) {
      const dependencies: { course: string, level: number }[] = []
      let description = ''
      const body = typeof (item as unknown as { body?: unknown }).body === 'string' ? (item as unknown as { body: string }).body : ''
      if (body) {
        description = body.replace(/\*\*[^*]*\*\*/g, '').replace(/\* Key Takeaways:[\s\S]*/i, '').trim()
      }
      gi.levels.push({ level, title: item.title, description, dependencies })
    }
  }
  for (const group of groups) {
    group.levels.sort((a, b) => a.level - b.level)
    group.count = group.levels.length
  }
  return groups.filter(g => g.count > 0)
})

const items = computed<BreadcrumbItem[]>(() => [
  { label: 'Courses', icon: 'i-lucide-book-text', to: '/courses' },
  { label: courseData.value?.title, to: `/courses/${slug.value}` }
])

const isEnrolled = computed(() => store.isEnrolled(slug.value))
const enrollment = computed(() => store.getEnrollment(slug.value))
const totalLevels = computed(() => filteredCourses.value.filter(item => !item.stem?.endsWith('/_index')).length)

const completedCount = computed(() => {
  if (!enrollment.value) return 0
  return enrollment.value.levels.filter((l: { completed: boolean }) => l.completed).length
})

const progressPercent = computed(() => {
  if (totalLevels.value === 0) return 0
  return Math.round((completedCount.value / totalLevels.value) * 100)
})

function isLevelCompleted(level: number): boolean {
  return store.isLevelCompleted(slug.value, level)
}

function isEligible(level: { level: number, dependencies: { course: string, level: number }[] }): boolean {
  if (!level.dependencies.length) return true
  return store.areDependenciesMet(slug.value, level.level, level.dependencies)
}

function handleEnroll() {
  const levels = filteredCourses.value
    .filter(item => !item.stem?.endsWith('/_index'))
    .map((item) => {
      const parts = (item.stem as string)?.split('/') || []
      return parseInt(parts[2] ?? '0', 10)
    })
    .filter(l => !isNaN(l))
  store.enrollInCourse(slug.value, slug.value, courseDegree.value, levels)
}

function handleUnenroll() {
  store.unenrollFromCourse(slug.value)
}

const collapsedGroups = ref(new Set<string>())

function toggleGroup(label: string) {
  if (collapsedGroups.value.has(label)) {
    collapsedGroups.value.delete(label)
  } else {
    collapsedGroups.value.add(label)
  }
}

useSeoMeta({
  title: courseData.value?.title,
  description: courseData.value?.description
})
</script>
