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
      <div v-if="levelGroups.length" class="space-y-8">
        <!-- Level Group Sections -->
        <div v-for="group in levelGroups" :key="group.level" class="space-y-4">
          <!-- Group Header -->
          <button @click="toggleGroup(group.level)" type="button" class="flex items-center gap-3 w-full group/header text-left">
            <div class="flex items-center gap-2.5">
              <span
                class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg"
                :class="group.badgeColor"
              >
                {{ group.badge }}
              </span>
              <div>
                <h2 class="text-base font-bold text-white tracking-tight">
                  {{ group.label }}
                </h2>
                <p class="text-[11px] text-muted">{{ group.classCount }} class{{ group.classCount !== 1 ? 'es' : '' }} available</p>
              </div>
            </div>
            <div class="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <UIcon
              :name="collapsedGroups.has(group.level) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
              class="w-4 h-4 text-white/40 transition-transform duration-200 group-hover/header:text-white/70"
            />
          </button>

          <!-- Class Cards Grid -->
          <div v-show="!collapsedGroups.has(group.level)" class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
            <div
              v-for="item in group.classes"
              :key="item.path"
              class="group/card relative aspect-square rounded-xl overflow-visible"
            >
              <NuxtLink
                :to="item.path"
                class="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1 block"
              >
                <!-- Background Image -->
                <img
                  :src="item.image"
                  :alt="item.classTitle"
                  class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110"
                  :class="isEligible(item) ? '' : 'blur-md group-hover/card:blur-none'"
                />

                <!-- Dark Overlay for text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

                <!-- Shimmer effect on hover -->
                <div class="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

                <!-- Badges -->
                <div class="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                  <span
                    class="px-2.5 py-1 rounded-md bg-purple-500/90 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider shadow-sm shadow-purple-500/30"
                  >
                    {{ item.degreeLabel }}
                  </span>
                </div>

                <div class="absolute top-2 right-2 z-10">
                  <span
                    class="px-2.5 py-1 rounded-md backdrop-blur-sm text-white text-xs font-bold shadow-sm"
                    :class="group.badgeColor + '/90'"
                  >
                    Lvl {{ item.level }}
                  </span>
                </div>

                <!-- Content Area -->
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <!-- Class Title -->
                  <p class="text-white text-base font-bold leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                    {{ item.classTitle }}
                  </p>

                  <!-- Level Title -->
                  <p class="text-white/90 text-sm mt-1 line-clamp-1 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {{ item.title }}
                  </p>

                  <!-- Total levels in this class -->
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-white/70 text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{{ item.totalLevels }} levels total</span>
                  </div>

                  <!-- Hover indicator line -->
                  <div class="mt-1.5 h-0.5 w-0 group-hover/card:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
                </div>
              </NuxtLink>

              <!-- Hover Tooltip -->
              <div
                v-if="item.description"
                class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 z-50 opacity-0 group-hover/card:opacity-100 pointer-events-none group-hover/card:pointer-events-none transition-opacity duration-200"
              >
                <div class="rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-sm p-3 shadow-xl">
                  <p class="text-white text-xs font-semibold mb-1">{{ item.classTitle }}</p>
                  <p class="text-white/70 text-xs leading-relaxed line-clamp-4">{{ item.description }}</p>
                </div>
                <!-- Tooltip arrow -->
                <div class="w-3 h-3 bg-gray-900/95 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" />
              </div>
            </div>
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

useHead({
  title: 'Classes'
})

const enrollmentStore = useEnrollmentStore()

function isEligible(item: ClassLevelEntry): boolean {
  if (!item.dependencies.length) return true
  return enrollmentStore.areDependenciesMet(item.classSlug, item.level, item.dependencies)
}

useSeoMeta({
  title: 'Classes',
  description: 'Browse all available classes at KiSS Academy. Enroll in courses and track your progress through each level.',
  ogTitle: 'Classes',
  ogDescription: 'Browse all available classes at KiSS Academy. Enroll in courses and track your progress through each level.',
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': 'https://kiss-academy.github.io/KiSS/classes/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/classes/',
            'name': 'Classes',
            'description': 'Browse all available classes at KiSS Academy. Enroll in courses and track your progress through each level.',
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
      })
    }
  ]
})

