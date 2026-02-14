<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()

const id = computed(() => route.params.id as string)

const { data: home } = await useAsyncData(
  () => `degree-${id.value}`,
  () => queryCollection('content')
    .path(`/degrees/${id.value}`)
    .first(),
  {
    watch: [id]
  }
)

const title = computed(() => home.value?.title)

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  },
  {
    label: title.value,
    to: `/degrees/${id.value}`
  }
])

useSeoMeta({
  title,
  description: computed(() => home.value?.description)
})
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
