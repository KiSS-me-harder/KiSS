export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/content',
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
  content: {
    experimental: {
      nativeSqlite: true,
      sqliteConnector: 'native'
    }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    preset: 'github_pages',
    prerender: {
      crawlLinks: true,
      failOnError: false
    }
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
