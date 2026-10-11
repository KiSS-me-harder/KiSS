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
      <div v-if="item" class="space-y-6">
        <!-- Media Viewer -->
        <div class="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <!-- Image Viewer -->
          <div v-if="item.type === 'image'" class="flex items-center justify-center bg-black/50 p-8">
            <img
              :src="item.url"
              :alt="item.title"
              class="max-w-full max-h-[70vh] object-contain rounded-lg"
            >
          </div>

          <!-- Video Player -->
          <div v-else-if="item.type === 'video'" class="flex items-center justify-center bg-black/50 p-8">
            <video
              ref="videoEl"
              :src="item.url"
              :poster="item.thumbnail"
              controls
              class="max-w-full max-h-[70vh] rounded-lg"
              autoplay
              @play="onVideoPlay"
              @pause="onVideoPause"
              @timeupdate="onVideoTimeUpdate"
              @loadedmetadata="onVideoLoadedMetadata"
              @ended="onVideoEnded"
            >
              Your browser does not support the video element.
            </video>
          </div>

          <!-- Audio Player -->
          <div v-else-if="item.type === 'audio'" class="flex flex-col items-center justify-center bg-black/50 p-12 gap-6">
            <div
              class="w-24 h-24 rounded-full flex items-center justify-center"
              :class="getAudioBgClass()"
            >
              <UIcon name="i-lucide-headphones" class="w-12 h-12 text-white/80" />
            </div>
            <div class="text-center">
              <h3 class="text-white text-lg font-semibold">
                {{ item.title }}
              </h3>
              <p class="text-white/50 text-sm mt-1">
                {{ item.author }}
              </p>
            </div>
            <audio
              ref="audioEl"
              :src="item.url"
              controls
              class="w-full max-w-md"
              autoplay
              @play="onAudioPlay"
              @pause="onAudioPause"
              @timeupdate="onAudioTimeUpdate"
              @loadedmetadata="onAudioLoadedMetadata"
              @ended="onAudioEnded"
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <!-- Unknown Type -->
          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-file" class="w-12 h-12 text-white/20 mb-3" />
            <p class="text-white/40 text-sm">
              Unsupported media type
            </p>
          </div>
        </div>

        <!-- Info Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Description -->
          <div class="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-white/60" />
              <h3 class="text-white text-sm font-semibold">
                About
              </h3>
            </div>
            <h2 class="text-white text-xl font-bold">
              {{ item.title }}
            </h2>
            <p class="text-white/60 text-sm mt-2">
              {{ item.description }}
            </p>
            <div class="flex items-center gap-4 mt-4 text-white/40 text-xs">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-user" class="w-3 h-3" />
                {{ item.author }}
              </span>
              <span v-if="item.duration" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ item.duration }}
              </span>
              <UBadge
                :label="getMediaTypeLabel(item.type)"
                :color="safeColor(getMediaTypeColor(item.type))"
                variant="subtle"
                size="xs"
              />
            </div>
            <!-- Tags -->
            <div v-if="item.tags && item.tags.length" class="flex gap-1.5 mt-4 flex-wrap">
              <UBadge
                v-for="tag in item.tags"
                :key="tag"
                :label="tag"
                color="neutral"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Actions -->
            <UCard class="rounded-xl border border-white/10 bg-white/5">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-share" class="w-4 h-4 text-white/60" />
                  <h3 class="text-white text-sm font-semibold">
                    Actions
                  </h3>
                </div>
              </template>
              <div class="space-y-2">
                <UButton
                  icon="i-lucide-download"
                  label="Download"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  class="rounded-xl w-full"
                  :to="item.url"
                  target="_blank"
                />
                <UButton
                  icon="i-lucide-heart"
                  label="Favorite"
                  :color="isFavorite ? 'primary' : 'neutral'"
                  variant="outline"
                  size="xs"
                  class="rounded-xl w-full"
                  @click="isFavorite = !isFavorite"
                />
              </div>
            </UCard>

            <!-- Related Media -->
            <UCard v-if="relatedItems.length > 0" class="rounded-xl border border-white/10 bg-white/5">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-list" class="w-4 h-4 text-white/60" />
                  <h3 class="text-white text-sm font-semibold">
                    Related Media
                  </h3>
                </div>
              </template>
              <div class="space-y-2">
                <NuxtLink
                  v-for="related in relatedItems.slice(0, 5)"
                  :key="related.path"
                  :to="`/library/${related.path.split('/').pop()}`"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <UIcon
                    :name="getMediaTypeIcon(related.type)"
                    class="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-xs font-medium truncate">{{ related.title }}</p>
                    <p class="text-white/30 text-[10px]">{{ getMediaTypeLabel(related.type) }}</p>
                  </div>
                </NuxtLink>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="flex flex-col items-center justify-center py-12 rounded-xl border border-white/10 bg-white/5">
        <UIcon name="i-lucide-library" class="w-12 h-12 text-white/20 mb-3" />
        <p class="text-white/40 text-sm mb-1">
          Media not found
        </p>
        <UButton
          label="Back to Library"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          class="rounded-xl mt-2"
          to="/library"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

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

const route = useRoute()
const slug = route.params.slug as string

const { data: itemRaw } = await useAsyncData(`library-${slug}`, () =>
  queryCollection('library').path(`/library/${slug}`).first()
)

const { data: allItemsRaw } = await useAsyncData('library-all', () =>
  queryCollection('library').all()
)

