<template>
  <div class="relative w-full h-screen bg-black overflow-hidden flex flex-col" data-testid="shorts-feed">
    <!-- Top bar -->
    <div
      class="relative z-10 flex items-center gap-3 px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-white/10"
      data-testid="shorts-topbar"
    >
      <!-- Sidebar toggle (mobile) and collapse (desktop) buttons -->
      <UDashboardSidebarToggle class="text-white" />
      <UDashboardSidebarCollapse class="text-white" />

      <div class="flex-1" />

      <!-- Degree filter dropdown -->
      <UDropdownMenu
        :items="degreeDropdownItems"
        data-testid="shorts-degree-filter"
      >
        <UButton
          color="white"
          variant="subtle"
          size="sm"
          icon="i-lucide-filter"
          label="Degrees"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>

      <!-- Loop mode toggle -->
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
        :class="shortsStore.loopMode ? 'bg-purple-500/30 text-purple-200' : 'bg-white/10 text-white/60 hover:text-white/80'"
        data-testid="shorts-loop-toggle"
        @click="shortsStore.toggleLoopMode()"
      >
        <UIcon
          :name="shortsStore.loopMode ? 'i-lucide-repeat' : 'i-lucide-skip-forward'"
          class="w-4 h-4"
        />
        <span class="hidden sm:inline">{{ shortsStore.loopMode ? 'Loop' : 'Auto-next' }}</span>
      </button>
    </div>

    <!-- Empty state when no matching videos -->
    <div
      v-if="filteredVideos.length === 0"
      class="flex flex-col items-center justify-center flex-1 text-center px-6"
      data-testid="shorts-empty-state"
    >
      <UIcon name="i-lucide-video-off" class="w-16 h-16 text-white/30 mb-4" />
      <h2 class="text-xl font-bold text-white mb-2">
        No matching videos
      </h2>
      <p class="text-white/60 max-w-md">
        No short videos found for the selected filters. Try adjusting your degree filter.
      </p>
    </div>

    <!-- Video feed -->
    <div
      v-else
      ref="feedContainer"
      class="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style="scroll-snap-type: y mandatory"
    >
      <div
        v-for="(video, index) in prioritizedVideos"
        :key="video.path"
        class="relative w-full h-full flex items-center justify-center snap-start snap-always"
        style="scroll-snap-align: start"
        :data-testid="`short-video`"
        :data-viewed="isViewed(video.path) ? 'true' : 'false'"
      >
        <!-- Video element -->
        <video
          :ref="el => setVideoRef(el, index)"
          class="max-w-full max-h-full object-contain"
          :src="video.url"
          :poster="video.thumbnail || undefined"
          preload="metadata"
          playsinline
          @loadedmetadata="onVideoLoaded(index)"
          @ended="onVideoEnded(index)"
        />

        <!-- Overlay gradient -->
        <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <!-- Video metadata overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <p class="text-sm font-medium text-white/80 mb-1" data-testid="short-video-course">
            {{ getCourseName(video) }}
          </p>
          <p class="text-lg font-bold text-white" data-testid="short-video-title">
            {{ video.title }}
          </p>
          <p class="text-sm text-white/60 mt-1">
            {{ video.author }} · {{ video.duration }}
          </p>
        </div>

        <!-- Playback controls -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            v-if="videoStates[index]?.showControls"
            class="pointer-events-auto p-4 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            data-testid="short-play-pause"
            @click="togglePlay(index)"
          >
            <UIcon
              :name="videoStates[index]?.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              class="w-8 h-8 text-white"
            />
          </button>
        </div>

        <!-- Right side controls -->
        <div class="absolute right-4 bottom-24 flex flex-col gap-4 pointer-events-none">
          <button
            class="pointer-events-auto p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            data-testid="short-mute"
            @click="toggleMute(index)"
          >
            <UIcon
              :name="videoStates[index]?.isMuted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
              class="w-5 h-5 text-white"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Shorts' })
useSeoMeta({
  title: 'Shorts',
  description: 'Short-form video feed based on your enrolled courses.',
  ogTitle: 'Shorts',
  ogDescription: 'Short-form video feed based on your enrolled courses.',
  ogType: 'website'
})

interface LibraryVideo {
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

// ── Stores ──

const shortsStore = useShortsStore()

// ── Degree info for filter dropdown ──

const { data: degreeItems } = await useAsyncData('shorts-degrees', () => queryCollection('degrees').all())

interface DegreeInfo {
  slug: string
  title: string
}

const allDegrees = computed<DegreeInfo[]>(() => {
  const degrees = degreeItems.value ?? []
  return degrees as unknown as DegreeInfo[]
})

// ── Degree filter dropdown items ──

const degreeDropdownItems = computed(() => {
  return [[
    ...allDegrees.value.map(degree => ({
      label: degree.title,
      icon: shortsStore.isDegreeEnabled(degree.slug) ? 'i-lucide-check' : '',
      onSelect(e: Event) {
        e.preventDefault()
        shortsStore.toggleEnabledDegree(degree.slug)
      }
    }))
  ]]
})

// ── Library videos ──

const { data: libraryItems } = await useAsyncData('shorts-library', () => queryCollection('library').all())

const allVideos = computed<LibraryVideo[]>(() => {
  if (!libraryItems.value) return []
  return (libraryItems.value as unknown as LibraryVideo[]).filter(item => item.type === 'video')
})

// Filter videos by enabled degrees; if none selected, show all videos
const filteredVideos = computed(() => {
  const enabledDegs = shortsStore.enabledDegrees.value ?? []
  // If no degrees are explicitly enabled, show all videos
  if (enabledDegs.length === 0) return allVideos.value ?? []

  const videos = allVideos.value ?? []
  return videos.filter((video) => {
    return (video.tags ?? []).some(tag => enabledDegs.includes(tag))
  })
})

// Prioritize unviewed videos
const prioritizedVideos = computed(() => {
  const viewed = getViewedIds() ?? []
  const videos = filteredVideos.value ?? []
  const unviewed = videos.filter(v => !viewed.includes(v.path))
  const viewedVideos = videos.filter(v => viewed.includes(v.path))
  return [...unviewed, ...viewedVideos]
})

// ── View tracking via store ──

function getViewedIds(): string[] {
  return shortsStore.viewed?.value ?? []
}

function isViewed(path: string): boolean {
  return shortsStore.isViewed(path)
}

// ── Video feed management ──

const {
  feedContainer,
  videoElements,
  videoStates,
  setVideoRef,
  onVideoLoaded,
  ensureState,
  togglePlay,
  toggleMute,
  pauseVideo,
  playVideo
} = useShortsVideoFeed()

function onVideoEnded(index: number) {
  if (shortsStore.loopMode.value) {
    const videoEl = videoElements.value[index]
    if (videoEl) {
      videoEl.currentTime = 0
      videoEl.play().catch(() => {})
      const state = ensureState(index)
      state.isPlaying = true
    }
  } else {
    const nextIndex = index + 1
    if (nextIndex < prioritizedVideos.value.length && feedContainer.value) {
      const nextContainer = feedContainer.value.children[nextIndex]
      if (nextContainer) {
        nextContainer.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}

onMounted(() => {
  setupShortsObserver(
    feedContainer.value,
    pauseVideo,
    playVideo,
    (path: string) => shortsStore.markViewed(path)
  )
})

// ── Course name from tags ──

function getCourseName(video: LibraryVideo): string {
  const tags = video.tags ?? []
  const tag = tags[0]
  if (tag) {
    return tag.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
  return 'Unknown'
}
</script>
