<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const { data: degrees } = await useAsyncData(() => queryCollection('degrees').all())

const cards = ref(degrees.value?.map(item => ({ title: item.title, description: item.description, to: item.path, image: `/img/${item.stem}.webp`,
  orientation: 'horizontal' as const })))
const items = ref<BreadcrumbItem[]>([
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  }
])
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="(card, index) in cards"
          :key="index"
          v-bind="card"
          reverse
        >
          <NuxtImg
            v-if="card.image"
            :src="card.image"
            width="356"
            height="256"
          />
        </UPageCard>
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>
