<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default', header: 'p-0' }"
    >
      <template #header="{ collapsed }">
        <div class="m-auto">
          <NuxtLink to="/">
            <AppLogo :collapsed="collapsed" :class="collapsed ? 'p-1' : 'my-3'" />
          </NuxtLink>
        </div>
      </template>

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

    <UDashboardSearch :groups="(groups as unknown as any)" :color-mode="false" />

    <slot role="main" />

    <MediaPlayerWidget />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
const open = ref(false)
const { links, groups } = await useNavigationMenu(open)

// Default character avatar props for the layout
useEnrollmentLogic()
</script>
