<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: punishment } = await useAsyncData(
  () => `punishment-${slug.value}`,
  () => queryCollection('punishments')
    .path(`/punishments/${slug.value}`)
    .first(),
  {
    watch: [slug]
  }
)

const title = computed(() => punishment.value?.title)
const description = computed(() => punishment.value?.description)
const body = computed(() => punishment.value?.body)

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Punishments',
    icon: 'i-lucide-shield-alert',
    to: '/punishments'
  },
  {
    label: title.value,
    to: `/punishments/${slug.value}`
  }
])

useHead({
  title
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `https://kiss-academy.github.io/KiSS/punishments/${slug.value}#webpage`,
            'url': `https://kiss-academy.github.io/KiSS/punishments/${slug.value}`,
            'name': title.value,
            'description': description.value,
            'inLanguage': 'en',
            'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
          },
          {
            '@type': 'WebSite',
            '@id': 'https://kiss-academy.github.io/KiSS/#website',
            'url': 'https://kiss-academy.github.io/KiSS/',
            'name': 'KiSS Academy',
            'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
            'inLanguage': 'en'
          }
        ]
      }))
    }
  ]
})

const punishmentGradients = [
  'bg-gradient-to-br from-red-600 to-rose-800',
  'bg-gradient-to-br from-orange-600 to-red-800',
  'bg-gradient-to-br from-pink-600 to-rose-800',
  'bg-gradient-to-br from-purple-600 to-indigo-800',
  'bg-gradient-to-br from-amber-600 to-orange-800',
  'bg-gradient-to-br from-red-600 to-pink-800',
  'bg-gradient-to-br from-violet-600 to-purple-800',
  'bg-gradient-to-br from-rose-600 to-red-800',
  'bg-gradient-to-br from-fuchsia-600 to-pink-800',
  'bg-gradient-to-br from-sky-600 to-indigo-800',
  'bg-gradient-to-br from-teal-600 to-emerald-800',
  'bg-gradient-to-br from-cyan-600 to-blue-800'
]

const punishmentIcons = [
  'i-lucide-lock',
  'i-lucide-shield-alert',
  'i-lucide-droplet',
  'i-lucide-circle-dot',
  'i-lucide-corner-down-right',
  'i-lucide-message-circle-warning',
  'i-lucide-eye-off',
  'i-lucide-hand',
  'i-lucide-book-open-text',
  'i-lucide-ban',
  'i-lucide-megaphone',
  'i-lucide-pencil',
  'i-lucide-repeat',
  'i-lucide-ear-off',
  'i-lucide-hand-helping',
  'i-lucide-hand',
  'i-lucide-clipboard-list'
]

const gradientIndex = computed(() => {
  // Use a hash of the slug to consistently pick a gradient/icon
  let hash = 0
  for (let i = 0; i < slug.value.length; i++) {
    hash = ((hash << 5) - hash) + slug.value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="punishment" class="space-y-4">
        <!-- Hero Section -->
        <div
          class="relative rounded-xl overflow-hidden border border-white/10 shadow-lg"
          :class="punishmentGradients[gradientIndex % punishmentGradients.length]"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div class="relative p-6 sm:p-8">
            <div class="flex items-start gap-4">
              <UIcon
                :name="punishmentIcons[gradientIndex % punishmentIcons.length]"
                class="w-12 h-12 text-white/40 shrink-0 mt-1"
              />
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-white mb-2">
                  {{ title }}
                </h1>
                <p v-if="description" class="text-white/70 text-sm leading-relaxed">
                  {{ description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Punishment Content -->
        <div v-if="body" class="prose prose-invert max-w-none">
          <ContentRenderer :value="punishment" />
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
