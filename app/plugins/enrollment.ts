import { useEnrollmentStore } from '~/stores/enrollment'

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Ensure the enrollment store loads from localStorage on client mount
    const store = useEnrollmentStore()
    store.loadFromStorage()
  }
})
