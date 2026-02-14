<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const { data: degrees } = await useAsyncData(() => queryCollection('degrees').all())

const children = {
  degrees:
      degrees.value?.map(item => ({
        label: item.title,
        to: `/${item.stem}`,
        onSelect: () => {
          open.value = false
        }
      }))
}

const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Degrees',
  icon: 'i-lucide-graduation-cap',
  to: '/degrees',
  defaultOpen: true,
  exact: true,
  type: 'trigger',
  onSelect: () => {
    open.value = false
  },
  children: children.degrees
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
  label: 'Inbox',
  icon: 'i-lucide-inbox',
  to: '/inbox',
  badge: '0',
  onSelect: () => {
    open.value = false
  }
}], [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}])
</script>

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
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
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
