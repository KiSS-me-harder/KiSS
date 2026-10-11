<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

const store = useEnrollmentStore()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: club } = await useAsyncData(
  () => `club-${slug.value}`,
  () => queryCollection('clubs')
    .path(`/clubs/${slug.value}`)
    .first(),
  {
    watch: [slug]
  }
)

// Also load all activities from the activities system
const { data: allActivities } = await useAsyncData('club-activities-all', () => queryCollection('activities').all())

const title = computed(() => club.value?.title)
const description = computed(() => club.value?.description)
const body = computed(() => club.value?.body)

interface Activity {
  type: 'challenge' | 'game' | 'task'
  title: string
  description: string
  xp: number
  icon: string
}

const activities = computed<Activity[]>(() => {
  const meta = (club.value as any)?.meta
  const raw = meta?.activities
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw
})

// Club-associated activities from the activities system
const clubActivitySlugs = computed(() => {
  const meta = (club.value as any)?.meta
  const clubActs = meta?.clubActivities
  if (!Array.isArray(clubActs) || clubActs.length === 0) return []
  return clubActs
})

const clubActivities = computed(() => {
  if (!allActivities.value || clubActivitySlugs.value.length === 0) return []
  const slugs = new Set(clubActivitySlugs.value)
  return allActivities.value.filter(a => {
    const stem = (a as any).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) return false
    return slugs.has(parts[1])
  })
})

const isMember = computed(() => store.isClubMember(slug.value))

function toggleMembership() {
  if (isMember.value) {
    store.leaveClub(slug.value)
  } else {
    store.joinClub(slug.value)
  }
}

// Track completed activities in localStorage
const completedActivities = ref<Set<string>>(new Set())

// Load completed activities from localStorage
const storageKey = computed(() => `club-activities-${slug.value}`)
if (process.client) {
  try {
    const stored = localStorage.getItem(storageKey.value)
    if (stored) {
      completedActivities.value = new Set(JSON.parse(stored))
    }
  }
  catch {
    // Ignore localStorage errors
  }
}

// Persist completed activities
watch(completedActivities, (val) => {
  if (!process.client) return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify([...val]))
  }
  catch {
    // Ignore localStorage errors
  }
}, { deep: true })

function toggleActivity(activity: Activity) {
  const key = `${activity.type}-${activity.title}`
  if (completedActivities.value.has(key)) {
    completedActivities.value.delete(key)
  }
  else {
    completedActivities.value.add(key)
  }
}

function isCompleted(activity: Activity): boolean {
  return completedActivities.value.has(`${activity.type}-${activity.title}`)
}

const completedCount = computed(() => {
  return activities.value.filter(a => isCompleted(a)).length
})

const totalXP = computed(() => {
  return activities.value.filter(a => isCompleted(a)).reduce((sum, a) => sum + a.xp, 0)
})

const activityTypes = {
  challenge: {
    label: 'Challenge',
    icon: 'i-lucide-flame',
    color: 'orange' as const,
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20'
  },
  game: {
    label: 'Game',
    icon: 'i-lucide-gamepad-2',
    color: 'purple' as const,
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20'
  },
  task: {
    label: 'Task',
    icon: 'i-lucide-list-checks',
    color: 'emerald' as const,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20'
  }
}

// Filter state
const activeFilter = ref<'all' | 'challenge' | 'game' | 'task'>('all')

const filteredActivities = computed(() => {
  if (activeFilter.value === 'all') return activities.value
  return activities.value.filter(a => a.type === activeFilter.value)
})

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Clubs',
    icon: 'i-lucide-users',
    to: '/clubs'
  },
  {
    label: title.value,
    to: `/clubs/${slug.value}`
  }
])

