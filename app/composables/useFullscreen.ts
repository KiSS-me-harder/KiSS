/**
 * Manages fullscreen state for a container element.
 * @param containerRef - Ref to the container element.
 * @returns Object with isFullscreen ref and toggleFullscreen function.
 */
export function useFullscreen(containerRef: Ref<HTMLDivElement | null>) {
  const isFullscreen = ref(false)

  function updateCursor() {
    if (!import.meta.client) return
    document.body.style.cursor = document.fullscreenElement ? 'none' : ''
  }

  async function toggleFullscreen() {
    if (!import.meta.client) return
    const container = containerRef.value
    if (!container) return

    if (isFullscreen.value) {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      isFullscreen.value = false
    } else {
      try {
        await container.requestFullscreen()
        isFullscreen.value = true
      } catch {
        isFullscreen.value = true
      }
    }
  }

  if (import.meta.client) {
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = !!document.fullscreenElement
      updateCursor()
    })
  }

  return { isFullscreen, toggleFullscreen }
}