const item = computed<LibraryItem | null>(() => itemRaw.value as unknown as LibraryItem | null)
const allItems = computed<LibraryItem[]>(() => allItemsRaw.value as unknown as LibraryItem[])

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Library',
    icon: 'i-lucide-library',
    to: '/library'
  },
  {
    label: item.value?.title || slug,
    icon: item.value ? getMediaTypeIcon(item.value.type) : 'i-lucide-file'
  }
])

useHead({
  title: computed(() => `${item.value?.title || 'Media'} | Library`)
})

useSeoMeta({
  title: computed(() => `${item.value?.title || 'Media'} | Library`),
  description: computed(() => item.value?.description || 'View media content at KiSS Academy.'),
  ogTitle: computed(() => `${item.value?.title || 'Media'} | Library`),
  ogDescription: computed(() => item.value?.description || 'View media content at KiSS Academy.'),
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => {
        const type = item.value?.type
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': type === 'video' ? 'VideoObject' : type === 'audio' ? 'AudioObject' : type === 'image' ? 'ImageObject' : 'CreativeWork',
              '@id': `https://kiss-academy.github.io/KiSS/library/${slug}#creative`,
              'url': `https://kiss-academy.github.io/KiSS/library/${slug}`,
              'name': item.value?.title,
              'description': item.value?.description,
              'author': {
                '@type': 'Person',
                'name': item.value?.author
              },
              'inLanguage': 'en'
            },
            {
              '@type': 'WebPage',
              '@id': `https://kiss-academy.github.io/KiSS/library/${slug}#webpage`,
              'url': `https://kiss-academy.github.io/KiSS/library/${slug}`,
              'name': item.value?.title,
              'description': item.value?.description,
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
      })
    }
  ]
})

const isFavorite = ref(false)

const relatedItems = computed<LibraryItem[]>(() => {
  if (!item.value || !allItems.value) return []
  const currentTags = new Set(item.value.tags || [])
  return allItems.value.filter((i) => {
    if (i.path === item.value?.path) return false
    const tags = new Set(i.tags || [])
    for (const tag of currentTags) {
      if (tags.has(tag)) return true
    }
    return false
  })
})

// --- Media Player Integration ---

const mediaPlayer = useMediaPlayerStore()
const videoEl = ref<HTMLVideoElement | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)

// Register media with the store when page loads
if (item.value && (item.value.type === 'video' || item.value.type === 'audio')) {
  mediaPlayer.setMedia({
    title: item.value.title,
    type: item.value.type as 'video' | 'audio',
    url: item.value.url,
    thumbnail: item.value.thumbnail,
    author: item.value.author,
    duration: item.value.duration,
    currentPage: route.path
  })
}

// Watch for media element refs and register with store for haptics
watch([videoEl, audioEl], () => {
  const el = videoEl.value || audioEl.value
  mediaPlayer.setMediaElement(el)
})

// Video event handlers
function onVideoPlay() {
  mediaPlayer.setPlaying(true)
}
function onVideoPause() {
  mediaPlayer.setPlaying(false)
}
function onVideoTimeUpdate() {
  if (videoEl.value) {
    mediaPlayer.setTime(videoEl.value.currentTime, videoEl.value.duration)
  }
}
function onVideoLoadedMetadata() {
  if (videoEl.value) {
    mediaPlayer.setTime(videoEl.value.currentTime, videoEl.value.duration)
  }
}
function onVideoEnded() {
  mediaPlayer.setPlaying(false)
}

// Audio event handlers
function onAudioPlay() {
  mediaPlayer.setPlaying(true)
}
function onAudioPause() {
  mediaPlayer.setPlaying(false)
}
function onAudioTimeUpdate() {
  if (audioEl.value) {
    mediaPlayer.setTime(audioEl.value.currentTime, audioEl.value.duration)
  }
}
function onAudioLoadedMetadata() {
  if (audioEl.value) {
    mediaPlayer.setTime(audioEl.value.currentTime, audioEl.value.duration)
  }
}
function onAudioEnded() {
  mediaPlayer.setPlaying(false)
}

// Listen for widget control events
onMounted(() => {
  window.addEventListener('media-player-toggle', handleToggle)
  window.addEventListener('media-player-stop', handleStop)
})

onBeforeUnmount(() => {
  window.removeEventListener('media-player-toggle', handleToggle)
  window.removeEventListener('media-player-stop', handleStop)
  // Clear media store when leaving this page
  if (mediaPlayer.currentMedia?.currentPage === route.path) {
    mediaPlayer.clearMedia()
  }
})

function handleToggle() {
  const el = videoEl.value || audioEl.value
  if (!el) return
  if (el.paused) {
    el.play()
  } else {
    el.pause()
  }
}

function handleStop() {
  const el = videoEl.value || audioEl.value
  if (el) {
    el.pause()
    el.currentTime = 0
  }
}

type ColorType = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

function safeColor(color: string): ColorType {
  const valid: ColorType[] = ['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral']
  return (valid.includes(color as ColorType) ? color : 'neutral') as ColorType
}

function getMediaTypeIcon(type: string) {
  const icons: Record<string, string> = {
    image: 'i-lucide-image',
    video: 'i-lucide-video',
    audio: 'i-lucide-headphones'
  }
  return icons[type] || 'i-lucide-file'
}

function getMediaTypeLabel(type: string) {
  const labels: Record<string, string> = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio'
  }
  return labels[type] || type
}

function getMediaTypeColor(type: string) {
  const colors: Record<string, string> = {
    image: 'info',
    video: 'success',
    audio: 'warning'
  }
  return colors[type] || 'neutral'
}

function getAudioBgClass() {
  return 'bg-gradient-to-br from-amber-500/90 to-orange-600/90'
}
</script>
