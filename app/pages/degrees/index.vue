<script setup lang="ts">
const cards = ref([
  {
    title: 'Anal Slut',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/anal-slut',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Cock Gobbler',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/cock-gobbler',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Sissy',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/sissy',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Hypnosub',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/hypnosub',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Cum Eater',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/cum-eater',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Voyeur',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/voyeur',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Chaste',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/chaste',
    image: {
      path: '/img/placeholder.webp',
      width: '356',
      height: '256'
    },
    orientation: 'horizontal' as const
  }, {
    title: 'Pet',
    description: 'Become a certified master of being an obedient little bitch.',
    to: '/degrees/pet',
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
      <UDashboardNavbar title="Degrees">
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
