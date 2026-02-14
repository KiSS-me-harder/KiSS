<script setup lang="ts">
import type { BreadcrumbItem, ButtonProps } from '@nuxt/ui'

const route = useRoute()
const id = route.params.id
const { data: home } = await useAsyncData(() => queryCollection('content').path(`/degrees/${id}`).first())
const title = home.value?.title
const items = ref<BreadcrumbItem[]>([
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  },
  {
    label: title,
    to: `/degrees/${id}`
  }
])

useSeoMeta({
  title: title,
  description: home.value?.description
})

const links = ref<ButtonProps[]>([
  {
    label: 'Enroll',
    color: 'primary',
    variant: 'subtle'
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
      <UPageCTA
        :title="title"
        orientation="horizontal"
        reverse
        variant="subtle"
        class="description-top"
      >
        <NuxtImg
          src="/img/placeholder.webp"
          width="320"
          height="364"
          alt="Illustration"
          class="w-full rounded-lg"
        />
        <template #description>
          <ContentRenderer v-if="home" :value="home" />
          <UButton size="xl" variant="subtle" class="p-5">
            Enroll
          </UButton>
        </template>
      </UPageCTA>
    </template>
  </UDashboardPanel>
</template>

<style>
.description-top > div {
  padding: 2rem !important;
}
.description-top > div > div {
  height: 100% !important;
}
</style>
