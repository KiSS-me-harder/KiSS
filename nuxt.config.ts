export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils'
  ],
  ssr: false,
  devtools: {
    enabled: false
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-07-11',
  nitro: {
    preset: 'github_pages'
  },
  telemetry: false,
  app: {
    baseURL: '/KiSS/'
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
