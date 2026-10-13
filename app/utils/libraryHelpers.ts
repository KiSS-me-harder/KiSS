/**
 * Helper functions for library items.
 * Extracted from useLibraryItem to keep the composable within line limits.
 */

/**
 * Library item data structure.
 */
export interface LibraryItem {
  title: string
  description: string
  type: string
  url: string
  thumbnail?: string
  author?: string
  duration?: string
  tags?: string[]
  path: string
}

/**
 * Parses a raw library content entry into a LibraryItem.
 * @param raw - The raw content entry.
 * @returns Parsed library item or null.
 */
export function parseLibraryItem(raw: unknown): LibraryItem | null {
  if (!raw) return null
  return {
    title: (raw as { title?: string }).title || '',
    description: (raw as { description?: string }).description || '',
    type: ((raw as { type?: string }).type as string) || '',
    url: ((raw as { url?: string }).url as string) || '',
    thumbnail: (raw as { thumbnail?: string }).thumbnail as string | undefined,
    author: (raw as { author?: string }).author as string | undefined,
    duration: (raw as { duration?: string }).duration as string | undefined,
    path: (raw as { path?: string }).path || ''
  }
}

/**
 * Parses an array of raw library content entries into LibraryItems.
 * @param rawItems - Array of raw content entries.
 * @returns Array of parsed library items.
 */
export function parseLibraryItems(rawItems: unknown[]): LibraryItem[] {
  if (!rawItems) return []
  return rawItems.map(r => parseLibraryItem(r)!).filter(Boolean)
}

/**
 * Finds related items based on shared tags.
 * @param currentItem - The current library item.
 * @param allItems - All library items.
 * @returns Array of related items.
 */
export function findRelatedItems(currentItem: LibraryItem | null, allItems: LibraryItem[]): LibraryItem[] {
  if (!currentItem || !allItems.length) return []
  const currentTags = new Set((currentItem.tags as string[]) || [])
  return allItems.filter((i) => {
    if (i.path === currentItem.path) return false
    const tags = new Set((i.tags as string[]) || [])
    for (const tag of currentTags) {
      if (tags.has(tag)) return true
    }
    return false
  })
}

/**
 * Returns the icon name for a media type.
 * @param type - The media type string.
 * @returns Lucide icon name.
 */
export function getMediaTypeIcon(type: string): string {
  const icons: Record<string, string> = { image: 'i-lucide-image', video: 'i-lucide-video', audio: 'i-lucide-headphones' }
  return icons[type] || 'i-lucide-file'
}

/**
 * Returns the display label for a media type.
 * @param type - The media type string.
 * @returns Human-readable label.
 */
export function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = { image: 'Image', video: 'Video', audio: 'Audio' }
  return labels[type] || type
}

/**
 * Returns the color name for a media type.
 * @param type - The media type string.
 * @returns Color name for UI components.
 */
export function getMediaTypeColor(type: string): string {
  const colors: Record<string, string> = { image: 'info', video: 'success', audio: 'warning' }
  return colors[type] || 'neutral'
}

/**
 * Validates a color name against allowed UBadge colors.
 * @param color - The color string to validate.
 * @returns Valid color name or 'neutral' if invalid.
 */
export function safeColor(color: string): string {
  const valid = ['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral']
  return valid.includes(color) ? color : 'neutral'
}

/**
 * Builds structured data JSON-LD for a library item.
 * @param item - The library item.
 * @param slug - The item slug.
 * @returns JSON string of structured data.
 */
