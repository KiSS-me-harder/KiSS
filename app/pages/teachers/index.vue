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
      <div v-if="teachers" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <NuxtLink
          v-for="teacher in teachers"
          :key="teacher.id"
          :to="`/teachers/${teacher.path.split('/').pop()}`"
          class="group relative rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1"
        >
          <!-- Background gradient based on teacher color -->
          <div
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            :class="getGradientClass(teacher.color)"
          />

          <!-- Shimmer effect on hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

          <!-- Content Area -->
          <div class="relative p-5 flex flex-col items-center text-center min-h-[220px] justify-center">
            <!-- Avatar Icon -->
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110"
              :class="getAvatarBgClass(teacher.color)"
            >
              <UIcon
                :name="teacher.avatar || 'i-lucide-user'"
                class="w-8 h-8 text-white"
              />
            </div>

            <!-- Name -->
            <p class="text-white text-lg font-bold leading-tight tracking-tight drop-shadow-md">
              {{ teacher.title }}
            </p>

            <!-- Role -->
            <p class="text-white/80 text-sm mt-1 font-medium">
              {{ teacher.role }}
            </p>

            <!-- Department Badge -->
            <span
              class="mt-2 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs font-medium"
            >
              {{ teacher.department }}
            </span>

            <!-- Description -->
            <p v-if="teacher.description" class="text-white/60 text-xs mt-3 line-clamp-2 leading-snug">
              {{ teacher.description }}
            </p>

            <!-- Hover indicator line -->
            <div class="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
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
  title: 'Teachers'
})

useSeoMeta({
  title: 'Teachers',
  description: 'Meet the faculty at KiSS Academy. Chat with AI-powered teachers and get personalized guidance.',
  ogTitle: 'Teachers',
  ogDescription: 'Meet the faculty at KiSS Academy. Chat with AI-powered teachers and get personalized guidance.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/teachers/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/teachers/',
            'name': 'Teachers',
            'description': 'Meet the faculty at KiSS Academy. Chat with AI-powered teachers and get personalized guidance.',
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

interface TeacherData {
  title: string
  role: string
  department: string
  avatar: string
  color: string
  description: string
  systemPrompt: string
  path: string
  id: string
}

const { data: facultyData } = await useAsyncData('faculty', () => {
  return queryCollection('faculty').all() as unknown as Promise<any[]>
}, { server: false })

const teachers = computed(() => {
  if (!facultyData.value) return []
  return facultyData.value.map(item => ({
    title: item.title,
    role: item.meta?.role || '',
    department: item.meta?.department || '',
    avatar: item.meta?.avatar || 'i-lucide-user',
    color: item.meta?.color || 'purple',
    description: item.description || '',
    systemPrompt: item.meta?.systemPrompt || '',
    path: item.path,
    id: item.id
  }))
})

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Teachers',
    icon: 'i-lucide-users',
    to: '/teachers'
  }
])

function getGradientClass(color: string) {
  const gradients: Record<string, string> = {
    pink: 'bg-gradient-to-br from-pink-900/80 via-pink-800/60 to-rose-900/80',
    red: 'bg-gradient-to-br from-red-900/80 via-red-800/60 to-orange-900/80',
    purple: 'bg-gradient-to-br from-purple-900/80 via-purple-800/60 to-violet-900/80',
    green: 'bg-gradient-to-br from-green-900/80 via-green-800/60 to-emerald-900/80',
    blue: 'bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-cyan-900/80',
    yellow: 'bg-gradient-to-br from-yellow-900/80 via-yellow-800/60 to-amber-900/80',
  }
  return gradients[color.toLowerCase()] || 'bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-900/80'
}

function getAvatarBgClass(color: string) {
  const bgColors: Record<string, string> = {
    pink: 'bg-pink-500/90',
    red: 'bg-red-500/90',
    purple: 'bg-purple-500/90',
    green: 'bg-green-500/90',
    blue: 'bg-blue-500/90',
    yellow: 'bg-yellow-500/90',
  }
  return bgColors[color.toLowerCase()] || 'bg-gray-500/90'
}
</script>
