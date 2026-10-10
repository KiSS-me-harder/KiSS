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
      <div v-if="punishments" class="grid grid-cols-3 gap-3">
        <NuxtLink
          v-for="punishment in punishments"
          :key="punishment.id"
          :to="punishment.path"
          class="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1"
        >
          <!-- Background gradient based on punishment index -->
          <div
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            :class="punishmentGradients[punishments.indexOf(punishment) % punishmentGradients.length]"
          />

          <!-- Dark Overlay with gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <!-- Shimmer effect on hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

          <!-- Icon -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <UIcon
              :name="punishmentIcons[punishments.indexOf(punishment) % punishmentIcons.length]"
              class="w-16 h-16 text-white/20 transition-all duration-300 group-hover:text-white/40 group-hover:scale-110"
            />
          </div>

          <!-- Content Area -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <!-- Title -->
            <p class="text-white text-base font-bold leading-tight tracking-tight drop-shadow-md">
              {{ punishment.title }}
            </p>

            <!-- Description -->
            <p v-if="punishment.description" class="text-white/60 text-xs mt-0.5 line-clamp-2 leading-snug">
              {{ punishment.description }}
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
  title: 'Detention'
})

useSeoMeta({
  title: 'Detention',
  description: 'View assigned detentions and punishments at KiSS Academy. Complete your tasks to make amends.',
  ogTitle: 'Detention',
  ogDescription: 'View assigned detentions and punishments at KiSS Academy. Complete your tasks to make amends.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/detention/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/detention/',
            'name': 'Detention',
            'description': 'View assigned detentions and punishments at KiSS Academy. Complete your tasks to make amends.',
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

const { data: punishments } = await useAsyncData('punishments', () => {
  return queryCollection('punishments').all()
}, { server: false })

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Detention',
    icon: 'i-lucide-angry',
    to: '/detention'
  }
])

const punishmentGradients = [
  'bg-gradient-to-br from-red-700 to-rose-900',
  'bg-gradient-to-br from-slate-600 to-gray-800',
  'bg-gradient-to-br from-amber-700 to-yellow-900',
  'bg-gradient-to-br from-purple-700 to-violet-900',
  'bg-gradient-to-br from-pink-700 to-fuchsia-900',
  'bg-gradient-to-br from-indigo-700 to-blue-900',
  'bg-gradient-to-br from-emerald-700 to-green-900',
  'bg-gradient-to-br from-cyan-700 to-teal-900',
  'bg-gradient-to-br from-orange-700 to-red-900',
  'bg-gradient-to-br from-violet-700 to-purple-900',
  'bg-gradient-to-br from-rose-700 to-pink-900',
  'bg-gradient-to-br from-sky-700 to-indigo-900',
  'bg-gradient-to-br from-lime-700 to-emerald-900',
  'bg-gradient-to-br from-fuchsia-700 to-rose-900',
  'bg-gradient-to-br from-teal-700 to-cyan-900',
  'bg-gradient-to-br from-zinc-700 to-slate-900'
]

const punishmentIcons = [
  'i-lucide-hand',
  'i-lucide-corner-down-left',
  'i-lucide-pencil',
  'i-lucide-lock',
  'i-lucide-eye-off',
  'i-lucide-alert-triangle',
  'i-lucide-list-checks',
  'i-lucide-eye',
  'i-lucide-move',
  'i-lucide-broom',
  'i-lucide-ban',
  'i-lucide-book-open',
  'i-lucide-megaphone',
  'i-lucide-circle-help',
  'i-lucide-droplet',
  'i-lucide-rotate-cw'
]
</script>