export function buildLibraryStructuredData(item: LibraryItem | null, slug: string): string {
  const type = item?.type
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type === 'video' ? 'VideoObject' : type === 'audio' ? 'AudioObject' : type === 'image' ? 'ImageObject' : 'CreativeWork',
        '@id': `https://kiss-academy.github.io/KiSS/library/${slug}#creative`,
        'url': `https://kiss-academy.github.io/KiSS/library/${slug}`,
        'name': item?.title,
        'description': item?.description,
        'author': { '@type': 'Person', 'name': item?.author },
        'inLanguage': 'en'
      },
      {
        '@type': 'WebPage',
        '@id': `https://kiss-academy.github.io/KiSS/library/${slug}#webpage`,
        'url': `https://kiss-academy.github.io/KiSS/library/${slug}`,
        'name': item?.title,
        'description': item?.description,
        'inLanguage': 'en',
        'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kiss-academy.github.io/KiSS/#website',
        'url': 'https://kiss-academy.github.io/KiSS/',
        'name': 'KiSS Academy',
        'description': 'KiSS Academy - A gamified learning platform.',
        'inLanguage': 'en'
      }
    ]
  })
}

/**
 * Sets up media player integration for a library item.
 * @param item - The library item computed ref.
 * @param mediaPlayer - The media player store.
 * @param route - Current route with path.
 */
export function setupMediaPlayerWatch(
  item: ComputedRef<LibraryItem | null>,
  mediaPlayer: { setMedia: (media: { title: string, type: 'video' | 'audio', url: string, thumbnail?: string, author?: string, duration?: string, currentPage: string }) => void },
  route: { path: string }
) {
  watch(item, (newItem) => {
    if (newItem && (newItem.type === 'video' || newItem.type === 'audio')) {
      mediaPlayer.setMedia({
        title: newItem.title,
        type: newItem.type as 'video' | 'audio',
        url: newItem.url,
        thumbnail: newItem.thumbnail ?? undefined,
        author: newItem.author ?? undefined,
        duration: newItem.duration ?? undefined,
        currentPage: route.path
      })
    }
  })
}

/**
 * Creates video event handlers for media player integration.
 * @param videoEl - Video element ref.
 * @param mediaPlayer - Media player store.
 * @returns Object with video event handler functions.
 */
export function createVideoHandlers(
  videoEl: Ref<HTMLVideoElement | null>,
  mediaPlayer: { setPlaying: (p: boolean) => void, setTime: (t: number, d: number) => void }
) {
  return {
    onPlay: () => mediaPlayer.setPlaying(true),
    onPause: () => mediaPlayer.setPlaying(false),
    onTimeUpdate: () => {
      if (videoEl.value) mediaPlayer.setTime(videoEl.value.currentTime, videoEl.value.duration)
    },
    onLoadedMetadata: () => {
      if (videoEl.value) mediaPlayer.setTime(videoEl.value.currentTime, videoEl.value.duration)
    },
    onEnded: () => mediaPlayer.setPlaying(false)
  }
}

/**
 * Creates audio event handlers for media player integration.
 * @param audioEl - Audio element ref.
 * @param mediaPlayer - Media player store.
 * @returns Object with audio event handler functions.
 */
export function createAudioHandlers(
  audioEl: Ref<HTMLAudioElement | null>,
  mediaPlayer: { setPlaying: (p: boolean) => void, setTime: (t: number, d: number) => void }
) {
  return {
    onPlay: () => mediaPlayer.setPlaying(true),
    onPause: () => mediaPlayer.setPlaying(false),
    onTimeUpdate: () => {
      if (audioEl.value) mediaPlayer.setTime(audioEl.value.currentTime, audioEl.value.duration)
    },
    onLoadedMetadata: () => {
      if (audioEl.value) mediaPlayer.setTime(audioEl.value.currentTime, audioEl.value.duration)
    },
    onEnded: () => mediaPlayer.setPlaying(false)
  }
}

/**
 * Creates toggle and stop handlers for media player window events.
 * @param videoEl - Video element ref.
 * @param audioEl - Audio element ref.
 * @returns Object with toggle and stop functions.
 */
export function createMediaControls(
  videoEl: Ref<HTMLVideoElement | null>,
  audioEl: Ref<HTMLAudioElement | null>
) {
  function handleToggle() {
    const el = videoEl.value || audioEl.value
    if (!el) return
    if (el.paused) el.play()
    else el.pause()
  }

  function handleStop() {
    const el = videoEl.value || audioEl.value
    if (el) {
      el.pause()
      el.currentTime = 0
    }
  }

  return { handleToggle, handleStop }
}
