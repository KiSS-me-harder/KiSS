<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

const route = useRoute()

const id = computed(() => route.params.id as string)

const { data: home } = await useAsyncData(
  () => `degree-${id.value}`,
  () => queryCollection('degrees')
    .path(`/degrees/${id.value}`)
    .first(),
  {
    watch: [id]
  }
)

const { data: allClasses } = await useAsyncData('all-classes-degree', () => {
  return queryCollection('classes').all()
})

const title = computed(() => home.value?.title)
const description = computed(() => home.value?.description)
const body = computed(() => home.value?.body)

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  },
  {
    label: title.value,
    to: `/degrees/${id.value}`
  }
])

useSeoMeta({
  title,
  description
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Course',
            '@id': `https://kiss-academy.github.io/KiSS/degrees/${id.value}#course`,
            'url': `https://kiss-academy.github.io/KiSS/degrees/${id.value}`,
            'name': title.value,
            'description': description.value,
            'inLanguage': 'en',
            'provider': {
              '@type': 'Organization',
              'name': 'KiSS Academy',
              'url': 'https://kiss-academy.github.io/KiSS/'
            }
          },
          {
            '@type': 'WebPage',
            '@id': `https://kiss-academy.github.io/KiSS/degrees/${id.value}#webpage`,
            'url': `https://kiss-academy.github.io/KiSS/degrees/${id.value}`,
            'name': title.value,
            'description': description.value,
            'inLanguage': 'en',
            'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
          },
          {
            '@type': 'WebSite',
            '@id': 'https://kiss-academy.github.io/KiSS/#website',
            'url': 'https://kiss-academy.github.io/KiSS/',
            'name': 'KiSS Academy',
            'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
            'inLanguage': 'en'
          }
        ]
      }))
    }
  ]
})

// --- Enrollment Store ---
const store = useEnrollmentStore()
const { app } = useRuntimeConfig()

// --- Target Levels from degree frontmatter ---
interface DegreeLevelClass {
  slug: string
  maxLevel: number
}

interface DegreeLevel {
  name: string
  description: string
  classes: DegreeLevelClass[]
}

const degreeLevels = computed<DegreeLevel[]>(() => {
  return (home.value as any)?.meta?.levels || []
})

// Selected target level index
const selectedLevelIndex = ref(0)

const selectedLevel = computed<DegreeLevel | null>(() => {
  if (degreeLevels.value.length === 0) return null
  const idx = Math.min(selectedLevelIndex.value, degreeLevels.value.length - 1)
  return degreeLevels.value[idx]
})

// --- Build class info for the selected target level ---
interface ClassInfo {
  slug: string
  degree: string
  className: string
  classTitle: string
  maxLevel: number
  availableLevels: number[]
  isEnrolled: boolean
  completedLevels: number
  totalLevels: number
  image: string
  degreeLabel: string
  isCrossDegree: boolean
}

const classInfos = computed<ClassInfo[]>(() => {
  if (!selectedLevel.value || !allClasses.value) return []

  const result: ClassInfo[] = []
  const seenSlugs = new Set<string>()

  for (const dc of selectedLevel.value.classes) {
    if (seenSlugs.has(dc.slug)) continue
    seenSlugs.add(dc.slug)

    const [degree, className] = dc.slug.split('/')
    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const isCrossDegree = degree !== id.value

    // Find all levels for this class
    const prefix = `classes/${dc.slug}/`
    const classLevels = allClasses.value
      .filter(item => (item as any).stem?.startsWith(prefix))
      .map(item => ({
        level: parseInt((item as any).level, 10),
        title: (item as any).title,
        classTitle: (item as any).class
      }))
      .filter(item => !isNaN(item.level))
      .sort((a, b) => a.level - b.level)

    // Filter to maxLevel
    const availableLevels = classLevels
      .filter(item => item.level <= dc.maxLevel)
      .map(item => item.level)

    // Get class title from first level
    const classTitle = classLevels[0]?.classTitle || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    // Check enrollment
    const isEnrolled = store.isEnrolled(dc.slug)
    const enrollment = store.getEnrollment(dc.slug)
    const completedLevels = enrollment
      ? enrollment.levels.filter((l: { completed: boolean }) => l.completed).length
      : 0

    result.push({
      slug: dc.slug,
      degree,
      className,
      classTitle,
      maxLevel: dc.maxLevel,
      availableLevels,
      isEnrolled,
      completedLevels,
      totalLevels: availableLevels.length,
      image: `${app.baseURL}img/degrees/${degree}.webp`,
      degreeLabel,
      isCrossDegree
    })
  }

  return result
})

// --- Overall degree enrollment status ---
// Check if ALL classes for the selected title are enrolled
const isDegreeFullyEnrolled = computed(() => {
  if (classInfos.value.length === 0) return false
  return classInfos.value.every(c => c.isEnrolled)
})

