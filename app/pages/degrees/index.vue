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
      <div v-if="degrees" class="grid grid-cols-3 gap-2">
        <NuxtLink
          v-for="degree in degrees"
          :key="degree.id"
          :to="degree.path"
          class="relative aspect-square rounded-lg overflow-hidden group"
        >
          <!-- Background Image -->
          <img
            :src="`/img/degrees/${degree.stem.split('/').pop()}.webp`"
            :alt="degree.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <!-- Title -->
          <div class="absolute bottom-0 left-0 right-0 p-2">
            <p class="text-white text-xs font-semibold leading-tight">
              {{ degree.title }}
            </p>
          </div>

          <!-- Badges -->
          <div class="absolute top-1.5 left-1.5 flex flex-col gap-1">
            <span
              v-if="degree.stem.endsWith('/sissy')"
              class="px-1.5 py-0.5 rounded-sm bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wide"
            >
              Active
            </span>
          </div>

          <div class="absolute top-1.5 right-1.5">
            <span
              v-if="degree.stem.endsWith('/sissy')"
              class="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px] font-bold"
            >
              F
            </span>
          </div>

          <!-- Subtitle -->
          <div class="absolute bottom-6 left-2 right-2">
            <p class="text-white/60 text-[10px]">
              Metz.
            </p>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const { data: degrees } = await useAsyncData('degrees', () => {
  return queryCollection('degrees').all()
})

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  }
])
</script>
