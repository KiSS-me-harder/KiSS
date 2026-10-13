interface VideoState {
  isPlaying: boolean
  isMuted: boolean
  showControls: boolean
  loaded: boolean
}

const DEFAULT_STATE: VideoState = { isPlaying: false, isMuted: true, showControls: true, loaded: false }

/**
 * Composable for managing Shorts video feed state, including playback controls
 * and auto-play via Intersection Observer.
 */
export function useShortsVideoFeed() {
  const feedContainer = ref<HTMLElement | null>(null)
  const videoElements = ref<(HTMLVideoElement | null)[]>([])
  const videoStates = ref<VideoState[]>([])
  const controlsTimers = new Map<number, number>()

  function setVideoRef(el: unknown, index: number) {
    if (el instanceof HTMLVideoElement) {
      videoElements.value[index] = el
    }
  }

  function onVideoLoaded(index: number) {
    if (!videoStates.value[index]) {
      videoStates.value[index] = { ...DEFAULT_STATE }
    }
    videoStates.value[index].loaded = true
  }

  function ensureState(index: number): VideoState {
    if (!videoStates.value[index]) {
      videoStates.value[index] = { ...DEFAULT_STATE }
    }
    return videoStates.value[index]
  }

  function resetControlsTimer(index: number) {
    if (controlsTimers.has(index)) {
      clearTimeout(controlsTimers.get(index))
    }
    const timer = window.setTimeout(() => {
      const state = ensureState(index)
      state.showControls = false
    }, 3000)
    controlsTimers.set(index, timer)
  }

  function togglePlay(index: number) {
    const video = videoElements.value[index]
    const state = ensureState(index)
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      state.isPlaying = true
    } else {
      video.pause()
      state.isPlaying = false
    }
    state.showControls = true
    resetControlsTimer(index)
  }

  function toggleMute(index: number) {
    const video = videoElements.value[index]
    const state = ensureState(index)
    if (!video) return
    video.muted = !video.muted
    state.isMuted = video.muted
  }

  function playVideo(index: number, markViewedFn: (path: string) => void) {
    const video = videoElements.value[index]
    const state = ensureState(index)
    if (!video) return
    video.muted = true
    state.isMuted = true
    video.play().then(() => {
      state.isPlaying = true
      state.showControls = true
      resetControlsTimer(index)
      setTimeout(() => {
        if (state.isPlaying) {
          markViewedFn(video.src)
        }
      }, 5000)
    }).catch(() => {
      state.isPlaying = false
    })
  }

  function pauseVideo(index: number) {
    const video = videoElements.value[index]
    const state = ensureState(index)
    if (!video) return
    video.pause()
    state.isPlaying = false
  }

  return {
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
  }
}

/**
 * Sets up an Intersection Observer to auto-play the visible video in the Shorts feed.
 * @param feedContainer - The scroll container element ref.
 * @param pauseVideo - Function to pause a video by index.
 * @param playVideo - Function to play a video by index.
 * @param markViewedFn - Callback to mark a video as viewed.
 */
export function setupShortsObserver(
  feedContainer: HTMLElement | null,
  pauseVideo: (index: number) => void,
  playVideo: (index: number, markViewedFn: (path: string) => void) => void,
  markViewedFn: (path: string) => void
) {
  if (!import.meta.client || !feedContainer) return
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target)
      if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
        playVideo(index, markViewedFn)
      }
    })
  }, { threshold: 0.7 })
  for (const container of Array.from(feedContainer.children)) {
    observer.observe(container)
  }
}