useHead({
  title
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `https://kiss-academy.github.io/KiSS/clubs/${slug.value}#webpage`,
            'url': `https://kiss-academy.github.io/KiSS/clubs/${slug.value}`,
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

const clubGradients = [
  'bg-gradient-to-br from-pink-600 to-rose-800',
  'bg-gradient-to-br from-purple-600 to-indigo-800',
  'bg-gradient-to-br from-blue-600 to-cyan-800',
  'bg-gradient-to-br from-emerald-600 to-teal-800',
  'bg-gradient-to-br from-amber-600 to-orange-800',
  'bg-gradient-to-br from-red-600 to-pink-800',
  'bg-gradient-to-br from-violet-600 to-purple-800',
  'bg-gradient-to-br from-cyan-600 to-blue-800',
  'bg-gradient-to-br from-lime-600 to-green-800',
  'bg-gradient-to-br from-fuchsia-600 to-pink-800',
  'bg-gradient-to-br from-sky-600 to-indigo-800',
  'bg-gradient-to-br from-rose-600 to-red-800',
  'bg-gradient-to-br from-teal-600 to-emerald-800'
]

const clubIcons = [
  'i-lucide-dumbbell',
  'i-lucide-music',
  'i-lucide-heart',
  'i-lucide-eye',
  'i-lucide-lock',
  'i-lucide-smile',
  'i-lucide-paw-print',
  'i-lucide-brain',
  'i-lucide-aperture',
  'i-lucide-sparkles',
  'i-lucide-hand-helping',
  'i-lucide-ear',
  'i-lucide-zap'
]

const gradientIndex = computed(() => {
  // Use a hash of the slug to consistently pick a gradient/icon
  let hash = 0
  for (let i = 0; i < slug.value.length; i++) {
    hash = ((hash << 5) - hash) + slug.value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
})
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
      <div v-if="club" class="space-y-4">
        <!-- Hero Section -->
        <div
          class="relative rounded-xl overflow-hidden border border-white/10 shadow-lg"
          :class="clubGradients[gradientIndex % clubGradients.length]"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div class="relative p-6 sm:p-8">
            <div class="flex items-start gap-4">
              <UIcon
                :name="clubIcons[gradientIndex % clubIcons.length]"
                class="w-12 h-12 text-white/40 shrink-0 mt-1"
              />
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-white mb-2">
                  {{ title }}
                </h1>
                <p v-if="description" class="text-white/70 text-sm leading-relaxed">
                  {{ description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Club Content -->
        <div v-if="body" class="prose prose-invert max-w-none">
          <ContentRenderer :value="club" />
        </div>

        <!-- Activities Section -->
        <div v-if="activities.length > 0" class="space-y-4">
          <!-- Section Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-amber-400" />
                Club Activities
              </h2>
              <p class="text-sm text-muted-foreground mt-1">
                Complete challenges, games, and tasks to earn XP and master your skills.
              </p>
            </div>
            <!-- Progress Summary -->
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-right">
                <div class="text-sm font-medium text-foreground">
                  {{ completedCount }} / {{ activities.length }} Completed
                </div>
                <div class="text-xs text-amber-400 font-medium">
                  {{ totalXP }} XP Earned
                </div>
              </div>
              <!-- Progress Bar -->
              <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(completedCount / activities.length) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex gap-2 flex-wrap">
            <UButton
              variant="ghost"
              :color="activeFilter === 'all' ? 'primary' : 'default'"
              size="xs"
              class="text-xs"
              @click="activeFilter = 'all'"
            >
              <UIcon name="i-lucide-layers" class="w-3.5 h-3.5 mr-1" />
              All ({{ activities.length }})
            </UButton>
            <UButton
              v-for="(typeInfo, typeKey) in activityTypes"
              :key="typeKey"
              variant="ghost"
              :color="activeFilter === typeKey ? typeInfo.color : 'default'"
              size="xs"
              class="text-xs"
              @click="activeFilter = typeKey as any"
            >
              <UIcon :name="typeInfo.icon" class="w-3.5 h-3.5 mr-1" />
              {{ typeInfo.label }}s ({{ activities.filter(a => a.type === typeKey).length }})
            </UButton>
          </div>

          <!-- Activity Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="activity in filteredActivities"
              :key="activity.type + '-' + activity.title"
              class="group relative rounded-xl border transition-all duration-200 cursor-pointer"
              :class="[
                isCompleted(activity)
                  ? 'bg-white/5 border-white/10'
                  : [activityTypes[activity.type].bg, activityTypes[activity.type].border, 'hover:border-white/20']
              ]"
              @click="toggleActivity(activity)"
            >
              <div class="p-4">
                <!-- Card Header -->
                <div class="flex items-start gap-3">
                  <!-- Type Badge -->
                  <div
                    class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    :class="activityTypes[activity.type].bg"
                  >
                    <UIcon
                      :name="activity.icon || activityTypes[activity.type].icon"
                      :class="activityTypes[activity.type].text"
                      class="w-5 h-5"
                    />
                  </div>

                  <!-- Title & Type -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        :class="[activityTypes[activity.type].bg, activityTypes[activity.type].text, 'border', activityTypes[activity.type].border]"
                      >
                        {{ activityTypes[activity.type].label }}
                      </span>
                      <span class="text-[10px] text-amber-400 font-medium ml-auto">
                        +{{ activity.xp }} XP
                      </span>
                    </div>
                    <h3 class="text-sm font-semibold text-foreground truncate">
                      {{ activity.title }}
                    </h3>
                  </div>

                  <!-- Completion Check -->
                  <div
                    class="flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all"
                    :class="isCompleted(activity)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-white/20 group-hover:border-white/40'"
                  >
                    <UIcon
                      v-if="isCompleted(activity)"
                      name="i-lucide-check"
                      class="w-3.5 h-3.5 text-white"
                    />
                  </div>
                </div>

                <!-- Description -->
                <p class="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                  {{ activity.description }}
                </p>
              </div>

              <!-- Completion Overlay -->
              <div
                v-if="isCompleted(activity)"
                class="absolute inset-0 rounded-xl bg-emerald-500/5 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <!-- Club Activities from Activities System -->
        <div v-if="clubActivities.length > 0" class="space-y-4">
          <div>
            <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
              <UIcon name="i-lucide-list-checks" class="w-5 h-5 text-emerald-400" />
              Club Activities
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              These activities are part of this club. Join the club to include them in your daily routine.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="activity in clubActivities"
              :key="(activity as any).stem"
              class="group relative rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-all duration-200"
            >
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 shrink-0">
                  <UIcon
                    :name="(activity as any).meta?.icon || 'i-lucide-circle-dot'"
                    class="w-5 h-5 text-emerald-400"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-foreground">
                    {{ (activity as any).title }}
                  </h3>
                  <p v-if="(activity as any).meta?.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {{ (activity as any).meta.description }}
                  </p>
                  <div v-if="(activity as any).meta?.category" class="mt-2">
                    <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {{ (activity as any).meta.category }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Join Club Button -->
        <div class="pt-2">
          <UButton
            :variant="isMember ? 'solid' : 'outline'"
            :color="isMember ? 'primary' : 'secondary'"
            size="md"
            class="w-full sm:w-auto"
            @click="toggleMembership"
          >
            {{ isMember ? 'Leave Club' : 'Join Club' }}
          </UButton>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
