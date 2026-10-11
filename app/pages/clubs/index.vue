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
      <div v-if="clubs" class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NuxtLink
          v-for="club in clubs"
          :key="club.id"
          :to="club.path"
          class="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1"
        >
          <!-- Background Image -->
          <img
            :src="`${app.baseURL}img/placeholder.webp`"
            :alt="club.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >

          <!-- Dark Overlay with gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <!-- Shimmer effect on hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

          <!-- Content Area -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <!-- Title -->
            <p class="text-white text-base font-bold leading-tight tracking-tight drop-shadow-md">
              {{ club.title }}
            </p>

            <!-- Description -->
            <p v-if="club.description" class="text-white/60 text-xs mt-0.5 line-clamp-2 leading-snug">
              {{ club.description }}
            </p>

            <!-- Required Degree Badge -->
            <div v-if="club.meta?.requiredDegree" class="mt-1.5">
              <NuxtLink
                :to="`/degrees/${club.meta.requiredDegree}`"
                class="inline-flex items-center gap-1 text-[10px] font-medium text-purple-300 bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-0.5 hover:bg-purple-500/30 transition-colors"
              >
                <UIcon name="i-lucide-graduation-cap" class="w-3 h-3" />
                {{ club.meta.requiredDegree }}
              </NuxtLink>
            </div>

            <!-- Hover indicator line -->
            <div class="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
          </div>
        </NuxtLink>
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

useHead({
  title: 'Clubs'
})

useSeoMeta({
  title: 'Clubs',
  description: 'Join clubs and communities at KiSS Academy. Connect with fellow students and participate in group activities.',
  ogTitle: 'Clubs',
  ogDescription: 'Join clubs and communities at KiSS Academy. Connect with fellow students and participate in group activities.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/clubs/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/clubs/',
            'name': 'Clubs',
            'description': 'Join clubs and communities at KiSS Academy. Connect with fellow students and participate in group activities.',
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

const { data: clubs } = await useAsyncData('clubs', () => {
  return queryCollection('clubs').all()
})
const { app } = useRuntimeConfig()

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Clubs',
    icon: 'i-lucide-users',
    to: '/clubs'
  }
])
</script>
