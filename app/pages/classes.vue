<script setup lang="ts">
const cards = ref([
  {
    title: 'Anal',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Oral',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Feminization',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Hypnosis',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/hypno.avif',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Cum Eating',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Publicity',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Chastity',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Pet',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/docs/getting-started/integrations/color-mode',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }
])
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Classes">
        <template #leading>
          <UDashboardSidebarCollapse />
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
          <NuxtImg v-if="card.image" :src="card.image.path" :width="card.image.width" :height="card.image.height" />
        </UPageCard>
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>
