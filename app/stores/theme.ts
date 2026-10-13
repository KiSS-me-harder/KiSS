import { storageGetItem, storageSetItem } from '~/utils/storage'

const STORAGE_KEY = 'kiss-theme'

/**
 * Theme store for persisting UI color preferences across page reloads.
 * Stores the primary and neutral color selections from the sidebar theme picker.
 */
export const useThemeStore = defineStore('theme', () => {
  // Default values match Nuxt UI defaults
  const primary = ref('pink')
  const neutral = ref('mauve')

  /** Loads saved theme preferences from localStorage. */
  function loadFromStorage() {
    const saved = storageGetItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.primary) primary.value = parsed.primary
        if (parsed.neutral) neutral.value = parsed.neutral
      } catch {
        // Ignore parse errors, keep defaults
      }
    }
  }

  /** Saves current theme preferences to localStorage. */
  function saveToStorage() {
    storageSetItem(STORAGE_KEY, JSON.stringify({ primary: primary.value, neutral: neutral.value }))
  }

  /**
   * Sets the primary theme color and syncs to appConfig for immediate UI update.
   * @param color - The Nuxt UI color name (e.g., 'red', 'blue', 'purple').
   */
  function setPrimary(color: string) {
    primary.value = color
    if (import.meta.client) {
      const appConfig = useAppConfig()
      appConfig.ui.colors.primary = color
    }
  }

  /**
   * Sets the neutral theme color and syncs to appConfig for immediate UI update.
   * @param color - The Nuxt UI neutral color name (e.g., 'slate', 'gray', 'zinc').
   */
  function setNeutral(color: string) {
    neutral.value = color
    if (import.meta.client) {
      const appConfig = useAppConfig()
      appConfig.ui.colors.neutral = color
    }
  }

  // Load from localStorage after hydration
  if (import.meta.client) {
    onMounted(() => {
      loadFromStorage()
    })
  }

  // Auto-save on changes
  watch([primary, neutral], () => {
    saveToStorage()
  }, { deep: true })

  return {
    primary,
    neutral,
    setPrimary,
    setNeutral
  }
})