// Check if ANY class for the selected title is enrolled (for partial enrollment state)
const isDegreePartiallyEnrolled = computed(() => {
  return classInfos.value.some(c => c.isEnrolled)
})

// --- Progress calculation ---
const overallProgress = computed(() => {
  if (classInfos.value.length === 0) return 0
  const totalLevels = classInfos.value.reduce((sum, c) => sum + c.totalLevels, 0)
  const completedLevels = classInfos.value.reduce((sum, c) => sum + c.completedLevels, 0)
  if (totalLevels === 0) return 0
  return Math.round((completedLevels / totalLevels) * 100)
})

// --- Enrollment actions ---
function handleEnrollInDegree() {
  if (!selectedLevel.value) return

  for (const dc of selectedLevel.value.classes) {
    if (!store.isEnrolled(dc.slug)) {
      // Find available levels for this class up to maxLevel
      const prefix = `classes/${dc.slug}/`
      const levels = allClasses.value!
        .filter(item => (item as any).stem?.startsWith(prefix))
        .map(item => parseInt((item as any).level, 10))
        .filter(l => !isNaN(l) && l <= dc.maxLevel)
        .sort((a, b) => a - b)

      const [degree, className] = dc.slug.split('/')
      store.enrollInClass(dc.slug, className, degree, levels)
    }
  }
}

function handleUnenrollFromDegree() {
  if (!selectedLevel.value) return

  for (const dc of selectedLevel.value.classes) {
    if (store.isEnrolled(dc.slug)) {
      store.unenrollFromClass(dc.slug)
    }
  }
}

// --- Title completion check ---
// Check if all classes for a title are fully completed
function isTitleCompleted(titleIndex: number): boolean {
  if (titleIndex >= degreeLevels.value.length) return false
  const title = degreeLevels.value[titleIndex]
  if (!title || !allClasses.value) return false

  for (const dc of title.classes) {
    // Check if this class is enrolled
    if (!store.isEnrolled(dc.slug)) return false

    // Check if all levels up to maxLevel are completed
    const prefix = `classes/${dc.slug}/`
    const levels = allClasses.value
      .filter(item => (item as any).stem?.startsWith(prefix))
      .map(item => parseInt((item as any).level, 10))
      .filter(l => !isNaN(l) && l <= dc.maxLevel)
      .sort((a, b) => a - b)

    for (const level of levels) {
      if (!store.isLevelCompleted(dc.slug, level)) return false
    }
  }
  return true
}

// Get the highest completed title index
const highestCompletedTitleIndex = computed(() => {
  for (let i = degreeLevels.value.length - 1; i >= 0; i--) {
    if (isTitleCompleted(i)) return i
  }
  return -1
})

// --- Level tier colors ---
function getTierColor(maxLevel: number) {
  if (maxLevel >= 300) return 'bg-red-500'
  if (maxLevel >= 200) return 'bg-blue-500'
  return 'bg-green-500'
}

function getTierLabel(maxLevel: number) {
  if (maxLevel >= 300) return 'Tier 3'
  if (maxLevel >= 200) return 'Tier 2'
  return 'Tier 1'
}

// --- Level name colors ---
const levelNameColors = [
  'text-amber-400',
  'text-blue-400',
  'text-purple-400'
]

const levelBadgeColors = [
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-purple-500/20 text-purple-400 border-purple-500/30'
]

