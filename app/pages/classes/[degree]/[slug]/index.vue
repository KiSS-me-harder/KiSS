<!-- Class detail page. Moved from [slug].vue to [slug]/index.vue for proper Nuxt nested routing with [level].vue -->
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
      <div v-if="classData" class="space-y-6">
        <!-- Header Section -->
        <div class="relative rounded-xl overflow-hidden border border-white/10 shadow-lg">
          <img
            :src="classData.image"
            :alt="classData.title"
            class="w-full h-48 object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded-md bg-purple-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
                {{ classData.degreeLabel }}
              </span>
              <span v-if="isEnrolled" class="px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
                Enrolled
              </span>
            </div>
            <h1 class="text-xl font-bold text-white leading-tight">
              {{ classData.title }}
            </h1>

            <!-- Progress Bar -->
            <div v-if="isEnrolled" class="mt-3">
              <div class="flex items-center justify-between text-[10px] text-white/60 mb-1">
                <span>Progress</span>
                <span>{{ completedCount }}/{{ totalLevels }} levels</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>

            <!-- Enroll/Unenroll Button -->
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
                Enroll in Class
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
        <div v-if="classData.description" class="rounded-xl border border-white/10 p-4 bg-white/5">
          <p class="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {{ classData.description }}
          </p>
        </div>

        <!-- Level Groups -->
        <div v-for="group in levelGroups" :key="group.label" class="space-y-3">
          <!-- Group Header -->
          <button @click="toggleGroup(group.label)" type="button" class="flex items-center gap-3 w-full group/header text-left">
            <div class="flex items-center gap-2">
              <span
                class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                :class="group.badgeColor"
              >
                {{ group.badge }}
              </span>
              <div>
                <h2 class="text-sm font-semibold text-white">
                  {{ group.label }}
                </h2>
                <p class="text-[10px] text-muted">{{ group.count }} levels</p>
              </div>
            </div>
            <div class="flex-1 h-px bg-white/10" />
            <UIcon
              :name="collapsedGroups.has(group.label) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
              class="w-4 h-4 text-white/40 transition-transform duration-200 group-hover/header:text-white/70"
            />
          </button>

          <!-- Level Cards Grid -->
          <div v-show="!collapsedGroups.has(group.label)" class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
            <div
              v-for="level in group.levels"
              :key="level.level"
              class="group/level relative aspect-square rounded-xl overflow-visible"
            >
              <NuxtLink
                :to="`/classes/${degree}/${slug}/${level.level}`"
                class="relative aspect-square rounded-xl overflow-hidden border shadow-lg shadow-black/20 transition-all duration-300 block"
                :class="isEnrolled
                  ? 'border-white/10 group-hover/level:border-emerald-500/40 group-hover/level:shadow-xl group-hover/level:shadow-emerald-500/10 group-hover/level:-translate-y-1'
                  : 'border-white/10 group-hover/level:border-white/20 group-hover/level:shadow-xl group-hover/level:shadow-purple-500/10 group-hover/level:-translate-y-1'"
              >
                <!-- Background Image -->
                <img
                  :src="classData.image"
                  :alt="level.title"
                  class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/level:scale-110"
                  :class="isEligible(level) ? '' : 'blur-md group-hover/level:blur-none'"
                />

                <!-- Dark Overlay with gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                <!-- Shimmer effect on hover -->
                <div class="absolute inset-0 opacity-0 group-hover/level:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

                <!-- Level Number Badge -->
                <div class="absolute top-2 right-2 z-10 flex items-center gap-1">
                  <span
                    class="px-2 py-0.5 rounded-md backdrop-blur-sm text-white text-[9px] font-bold"
                    :class="isLevelCompleted(level.level) ? 'bg-emerald-500/80' : 'bg-white/20'"
                  >
                    Lvl {{ level.level }}
                  </span>
                  <span
                    v-if="isLevelCompleted(level.level)"
                    class="w-5 h-5 rounded-full bg-emerald-500/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-check" class="w-3 h-3 text-white" />
                  </span>
                </div>

                <!-- Dependency Badges -->
                <div v-if="level.dependencies.length" class="absolute top-2 left-2 z-10 flex flex-col gap-1">
                  <span
                    v-for="(dep, idx) in level.dependencies"
                    :key="idx"
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
                    :title="`${dep.class} Level ${dep.level}`"
                  >
                    <UIcon name="i-lucide-lock" class="w-3 h-3" />
                    <span>L{{ dep.level }}</span>
                  </span>
                </div>

                <!-- Content Area -->
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <p class="text-white text-xs font-bold leading-tight tracking-tight drop-shadow-md line-clamp-2">
                    {{ level.title }}
                  </p>

                  <!-- Dependency count indicator -->
                  <div v-if="level.dependencies.length" class="mt-1 flex items-center gap-1">
                    <UIcon name="i-lucide-link" class="w-3 h-3 text-amber-400/60" />
                    <span class="text-[9px] text-amber-400/60">{{ level.dependencies.length }} prerequisite{{ level.dependencies.length > 1 ? 's' : '' }}</span>
                  </div>

                  <!-- Hover indicator line -->
                  <div class="mt-1.5 h-0.5 w-0 group-hover/level:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
                </div>
              </NuxtLink>

              <!-- Hover Tooltip -->
              <div
                v-if="level.description"
                class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 z-50 opacity-0 group-hover/level:opacity-100 pointer-events-none group-hover/level:pointer-events-none transition-opacity duration-200"
              >
                <div class="rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-sm p-3 shadow-xl">
                  <p class="text-white text-xs font-semibold mb-1">Lvl {{ level.level }}: {{ level.title }}</p>
                  <p class="text-white/70 text-xs leading-relaxed line-clamp-4">{{ level.description }}</p>
                </div>
                <!-- Tooltip arrow -->
                <div class="w-3 h-3 bg-gray-900/95 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" />
              </div>
            </div>
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

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

