<script setup lang="ts">
const route = useRoute()
const id = route.params.id
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar :title="id">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <h1>{{id}}</h1>
      <NuxtImg :src="`/img/degrees/${id}.webp`" />
    </template>
  </UDashboardPanel>
</template>
