<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

useHead({
  title: 'Dashboard'
})

useSeoMeta({
  title: 'Dashboard',
  description: 'Your personal dashboard for tracking progress, routines, and schedules at KiSS Academy.',
  ogTitle: 'Dashboard',
  ogDescription: 'Your personal dashboard for tracking progress, routines, and schedules at KiSS Academy.',
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
            '@type': 'WebPage',
            '@id': 'https://kiss-academy.github.io/KiSS/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/',
            'name': 'Dashboard',
            'description': 'Your personal dashboard for tracking progress, routines, and schedules at KiSS Academy.',
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

const { isNotificationsSlideoverOpen } = useDashboard()

const quickActions = [[{
  label: 'Review Flashcards',
  icon: 'i-lucide-playing-cards',
  to: '/flashcards'
}, {
  label: 'Browse Degrees',
  icon: 'i-lucide-graduation-cap',
  to: '/degrees'
}]] satisfies DropdownMenuItem[][]

const tabs = [
  { label: 'Today', icon: 'i-lucide-home' },
  { label: 'Routine', icon: 'i-lucide-list-checks' },
  { label: 'Schedule', icon: 'i-lucide-calendar-clock' },
  { label: 'Calendar', icon: 'i-lucide-calendar' }
]

const activeTab = ref('Today')

const getComponent = (tab: string) => {
  switch (tab) {
    case 'Today': return resolveComponent('HomeTodayTab')
    case 'Routine': return resolveComponent('HomeTodayRoutine')
    case 'Schedule': return resolveComponent('HomeTodayScheduleEdit')
    case 'Calendar': return resolveComponent('HomeTodayCalendar')
    default: return resolveComponent('HomeTodayTab')
  }
}
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Today" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="quickActions">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Tab Bar -->
        <div class="flex items-center justify-center gap-1 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            v-for="tab in tabs"
            :key="tab.label"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            :class="activeTab === tab.label
              ? 'bg-primary text-primary-foreground'
              : 'text-muted hover:bg-elevated hover:text-highlighted'"
            @click="activeTab = tab.label"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <KeepAlive>
          <component :is="getComponent(activeTab)" />
        </KeepAlive>
      </div>
    </template>
  </UDashboardPanel>
</template>
