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
      <div v-if="degrees" class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NuxtLink
          v-for="degree in degrees"
          :key="degree.id"
          :to="degree.path"
          data-testid="degree-card"
          class="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1"
        >
          <!-- Background Image -->
          <img
            :src="`${app.baseURL}img/degrees/${degree.stem.split('/').pop()}.webp`"
            :alt="degree.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >

          <!-- Dark Overlay with gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <!-- Shimmer effect on hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

          <!-- Badges -->
          <div class="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            <span
              v-if="degree.stem.endsWith('/sissy')"
              class="px-2 py-0.5 rounded-md bg-blue-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider shadow-sm shadow-blue-500/30"
            >
              Active
            </span>
          </div>

          <div class="absolute top-2 right-2 z-10">
            <span
              v-if="degree.stem.endsWith('/sissy')"
              class="w-6 h-6 rounded-full bg-pink-500/90 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-pink-500/30"
            >
              F
            </span>
          </div>

          <!-- Content Area -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <!-- Title -->
            <p class="text-white text-lg font-bold leading-tight tracking-tight drop-shadow-md">
              {{ degree.title }}
            </p>

            <!-- Description -->
            <p v-if="degree.description" class="text-white/60 text-sm mt-1 line-clamp-2 leading-snug">
              {{ degree.description }}
            </p>

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
  title: 'Degrees'
})

useSeoMeta({
  title: 'Degrees',
  description: 'Explore the available degrees at KiSS Academy. Choose your path and begin your transformation journey.',
  ogTitle: 'Degrees',
  ogDescription: 'Explore the available degrees at KiSS Academy. Choose your path and begin your transformation journey.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/degrees/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/degrees/',
            'name': 'Degrees',
            'description': 'Explore the available degrees at KiSS Academy. Choose your path and begin your transformation journey.',
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

const { data: degrees } = await useAsyncData('degrees', () => {
  return queryCollection('degrees').all()
})
const { app } = useRuntimeConfig()

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  }
])
</script>
