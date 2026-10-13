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
        <!-- Search Bar -->
        <div class="flex gap-3">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search videos..."
            class="flex-1 rounded-xl"
            size="sm"
            color="neutral"
            variant="outline"
          />
        </div>

        <!-- Media Grid -->
        <div v-if="filteredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="item in filteredItems"
            :key="item.path"
            :to="`/library/${item.path.split('/').pop()}`"
            data-testid="library-item-card"
            class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
          >
            <!-- Thumbnail / Preview -->
            <div class="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <div v-else class="flex flex-col items-center gap-2">
                <UIcon name="i-lucide-video" class="w-12 h-12 text-white/20" />
                <span class="text-white/30 text-xs">Video</span>
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
          <UIcon name="i-lucide-video" class="w-12 h-12 text-white/20 mb-3" />
          <p class="text-white/40 text-sm mb-1">
            No videos found
          </p>
          <p v-if="searchQuery" class="text-white/30 text-xs">
            Try a different search term
          </p>
          <p v-else class="text-white/30 text-xs">
            No video content available yet
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

useHead({
  title: 'Videos | Library'
})

useSeoMeta({
  title: 'Videos | Library',
  description: 'Browse and search video content in the KiSS Academy media library.',
  ogTitle: 'Videos | Library',
  ogDescription: 'Browse and search video content in the KiSS Academy media library.',
  ogType: 'website'
})

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Library',
    icon: 'i-lucide-library',
    to: '/library'
  },
  {
    label: 'Videos',
    icon: 'i-lucide-video'
  }
])

const { data: libraryItems } = await useAsyncData('library-videos', () => queryCollection('library').all())

const searchQuery = ref('')

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

const filteredItems = computed<LibraryItem[]>(() => {
  if (!libraryItems.value) return []
  const items = libraryItems.value as unknown as LibraryItem[]
  const videos = items.filter(item => item.type === 'video')
  if (!searchQuery.value.trim()) return videos
  const query = searchQuery.value.toLowerCase().trim()
  return videos.filter(item =>
    item.title.toLowerCase().includes(query)
    || item.description.toLowerCase().includes(query)
    || item.author.toLowerCase().includes(query)
    || (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
  )
})
</script>
