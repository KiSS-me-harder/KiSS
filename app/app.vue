<template>
  <UApp>
    <NuxtLoadingIndicator />

    <!-- Age verification gate: completely black background, no app content visible -->
    <ClientOnly>
      <div
        v-show="!ageVerified"
        class="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      >
        <AgeVerificationModal @close="onAgeVerificationClose" />
      </div>
    </ClientOnly>

    <!-- App content hidden until age is verified -->
    <NuxtLayout v-show="ageVerified">
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { LazyAgeVerificationModal as AgeVerificationModal } from '#components'

const ageCookie = useCookie('age-verification')

// Reactive age verification: true when cookie is set to 'yes'
const ageVerified = computed(() => ageCookie.value === 'yes')

const colorMode = useColorMode()
const appConfig = useAppConfig()

// Apply saved theme colors on client-side initialization
const themeStore = useThemeStore()
if (import.meta.client) {
  onMounted(() => {
    appConfig.ui.colors.primary = themeStore.primary
    appConfig.ui.colors.neutral = themeStore.neutral
  })
}

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

// Reactive favicon based on theme
const faviconTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: computed(() => `/KiSS/favicon_${faviconTheme.value}_32.png`) },
    { rel: 'icon', type: 'image/x-icon', href: computed(() => `/KiSS/favicon_${faviconTheme.value}.ico`) }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'KiSS — Personal Development & Habit Tracking'
const description = 'A structured, gamified platform for self-improvement through degree programs, classes, clubs, daily routines, and progress tracking.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

function onAgeVerificationClose(verified: boolean) {
  if (verified) {
    ageCookie.value = 'yes'
  }
}
</script>
