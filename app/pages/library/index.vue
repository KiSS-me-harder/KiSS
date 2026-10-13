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
        <LibraryTypeCards
          :video-count="videoCount"
          :image-count="imageCount"
          :audio-count="audioCount"
          :book-count="bookCount"
        />
        <LibraryRecentGrid :items="recentItems" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

useHead({ title: 'Library' })
useSeoMeta({
  title: 'Library',
  description: 'Access the KiSS Academy media library.',
  ogTitle: 'Library',
  ogDescription: 'Access the KiSS Academy media library.',
  ogType: 'website'
})

const items = ref<BreadcrumbItem[]>([
  { label: 'Library', icon: 'i-lucide-library', to: '/library' }
])

const { data: libraryItems } = await useAsyncData('library', () => queryCollection('library').all())

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
</script>
