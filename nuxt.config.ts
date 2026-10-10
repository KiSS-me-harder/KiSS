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
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-07-11',
  nitro: {
    preset: 'github_pages'
  },
  telemetry: false,
  app: {
    baseURL: '/KiSS/'
  },
  site: {
    url: 'https://kiss-academy.github.io',
    name: 'KiSS Academy',
    description: 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
    defaultLocale: 'en'
  },
  sitemap: {
    // Nuxt SEO auto-discovers pages from the app
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
  ogImage: {
    enabled: false
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