const route = useRoute()

const degree = computed(() => route.params.degree as string)
const slug = computed(() => route.params.slug as string)
const classSlug = computed(() => `${degree.value}/${slug.value}`)
const store = useEnrollmentStore()

const { data: allClasses } = await useAsyncData(
  () => `class-levels-${classSlug.value}`,
  () => queryCollection('classes').all(),
  {
    watch: [classSlug]
  }
)

// Filter classes for the current slug
const filteredClasses = computed(() => {
  if (!allClasses.value) return []
  const prefix = `classes/${degree.value}/${slug.value}/`
  return allClasses.value.filter(item => (item as any).stem?.startsWith(prefix))
})

const classData = computed(() => {
  const classes = filteredClasses.value
  if (!classes || classes.length === 0) return null

  const className = slug.value
  const degreeValue = degree.value
  const degreeLabel = degreeValue.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Find the _index.md item for class-level metadata (title, description)
  const indexItem = classes.find(item => (item as any).stem?.endsWith('/_index'))

  // Get title: prefer _index.md title, then slug fallback
  const title = indexItem
    ? ((indexItem as any).title || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    : className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Get description from _index.md frontmatter
  const description = indexItem ? (indexItem as any).description || '' : ''

  return {
    slug: classSlug.value,
    title,
    degree: degreeValue,
    degreeLabel,
    image: `/img/degrees/${degreeValue}.webp`,
    description
  }
})

// Build a lookup of all classes by their class name + level for dependency resolution
const classLookup = computed(() => {
  if (!allClasses.value) return new Map()
  const map = new Map<string, { stem: string; title: string }>()
  for (const item of allClasses.value) {
    const key = `${(item as any).meta?.class}-${(item as any).meta?.level}`
    map.set(key, {
      stem: (item as any).stem,
      title: (item as any).meta?.title
    })
  }
  return map
})

const levelGroups = computed(() => {
  const classes = filteredClasses.value
  if (!classes) return []

  const groups: {
    label: string
    badge: string
    badgeColor: string
    count: number
    levels: { level: number; title: string; description: string; dependencies: { class: string; level: number; title?: string; stem?: string }[] }[]
  }[] = [
    { label: 'Beginner', badge: '1', badgeColor: 'bg-green-500', count: 0, levels: [] },
    { label: 'Intermediate', badge: '2', badgeColor: 'bg-blue-500', count: 0, levels: [] },
    { label: 'Advanced', badge: '3', badgeColor: 'bg-red-500', count: 0, levels: [] }
  ]

  for (const item of classes) {
    const level = parseInt((item as any).meta?.level, 10)
    let groupIndex: number | undefined

    if (level >= 100 && level < 200) {
      groupIndex = 0
    } else if (level >= 200 && level < 300) {
      groupIndex = 1
    } else if (level >= 300 && level < 400) {
      groupIndex = 2
    } else {
      continue
    }

    const gi = groups[groupIndex]
    if (gi) {
      // Resolve dependencies with titles
      const rawDeps = (item as any).meta?.dependencies || []
      const dependencies = rawDeps.map((dep: any) => {
        const lookupKey = `${dep.class}-${dep.level}`
        const lookup = classLookup.value.get(lookupKey)
        return {
          class: dep.class,
          level: dep.level,
          title: lookup?.title || undefined,
          stem: lookup?.stem || undefined
        }
      })

      // Extract description from body text
      let description = ''
      const body = (item as any).body
      if (body && typeof body === 'string') {
        description = body.replace(/\*\*[^*]*\*\*/g, '').replace(/\* Key Takeaways:[\s\S]*/i, '').trim()
      } else if (body && typeof body === 'object' && body.children) {
        let inKeyTakeaways = false
        const parts: string[] = []
        for (const child of body.children) {
          if (child.tag === 'strong' && child.value && /key takeaways/i.test(child.value)) {
            inKeyTakeaways = true
            break
          }
          if (child.value) {
            parts.push(child.value)
          }
        }
        description = parts.join('').replace(/\*\*[^*]*\*\*/g, '').trim()
      }

      gi.levels.push({
        level,
        title: (item as any).title,
        description,
        dependencies
      })
    }
  }

  // Sort levels within each group and update counts
  for (const group of groups) {
    group.levels.sort((a, b) => a.level - b.level)
    group.count = group.levels.length
  }

  // Return only groups that have levels
  return groups.filter(g => g.count > 0)
})

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Classes',
    icon: 'i-lucide-book-text',
    to: '/classes'
  },
  {
    label: classData.value?.title,
    to: `/classes/${classSlug.value}`
  }
])

