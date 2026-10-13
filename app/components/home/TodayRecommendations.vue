<script setup lang="ts">
/**
 * Represents a library content item with common fields.
 */
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
  pages: number | null
}

/**
 * Configuration for each recommendation section type.
 */
interface SectionConfig {
  label: string
  type: string
  icon: string
  libraryPath: string
  libraryLabel: string
  testId: string
}

const { data: libraryItems } = await useAsyncData('today-recommendations', () => queryCollection('library').all())

const sections = ref<SectionConfig[]>([
  {
    label: 'Today\'s Videos',
    type: 'video',
    icon: 'i-lucide-video',
    libraryPath: '/library/videos',
    libraryLabel: 'Videos',
    testId: 'video'
  },
  {
    label: 'Today\'s Audio',
    type: 'audio',
    icon: 'i-lucide-headphones',
    libraryPath: '/library/audio',
    libraryLabel: 'Audio',
    testId: 'audio'
  },
  {
    label: 'Today\'s Images',
    type: 'image',
    icon: 'i-lucide-image',
    libraryPath: '/library/images',
    libraryLabel: 'Images',
    testId: 'image'
  },
  {
    label: 'Today\'s Books',
    type: 'book',
    icon: 'i-lucide-book-open',
    libraryPath: '/library/books',
    libraryLabel: 'Books',
    testId: 'book'
  }
])

/**
 * Retrieves the list of items for a given content type.
 * @param contentType - The type of content to filter by (video, audio, image, book).
 * @returns Array of library items matching the type, empty if none.
 */
function getItemsByType(contentType: string): LibraryItem[] {
  if (!libraryItems.value) return []
  const items = libraryItems.value as unknown as LibraryItem[]
  return items.filter(item => item.type === contentType)
}
</script>

<template>
  <div data-testid="today-recommendations" class="space-y-6">
    <section
      v-for="section in sections"
      :key="section.type"
      class="space-y-3"
    >
      <!-- Section Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">
          {{ section.label }}
        </h2>
        <NuxtLink
          :to="section.libraryPath"
          class="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View All {{ section.libraryLabel }}
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Content Cards Row -->
      <div v-if="getItemsByType(section.type).length > 0" class="flex gap-4 overflow-x-auto pb-2 -mr-2 pr-2">
        <NuxtLink
          v-for="item in getItemsByType(section.type)"
          :key="item.path"
          :to="`/library/${item.path.split('/').pop()}`"
          :data-testid="`recommendation-card-${section.testId}`"
          class="group flex-shrink-0 w-64 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
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
              <UIcon :name="section.icon" class="w-12 h-12 text-white/20" />
              <span class="text-white/30 text-xs">{{ section.label.replace("Today's ", '') }}</span>
            </div>
            <!-- Duration Badge for videos -->
            <div v-if="item.duration" class="absolute bottom-3 right-3">
              <UBadge
                :label="item.duration"
                color="neutral"
                variant="subtle"
                size="xs"
                class="backdrop-blur-sm"
              />
            </div>
            <!-- Play Overlay for videos -->
            <div
              v-if="section.type === 'video'"
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
              <span v-if="item.duration" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ item.duration }}
              </span>
              <span v-if="item.pages" class="flex items-center gap-1">
                <UIcon name="i-lucide-file-text" class="w-3 h-3" />
                {{ item.pages }} pages
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
      <div v-else class="flex items-center gap-2 py-4 px-4 rounded-xl border border-white/10 bg-white/5 text-white/40 text-sm">
        <UIcon :name="section.icon" class="w-5 h-5 text-white/20" />
        <span>No {{ section.libraryLabel.toLowerCase() }} available yet</span>
      </div>
    </section>
  </div>
</template>
