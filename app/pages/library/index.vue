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
      <div class="space-y-6">
        <!-- Media Type Navigation Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            to="/library/videos"
            class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            <div class="flex flex-col items-center justify-center py-12 px-6">
              <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-lucide-video" class="w-8 h-8 text-green-400" />
              </div>
              <h3 class="text-white text-lg font-semibold mb-1">Videos</h3>
              <p class="text-white/40 text-xs text-center">Browse video content and demonstrations</p>
              <p class="text-white/30 text-xs mt-2">{{ videoCount }} video{{ videoCount !== 1 ? 's' : '' }}</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/library/images"
            class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            <div class="flex flex-col items-center justify-center py-12 px-6">
              <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-lucide-image" class="w-8 h-8 text-blue-400" />
              </div>
              <h3 class="text-white text-lg font-semibold mb-1">Images</h3>
              <p class="text-white/40 text-xs text-center">View images and visual guides</p>
              <p class="text-white/30 text-xs mt-2">{{ imageCount }} image{{ imageCount !== 1 ? 's' : '' }}</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/library/audio"
            class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            <div class="flex flex-col items-center justify-center py-12 px-6">
              <div class="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-lucide-headphones" class="w-8 h-8 text-amber-400" />
              </div>
              <h3 class="text-white text-lg font-semibold mb-1">Audio</h3>
              <p class="text-white/40 text-xs text-center">Listen to audio lessons and sessions</p>
              <p class="text-white/30 text-xs mt-2">{{ audioCount }} track{{ audioCount !== 1 ? 's' : '' }}</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/library/books"
            class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            <div class="flex flex-col items-center justify-center py-12 px-6">
              <div class="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-lucide-book-open" class="w-8 h-8 text-purple-400" />
              </div>
              <h3 class="text-white text-lg font-semibold mb-1">Books</h3>
              <p class="text-white/40 text-xs text-center">Read erotica books and stories</p>
              <p class="text-white/30 text-xs mt-2">{{ bookCount }} book{{ bookCount !== 1 ? 's' : '' }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Recent Media Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-white text-sm font-semibold">Recent Media</h2>
          </div>

          <div v-if="recentItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="item in recentItems"
              :key="item.path"
              :to="`/library/${item.path.split('/').pop()}`"
              class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
            >
              <!-- Thumbnail / Preview -->
              <div class="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="flex flex-col items-center gap-2">
                  <UIcon
                    :name="getMediaTypeIcon(item.type)"
                    class="w-12 h-12 text-white/20"
                  />
                  <span class="text-white/30 text-xs">{{ getMediaTypeLabel(item.type) }}</span>
                </div>
                <!-- Media Type Badge -->
                <div class="absolute top-3 left-3">
                  <UBadge
                    :label="getMediaTypeLabel(item.type)"
                    :color="safeColor(getMediaTypeColor(item.type))"
                    variant="subtle"
                    size="xs"
                    class="backdrop-blur-sm"
                  />
                </div>
                <!-- Duration Badge -->
                <div v-if="item.duration" class="absolute bottom-3 right-3">
                  <UBadge
                    :label="item.duration"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    class="backdrop-blur-sm"
                  />
                </div>
                <!-- Play Overlay -->
                <div
                  v-if="item.type !== 'image'"
                  class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200"
                >
                  <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <UIcon name="i-lucide-play" class="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <!-- Info -->
              <div class="p-4">
                <h3 class="text-white text-sm font-semibold truncate">{{ item.title }}</h3>
                <p class="text-white/50 text-xs mt-1 line-clamp-2">{{ item.description }}</p>
                <div class="flex items-center gap-3 mt-3 text-white/30 text-xs">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-user" class="w-3 h-3" />
                    {{ item.author }}
                  </span>
                </div>
                <!-- Tags -->
                <div v-if="item.tags && item.tags.length" class="flex gap-1.5 mt-2 flex-wrap">
                  <UBadge
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    :label="tag"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  />
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center py-12 rounded-xl border border-white/10 bg-white/5">
            <UIcon name="i-lucide-library" class="w-12 h-12 text-white/20 mb-3" />
            <p class="text-white/40 text-sm mb-1">No media found</p>
            <p class="text-white/30 text-xs">Select a media type above to browse content</p>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

useHead({
  title: 'Library'
})

useSeoMeta({
  title: 'Library',
  description: 'Access the KiSS Academy media library. View images, watch videos, and listen to audio content.',
  ogTitle: 'Library',
  ogDescription: 'Access the KiSS Academy media library. View images, watch videos, and listen to audio content.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/library/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/library/',
            'name': 'Library',
            'description': 'Access the KiSS Academy media library. View images, watch videos, and listen to audio content.',
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

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Library',
    icon: 'i-lucide-library',
    to: '/library'
  }
])

const { data: libraryItems } = await useAsyncData('library', () => queryCollection('library').all(), { server: false })

interface LibraryItem {
  path: string
  title: string
  description: string
  type: string
  author: string
  tags: string[]
  url: string
  thumbnail: string | null
  duration: string | null
}

const allItems = computed<LibraryItem[]>(() => {
  if (!libraryItems.value) return []
  return libraryItems.value as unknown as LibraryItem[]
})

const videoCount = computed(() => allItems.value.filter(item => item.type === 'video').length)
const imageCount = computed(() => allItems.value.filter(item => item.type === 'image').length)
const audioCount = computed(() => allItems.value.filter(item => item.type === 'audio').length)
const bookCount = computed(() => allItems.value.filter(item => item.type === 'book').length)

const recentItems = computed<LibraryItem[]>(() => allItems.value.slice(0, 6))

function getMediaTypeIcon(type: string) {
  const icons: Record<string, string> = {
    image: 'i-lucide-image',
    video: 'i-lucide-video',
    audio: 'i-lucide-headphones',
    book: 'i-lucide-book-open'
  }
  return icons[type] || 'i-lucide-file'
}

function getMediaTypeLabel(type: string) {
  const labels: Record<string, string> = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    book: 'Book'
  }
  return labels[type] || type
}

function getMediaTypeColor(type: string) {
  const colors: Record<string, string> = {
    image: 'info',
    video: 'success',
    audio: 'warning',
    book: 'primary'
  }
  return colors[type] || 'neutral'
}

type ColorType = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

function safeColor(color: string): ColorType {
  const valid: ColorType[] = ['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral']
  return (valid.includes(color as ColorType) ? color : 'neutral') as ColorType
}
</script>
