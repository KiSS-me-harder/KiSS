export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils'
  ],
  ssr: true,
  devtools: {
    enabled: false
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-07-11',
  nitro: {
    preset: 'github_pages'
  },
  telemetry: false,
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
