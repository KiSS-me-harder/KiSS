import { useMediaPlayerStore } from '~/stores/mediaPlayer'
import {
  parseLibraryItem, parseLibraryItems, findRelatedItems,
  getMediaTypeIcon, getMediaTypeLabel, getMediaTypeColor, safeColor, buildLibraryStructuredData,
  setupMediaPlayerWatch, createVideoHandlers, createAudioHandlers, createMediaControls
} from '~/utils/libraryHelpers'

/**
 * Composable for the library item detail page.
 * Provides media item data, related items, media player integration,
 * and helper functions for media type icons/labels/colors.
 */
export async function useLibraryItem() {
  const route = useRoute()
  const slug = computed(() => route.params.slug as string)
  const mediaPlayer = useMediaPlayerStore()
  const videoEl = ref<HTMLVideoElement | null>(null)
  const audioEl = ref<HTMLAudioElement | null>(null)
  const isFavorite = ref(false)

  const videoHandlers = createVideoHandlers(videoEl, mediaPlayer)
  const audioHandlers = createAudioHandlers(audioEl, mediaPlayer)
  const { handleToggle, handleStop } = createMediaControls(videoEl, audioEl)

  onMounted(() => {
    window.addEventListener('media-player-toggle', handleToggle)
    window.addEventListener('media-player-stop', handleStop)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('media-player-toggle', handleToggle)
    window.removeEventListener('media-player-stop', handleStop)
    if (mediaPlayer.currentMedia?.currentPage === route.path) mediaPlayer.clearMedia()
  })

  const { data: itemRaw } = await useAsyncData(
    () => `library-${slug.value}`,
    () => queryCollection('library').path(`/library/${slug.value}`).first(),
    { watch: [slug] }
  )

  const { data: allItemsRaw } = await useAsyncData('library-all', () => queryCollection('library').all())

  const item = computed(() => parseLibraryItem(itemRaw.value))
  const allItems = computed(() => parseLibraryItems(allItemsRaw.value || []))

  const breadcrumbs = computed(() => [
    { label: 'Library', icon: 'i-lucide-library', to: '/library' },
    { label: item.value?.title || slug.value, icon: item.value ? getMediaTypeIcon(item.value.type) : 'i-lucide-file' }
  ])

  useHead({ title: computed(() => `${item.value?.title || 'Media'} | Library`) })
  useSeoMeta({
    title: computed(() => `${item.value?.title || 'Media'} | Library`),
    description: computed(() => (item.value?.description as string) || 'View media content at KiSS Academy.'),
    ogTitle: computed(() => `${item.value?.title || 'Media'} | Library`),
    ogDescription: computed(() => (item.value?.description as string) || 'View media content at KiSS Academy.'),
    ogType: 'website'
  })
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: computed(() => buildLibraryStructuredData(item.value, slug.value))
    }]
  })

  const relatedItems = computed(() => findRelatedItems(item.value, allItems.value))

  setupMediaPlayerWatch(item, mediaPlayer, route)

  watch([videoEl, audioEl], () => {
    mediaPlayer.setMediaElement(videoEl.value || audioEl.value)
  })

  return {
    item, allItems, relatedItems, isFavorite, breadcrumbs,
    videoEl, audioEl,
    ...videoHandlers, ...audioHandlers,
    getMediaTypeIcon, getMediaTypeLabel, getMediaTypeColor, safeColor,
    getAudioBgClass: () => 'bg-gradient-to-br from-amber-500/90 to-orange-600/90'
  }
}
