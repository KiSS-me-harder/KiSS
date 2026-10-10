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
      <div class="max-w-2xl mx-auto space-y-6 py-4">
        <!-- Profile Header -->
        <div class="flex items-center gap-6">
          <UAvatar
            :src="user.avatar.src"
            :alt="user.avatar.alt"
            size="xl"
            class="ring-2 ring-white/10"
          />
          <div>
            <h1 class="text-2xl font-bold text-white">{{ user.name }}</h1>
            <p class="text-white/50 text-sm mt-1">{{ user.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <UBadge variant="subtle" color="primary" size="sm">
                {{ user.degree }}
              </UBadge>
              <UBadge variant="subtle" color="secondary" size="sm">
                Level {{ user.level }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-white">Personal Information</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Full Name</label>
              <UInput v-model="user.name" class="mt-1" placeholder="Your full name" />
            </div>

            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Email</label>
              <UInput v-model="user.email" class="mt-1" placeholder="Your email" type="email" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-white/40 uppercase tracking-wider">Enrolled Degree</label>
                <UInput v-model="user.degree" class="mt-1" placeholder="Your degree" disabled />
              </div>

              <div>
                <label class="text-xs text-white/40 uppercase tracking-wider">Current Level</label>
                <UInput v-model="user.level" class="mt-1" placeholder="Level" type="number" disabled />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="subtle" color="neutral">Cancel</UButton>
              <UButton color="primary" @click="handleSave">Save Changes</UButton>
            </div>
          </template>
        </UCard>

        <!-- Enrolled Classes -->
        <UCard v-if="enrolledClasses.length">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Enrolled Classes</h2>
              <UBadge variant="subtle" color="primary" size="sm">
                {{ enrolledClasses.length }} enrolled
              </UBadge>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="enrollment in enrolledClasses"
              :key="enrollment.slug"
              class="p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="text-sm font-medium text-white">{{ enrollment.className }}</p>
                  <p class="text-xs text-white/40">{{ enrollment.degree }}</p>
                </div>
                <UBadge
                  variant="subtle"
                  size="xs"
                  :color="enrollment.levels.every((l: { completed: boolean }) => l.completed) ? 'success' : 'primary'"
                >
                  {{ enrollment.levels.filter((l: { completed: boolean }) => l.completed).length }}/{{ enrollment.levels.length }}
                </UBadge>
              </div>
              <div class="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  :style="{ width: (enrollment.levels.filter((l: { completed: boolean }) => l.completed).length / enrollment.levels.length * 100) + '%' }"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- No enrollments message -->
        <UCard v-else>
          <template #header>
            <h2 class="text-lg font-semibold text-white">Enrolled Classes</h2>
          </template>
          <div class="text-center py-6">
            <UIcon name="i-lucide-book-open" class="size-8 mx-auto text-white/20 mb-2" />
            <p class="text-sm text-white/40">You are not enrolled in any classes yet.</p>
            <NuxtLink to="/classes">
              <UButton class="mt-3" size="sm" color="primary">
                Browse Classes
              </UButton>
            </NuxtLink>
          </div>
        </UCard>

        <!-- Stats -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-white">Progress</h2>
          </template>

          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 rounded-lg bg-white/5">
              <p class="text-2xl font-bold text-purple-400">{{ user.classesCompleted }}</p>
              <p class="text-xs text-white/40 mt-1">Classes Completed</p>
            </div>
            <div class="text-center p-4 rounded-lg bg-white/5">
              <p class="text-2xl font-bold text-pink-400">{{ user.flashcardsAnswered }}</p>
              <p class="text-xs text-white/40 mt-1">Flashcards Answered</p>
            </div>
            <div class="text-center p-4 rounded-lg bg-white/5">
              <p class="text-2xl font-bold text-amber-400">{{ user.detentionCount }}</p>
              <p class="text-xs text-white/40 mt-1">Detentions</p>
            </div>
          </div>
        </UCard>

        <!-- Save notification -->
        <div
          v-if="saved"
          class="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <UIcon name="i-lucide-check-circle" class="size-4" />
          Profile saved successfully!
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

useHead({
  title: 'Profile'
})

useSeoMeta({
  title: 'Profile',
  description: 'View and edit your profile at KiSS Academy. Manage your personal information and track your progress.',
  ogTitle: 'Profile',
  ogDescription: 'View and edit your profile at KiSS Academy. Manage your personal information and track your progress.',
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
            '@type': 'ProfilePage',
            '@id': 'https://kiss-academy.github.io/KiSS/profile/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/profile/',
            'name': 'Profile',
            'description': 'View and edit your profile at KiSS Academy. Manage your personal information and track your progress.',
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

const store = useEnrollmentStore()
const saved = ref(false)

const user = computed(() => ({
  name: store.profile.name,
  email: store.profile.email,
  avatar: {
    src: store.profile.avatarSrc,
    alt: store.profile.name
  },
  degree: store.profile.degree,
  level: 100,
  classesCompleted: store.completedClassesCount,
  flashcardsAnswered: store.flashcardsAnswered,
  detentionCount: store.detentionCount
}))

const enrolledClasses = computed(() => store.enrollments)

const handleSave = () => {
  saved.value = true
}

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/profile'
  }
])

// Clear saved notification after 3 seconds
watch(saved, (val) => {
  if (val) {
    setTimeout(() => {
      saved.value = false
    }, 3000)
  }
})
</script>