interface ClassLevelEntry {
  path: string
  classTitle: string
  title: string
  degree: string
  degreeLabel: string
  level: number
  image: string
  totalLevels: number
  description: string
  classSlug: string
  dependencies: { class: string; level: number }[]
}

interface LevelGroup {
  level: number
  label: string
  badge: string
  badgeColor: string
  classCount: number
  classes: ClassLevelEntry[]
}

const { data: allClasses } = await useAsyncData('all-classes', () => {
  return queryCollection('classes').all()
})

// Build a map of class slugs to their total level count
const classLevelCounts = computed(() => {
  if (!allClasses.value) return new Map<string, number>()
  const map = new Map<string, Set<number>>()
  for (const item of allClasses.value) {
    const parts = (item as any).stem?.split('/') || []
    if (parts.length < 4) continue
    const classSlug = `${parts[1]}/${parts[2]}`
    const level = parseInt((item as any).meta?.level, 10)
    if (isNaN(level)) continue
    if (!map.has(classSlug)) {
      map.set(classSlug, new Set())
    }
    map.get(classSlug)!.add(level)
  }
  const counts = new Map<string, number>()
  for (const [slug, levels] of map) {
    counts.set(slug, levels.size)
  }
  return counts
})

const levelGroups = computed(() => {
  if (!allClasses.value) return []

  // Group entries by level tier (100, 200, 300)
  // Only include the base level of each tier (100, 200, 300) - not 101, 102, etc.
  const tierLevels = [100, 200, 300]
  const tierConfig = [
    { level: 100, label: 'Level 100', badge: '1', badgeColor: 'bg-green-500' },
    { level: 200, label: 'Level 200', badge: '2', badgeColor: 'bg-blue-500' },
    { level: 300, label: 'Level 300', badge: '3', badgeColor: 'bg-red-500' }
  ]

  // Build a map: for each class, which tier levels does it have?
  // We only care about the base level (100, 200, 300) for the index page
  const classesData = allClasses.value!
  const classByTier = tierLevels.map(tierLevel => {
    const config = tierConfig.find(c => c.level === tierLevel)!
    const classes: ClassLevelEntry[] = []
    const seenClasses = new Set<string>()

    for (const item of classesData) {
      const level = parseInt((item as any).meta?.level, 10)
      // Only include the base level of each tier
      if (level !== tierLevel) continue

      const parts = (item as any).stem?.split('/') || []
      if (parts.length < 4) continue

      const degree = parts[1]
      const className = parts[2]
      const classSlug = `${degree}/${className}`

      // Skip if we already added this class for this tier
      if (seenClasses.has(classSlug)) continue
      seenClasses.add(classSlug)

      const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const classTitle = (item as any).meta?.class || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

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

      const dependencies = (item as any).meta?.dependencies || []

      classes.push({
        path: `/classes/${classSlug}`,
        classTitle,
        title: (item as any).title,
        degree,
        degreeLabel,
        level,
        image: `/img/degrees/${degree}.webp`,
        totalLevels: classLevelCounts.value.get(classSlug) || 0,
        description,
        classSlug,
        dependencies
      })
    }

    // Sort classes by degree label, then class title
    classes.sort((a, b) => {
      const degreeCmp = a.degreeLabel.localeCompare(b.degreeLabel)
      if (degreeCmp !== 0) return degreeCmp
      return a.classTitle.localeCompare(b.classTitle)
    })

    return {
      ...config,
      classCount: classes.length,
      classes
    }
  })

  // Return only groups that have classes
  return classByTier.filter(g => g.classCount > 0)
})


const collapsedGroups = ref(new Set<number>())

function toggleGroup(level: number) {
  if (collapsedGroups.value.has(level)) {
    collapsedGroups.value.delete(level)
  } else {
    collapsedGroups.value.add(level)
  }
}

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Classes',
    icon: 'i-lucide-book-text',
    to: '/classes'
  }
])
</script>
