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
    '@nuxtjs/seo',
    '@nuxt/fonts',
    '@vite-pwa/nuxt'
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
    url: 'https://kiss-me-harder.github.io/KiSS',
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
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/KiSS/',
      name: 'KiSS Academy',
      short_name: 'KiSS',
      description: 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
      start_url: '/KiSS/',
      icons: [
        {
          src: '/KiSS/logo_dark.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/KiSS/logo_light.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true
    },
    devOptions: {
      enabled: false
    }
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
  seo: {
    automaticTwitterTags: false
  },
  sitemap: {
    zeroRuntime: true
  }
})