// --- Enrollment State ---

const isEnrolled = computed(() => store.isEnrolled(classSlug.value))

const enrollment = computed(() => store.getEnrollment(classSlug.value))

// Exclude _index.md from level count
const totalLevels = computed(() => filteredClasses.value.filter(item => !(item as any).stem?.endsWith('/_index')).length)

const completedCount = computed(() => {
  if (!enrollment.value) return 0
  return enrollment.value.levels.filter((l: { completed: boolean }) => l.completed).length
})

const progressPercent = computed(() => {
  if (totalLevels.value === 0) return 0
  return Math.round((completedCount.value / totalLevels.value) * 100)
})

function isLevelCompleted(level: number): boolean {
  return store.isLevelCompleted(classSlug.value, level)
}

function isEligible(level: { level: number; dependencies: { class: string; level: number }[] }): boolean {
  if (!level.dependencies.length) return true
  return store.areDependenciesMet(classSlug.value, level.level, level.dependencies)
}

function toggleLevelComplete(level: number) {
  if (!isEnrolled.value) return
  if (isLevelCompleted(level)) {
    store.resetLevel(classSlug.value, level)
  } else {
    store.completeLevel(classSlug.value, level)
  }
}

function handleEnroll() {
  const levels = filteredClasses.value
    .filter(item => !(item as any).stem?.endsWith('/_index'))
    .map(item => parseInt((item as any).meta?.level, 10))
  store.enrollInClass(classSlug.value, slug.value, degree.value, levels)
}

function handleUnenroll() {
  store.unenrollFromClass(classSlug.value)
}

// --- Collapsible Groups ---

const collapsedGroups = ref(new Set<string>())

function toggleGroup(label: string) {
  if (collapsedGroups.value.has(label)) {
    collapsedGroups.value.delete(label)
  } else {
    collapsedGroups.value.add(label)
  }
}

useSeoMeta({
  title: classData.value?.title,
  description: classData.value?.description
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
            '@id': `https://kiss-academy.github.io/KiSS/classes/${classSlug.value}#course`,
            'url': `https://kiss-academy.github.io/KiSS/classes/${classSlug.value}`,
            'name': classData.value?.title,
            'description': classData.value?.description,
            'inLanguage': 'en',
            'provider': {
              '@type': 'Organization',
              'name': 'KiSS Academy',
              'url': 'https://kiss-academy.github.io/KiSS/'
            }
          },
          {
            '@type': 'WebPage',
            '@id': `https://kiss-academy.github.io/KiSS/classes/${classSlug.value}#webpage`,
            'url': `https://kiss-academy.github.io/KiSS/classes/${classSlug.value}`,
            'name': classData.value?.title,
            'description': classData.value?.description,
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
</script>
