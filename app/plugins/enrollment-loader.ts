/**
 * Nuxt plugin that loads the enrollment store from localStorage after hydration.
 *
 * This ensures that localStorage data is restored regardless of when the store
 * was first created (SSR vs client-side). The previous approach of checking
 * hydration inside defineStore() failed because the store was created during
 * SSR, so the client-side hydration guard was never set up.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()

    // Load after hydration is complete
    if (nuxtApp.isHydrated) {
      const store = useEnrollmentStore()
      store.loadFromStorage()
    } else {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) {
          const store = useEnrollmentStore()
          store.loadFromStorage()
        }
      }, { once: true })
    }
  }
})
