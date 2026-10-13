<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbs" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-white">
            Tools
          </h1>
          <p class="text-white/60 mt-1">
            A collection of utility tools for focus and relaxation.
          </p>
        </div>

        <!-- Tools Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.to"
            :to="tool.to"
            class="block rounded-xl border border-white/10 bg-white/5 px-6 py-5 transition-all duration-200 hover:bg-white/10 hover:border-white/20"
          >
            <div class="flex items-center gap-4">
              <UIcon :name="tool.icon" class="w-8 h-8 text-purple-400" />
              <div>
                <h2 class="text-lg font-semibold text-white">
                  {{ tool.label }}
                </h2>
                <p class="text-sm text-white/50 mt-0.5">
                  {{ tool.description }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const breadcrumbs = [{ label: 'Tools', to: '/tools' }]

const tools = [
  {
    label: 'Binaural Beats Creator',
    description: 'Create and customize binaural beat audio tracks for focus and relaxation.',
    icon: 'i-lucide-headphones',
    to: '/tools/binaural-beats'
  },
  {
    label: 'Spiral Visuals Creator',
    description: 'Create and customize hypnotic spiral visual effects for focus and relaxation.',
    icon: 'i-lucide-eye',
    to: '/tools/spiral-visuals'
  },
  {
    label: 'Video Censor',
    description: 'Censor videos by blurring content in real-time, all processed locally in your browser.',
    icon: 'i-lucide-eye-off',
    to: '/tools/video-censor'
  }
]

useHead({
  title: 'Tools — KiSS'
})
</script>
