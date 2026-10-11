export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/seo'
  ],
  ssr: false,
  devtools: {
    enabled: false
  },
  app: {
    baseURL: '/KiSS/'
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://kiss-me-harder.github.io',
    name: 'KiSS Academy',
    description: 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
    defaultLocale: 'en'
  },
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
  },
  image: {
    inject: false
  },
  ogImage: {
    enabled: false
  },
  robots: {
    robotsTxt: false,
    sitemap: '/sitemap.xml',
    groups: [
      {
        userAgent: '*',
        allow: '/'
      }
    ]
  },
  sitemap: {
    // Nuxt SEO auto-discovers pages from the app
  }
})
