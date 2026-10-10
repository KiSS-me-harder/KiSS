<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
          :ui="collapsed ? undefined : {
            base: 'py-4 mt-2'
          }"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :ui="collapsed ? undefined : {
            linkLeadingIcon: 'size-7'
          }"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const route = useRoute()

const { data: degrees } = await useAsyncData(() => queryCollection('degrees').all())

const degreesChildren = computed(() =>
  degrees.value?.map(item => ({
    label: item.title,
    to: `/${item.stem}`,
    onSelect: () => {
      open.value = false
    }
  }))
)

const links = computed(() => [[{
  label: 'Today',
  icon: 'i-lucide-calendar-days',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Degrees',
  icon: 'i-lucide-graduation-cap',
  to: '/degrees',
  active: route.path.startsWith('/degrees'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: degreesChildren.value
}, {
  label: 'Classes',
  icon: 'i-lucide-book-text',
  to: '/classes',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Clubs',
  icon: 'i-lucide-club',
  to: '/clubs',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Library',
  icon: 'i-lucide-library',
  to: '/library',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Detention',
  icon: 'i-lucide-angry',
  to: '/detention',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Teachers',
  icon: 'i-lucide-university',
  to: '/teachers',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Students',
  icon: 'i-lucide-user',
  to: '/students',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Flashcards',
  icon: 'i-lucide-playing-cards-fan',
  to: '/flashcards',
  onSelect: () => {
    open.value = false
  }
}]] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}])
</script>
