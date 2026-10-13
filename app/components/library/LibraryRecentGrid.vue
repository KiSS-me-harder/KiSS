<template>
  <div class="space-y-4">
    <h2 class="text-white text-sm font-semibold">
      Recent Media
    </h2>

    <div v-if="items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="item in items"
        :key="item.path"
        :to="`/library/${item.path.split('/').pop()}`"
        data-testid="library-item-card"
        class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden"
      >
        <div class="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          >
          <div v-else class="flex flex-col items-center gap-2">
            <UIcon :name="getMediaTypeIcon(item.type)" class="w-12 h-12 text-white/20" />
            <span class="text-white/30 text-xs">{{ getMediaTypeLabel(item.type) }}</span>
          </div>
          <div class="absolute top-3 left-3">
            <UBadge
              :label="getMediaTypeLabel(item.type)"
              :color="safeColor(getMediaTypeColor(item.type))"
              variant="subtle"
              size="xs"
              class="backdrop-blur-sm"
            />
          </div>
          <div v-if="item.duration" class="absolute bottom-3 right-3">
            <UBadge
              :label="item.duration"
              color="neutral"
              variant="subtle"
              size="xs"
              class="backdrop-blur-sm"
            />
          </div>
          <div v-if="item.type !== 'image'" class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
            <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <UIcon name="i-lucide-play" class="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-white text-sm font-semibold truncate">{{ item.title }}</h3>
          <p class="text-white/50 text-xs mt-1 line-clamp-2">{{ item.description }}</p>
          <div class="flex items-center gap-3 mt-3 text-white/30 text-xs">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-user" class="w-3 h-3" />{{ item.author }}
            </span>
          </div>
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

    <div v-else class="flex flex-col items-center justify-center py-12 rounded-xl border border-white/10 bg-white/5">
      <UIcon name="i-lucide-library" class="w-12 h-12 text-white/20 mb-3" />
      <p class="text-white/40 text-sm mb-1">
        No media found
      </p>
      <p class="text-white/30 text-xs">
        Select a media type above to browse content
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LibraryItem {
  path: string
  title: string
  description: string
  type: string
  author: string
  tags: string[]
  thumbnail: string | null
  duration: string | null
}

defineProps<{
  items: LibraryItem[]
}>()

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
    image: 'Img',
    video: 'Vid',
    audio: 'Aud',
    book: 'Bk'
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