</script>

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
      <div v-if="home" class="space-y-4">
        <!-- Two-column layout: image on left, content on right (desktop) -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <!-- Left Column: Hero Image (spans 2 columns on desktop) -->
          <div class="lg:col-span-2">
            <div class="relative rounded-lg overflow-hidden sticky top-4">
              <img
                :src="`${app.baseURL}img/degrees/${id}.webp`"
                :alt="title"
                class="w-full object-cover"
              />
            </div>
          </div>

          <!-- Right Column: Content (spans 3 columns on desktop) -->
          <div class="lg:col-span-3 space-y-4">
            <!-- Title & Description -->
            <div>
              <h1 class="text-xl font-semibold text-white mb-2">
                {{ title }}
              </h1>
              <p class="text-sm text-muted leading-relaxed">
                {{ description }}
              </p>
            </div>

            <!-- Body Content -->
            <div v-if="body" class="text-sm text-muted/80 leading-relaxed">
              <ContentRenderer :value="home" />
            </div>

            <!-- Target Title Selector -->
            <UCard v-if="degreeLevels.length">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-target" class="size-4 text-purple-400" />
                  <h2 class="text-base font-semibold">Target Title</h2>
                </div>
              </template>

              <p class="text-xs text-muted mb-3">
                Choose your target title for this degree. Each title represents a milestone with specific class requirements.
              </p>

              <div class="space-y-2">
                <button
                  v-for="(level, index) in degreeLevels"
                  :key="level.name"
                  type="button"
                  @click="selectedLevelIndex = index"
                  class="w-full text-left p-3 rounded-lg border transition-all duration-200"
                  :class="selectedLevelIndex === index
                    ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                      :class="[levelBadgeColors[index]]"
                    >
                      {{ level.name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold" :class="levelNameColors[index]">
                          {{ level.name }}
                        </span>
                        <span class="text-[10px] text-muted">
                          {{ level.classes.length }} class{{ level.classes.length !== 1 ? 'es' : '' }}
                        </span>
                        <!-- Completed badge -->
                        <UIcon
                          v-if="isTitleCompleted(index)"
                          name="i-lucide-trophy"
                          class="size-3.5 text-amber-400 shrink-0"
                        />
                        <!-- Locked indicator if previous title not completed -->
                        <UIcon
                          v-else-if="index > 0 && !isTitleCompleted(index - 1) && !isTitleCompleted(index)"
                          name="i-lucide-lock"
                          class="size-3.5 text-muted/60 shrink-0"
                        />
                      </div>
                      <p class="text-[11px] text-muted mt-0.5 line-clamp-1">
                        {{ level.description }}
                      </p>
                    </div>
                    <UIcon
                      v-if="selectedLevelIndex === index"
                      name="i-lucide-check-circle"
                      class="size-4 text-purple-400 shrink-0"
                    />
                  </div>
                </button>
              </div>
            </UCard>

            <!-- Target Goal Details -->
            <UCard v-if="selectedLevel">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-flag" class="size-4 text-amber-400" />
                  <h2 class="text-base font-semibold">
                    {{ selectedLevel.name }} — Target Goal
                  </h2>
                </div>
              </template>

              <p class="text-xs text-muted mb-3">
                To earn the <strong class="text-white">{{ selectedLevel.name }}</strong> title, you need to complete all the following classes:
              </p>

              <!-- Class Requirements List -->
              <div class="space-y-2">
                <div
                  v-for="classInfo in classInfos"
                  :key="classInfo.slug"
                  class="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5"
                >
                  <!-- Class Image -->
                  <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img
                      :src="classInfo.image"
                      :alt="classInfo.classTitle"
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- Class Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-white truncate">
                        {{ classInfo.classTitle }}
                      </span>
                      <span
                        v-if="classInfo.isCrossDegree"
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0"
                      >
                        {{ classInfo.degreeLabel }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                      <span class="px-1.5 py-0.5 rounded font-bold" :class="getTierColor(classInfo.maxLevel)">
                        {{ getTierLabel(classInfo.maxLevel) }}
                      </span>
                      <span>·</span>
                      <span>Levels up to {{ classInfo.maxLevel }}</span>
                    </div>
                  </div>

                  <!-- Status Icon -->
                  <div class="shrink-0">
                    <template v-if="classInfo.isEnrolled">
                      <UIcon
                        v-if="classInfo.completedLevels === classInfo.totalLevels"
                        name="i-lucide-check-circle-2"
                        class="size-5 text-emerald-400"
                      />
                      <UIcon
                        v-else
                        name="i-lucide-clock"
                        class="size-5 text-amber-400"
                      />
                    </template>
                    <UIcon
                      v-else
                      name="i-lucide-circle"
                      class="size-5 text-muted/40"
                    />
                  </div>
                </div>
              </div>

              <!-- Title Progress Summary -->
              <div class="mt-3 pt-3 border-t border-white/10">
                <div class="flex items-center justify-between text-xs text-muted">
                  <span>Title progress</span>
                  <span>
                    <strong class="text-white">{{ classInfos.filter(c => c.isEnrolled && c.completedLevels === c.totalLevels).length }}</strong>
                    /{{ classInfos.length }} classes completed
                  </span>
                </div>
                <UProgress
                  :model-value="classInfos.length > 0 ? (classInfos.filter(c => c.isEnrolled && c.completedLevels === c.totalLevels).length / classInfos.length) * 100 : 0"
                  :animated="false"
                  color="success"
                  size="xs"
                />
              </div>
            </UCard>

            <!-- Classes for Selected Level -->
            <UCard v-if="selectedLevel && classInfos.length">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-book-open" class="size-4 text-blue-400" />
                    <h2 class="text-base font-semibold">
                      {{ selectedLevel.name }} Curriculum
                    </h2>
                  </div>
                  <UBadge variant="subtle" size="xs" color="neutral">
                    {{ classInfos.length }} classes
                  </UBadge>
                </div>
              </template>

              <!-- Class Cards -->
              <div class="space-y-3">
                <div
                  v-for="classInfo in classInfos"
                  :key="classInfo.slug"
                  class="relative rounded-lg overflow-hidden border border-white/10 group"
                >
                  <NuxtLink
                    :to="`/classes/${classInfo.slug}`"
                    class="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <!-- Class Image -->
                    <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img
                        :src="classInfo.image"
                        :alt="classInfo.classTitle"
                        class="w-full h-full object-cover"
                      />
                    </div>

                    <!-- Class Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-sm font-semibold text-white truncate">
                          {{ classInfo.classTitle }}
                        </span>
                        <span
                          v-if="classInfo.isCrossDegree"
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0"
                        >
                          {{ classInfo.degreeLabel }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 text-[10px] text-muted">
                        <span class="px-1.5 py-0.5 rounded font-bold" :class="getTierColor(classInfo.maxLevel)">
                          {{ getTierLabel(classInfo.maxLevel) }}
                        </span>
                        <span>·</span>
                        <span>{{ classInfo.totalLevels }} levels</span>
                      </div>

                      <!-- Progress bar for enrolled classes -->
                      <div v-if="classInfo.isEnrolled" class="mt-2">
                        <div class="flex items-center justify-between text-[10px] text-muted mb-0.5">
                          <span>Progress</span>
                          <span>{{ classInfo.completedLevels }}/{{ classInfo.totalLevels }}</span>
                        </div>
                        <UProgress
                          :model-value="classInfo.totalLevels > 0 ? (classInfo.completedLevels / classInfo.totalLevels) * 100 : 0"
                          :animated="false"
                          color="success"
                          size="xs"
                        />
                      </div>
                    </div>

                    <!-- Enrollment Status -->
                    <div class="shrink-0">
                      <UIcon
                        v-if="classInfo.isEnrolled"
                        name="i-lucide-check-circle-2"
                        class="size-5 text-emerald-400"
                      />
                      <UIcon
                        v-else
                        name="i-lucide-circle"
                        class="size-5 text-muted/40"
                      />
                    </div>
                  </NuxtLink>
                </div>
              </div>

              <!-- Overall Progress -->
              <div class="mt-4 pt-3 border-t border-white/10">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-muted">Overall progress</span>
                  <span class="text-xs text-muted">
                    {{ overallProgress }}%
                    <span v-if="overallProgress === 0" class="text-red-400 font-bold">F</span>
                    <span v-else-if="overallProgress >= 90" class="text-emerald-400 font-bold">A+</span>
                    <span v-else-if="overallProgress >= 80" class="text-green-400 font-bold">A</span>
                    <span v-else-if="overallProgress >= 70" class="text-blue-400 font-bold">B</span>
                    <span v-else-if="overallProgress >= 60" class="text-yellow-400 font-bold">C</span>
                  </span>
                </div>
                <UProgress :model-value="overallProgress" :animated="false" color="success" size="sm" />
              </div>
            </UCard>

            <!-- Enroll/Unenroll Button -->
            <div class="pt-1 space-y-2">
              <UButton
                v-if="!isDegreeFullyEnrolled"
                size="md"
                color="primary"
                class="w-full sm:w-auto"
                @click="handleEnrollInDegree"
              >
                <template #leading>
                  <UIcon name="i-lucide-plus" class="size-4" />
                </template>
                {{ isDegreePartiallyEnrolled ? 'Complete Enrollment for' : 'Enroll in' }} {{ selectedLevel?.name || 'this title' }}
              </UButton>
              <UButton
                v-if="isDegreePartiallyEnrolled"
                variant="outline"
                color="error"
                size="md"
                class="w-full sm:w-auto"
                @click="handleUnenrollFromDegree"
              >
                <template #leading>
                  <UIcon name="i-lucide-minus" class="size-4" />
                </template>
                Unenroll from all classes
              </UButton>
              <p v-if="isDegreePartiallyEnrolled && !isDegreeFullyEnrolled" class="text-[11px] text-muted">
                You're partially enrolled. Click above to enroll in the remaining classes.
              </p>
            </div>

            <!-- Final Grade Section -->
            <UCard>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold">Final Grade</span>
                  <span class="text-xs text-muted">
                    {{ overallProgress }}%
                    <span v-if="overallProgress === 0" class="text-red-400 font-bold">F</span>
                    <span v-else-if="overallProgress >= 90" class="text-emerald-400 font-bold">A+</span>
                    <span v-else-if="overallProgress >= 80" class="text-green-400 font-bold">A</span>
                    <span v-else-if="overallProgress >= 70" class="text-blue-400 font-bold">B</span>
                    <span v-else-if="overallProgress >= 60" class="text-yellow-400 font-bold">C</span>
                  </span>
                </div>
                <UProgress :model-value="overallProgress" :animated="false" color="success" size="sm" class="mb-2" />
                <p class="text-xs text-muted text-center">
                  Complete all classes at your target level to earn your grade
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
