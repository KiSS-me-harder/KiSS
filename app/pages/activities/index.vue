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
      <div v-if="categoryGroups.length" class="space-y-8">
        <!-- Category Sections -->
        <div v-for="group in categoryGroups" :key="group.name" class="space-y-4">
          <!-- Group Header -->
          <button type="button" class="flex items-center gap-3 w-full group/header text-left" @click="toggleGroup(group.name)">
            <div class="flex items-center gap-2.5">
              <span
                class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg bg-purple-600"
              >
                <UIcon :name="group.icon" class="w-5 h-5" />
              </span>
              <div>
                <h2 class="text-base font-bold text-white tracking-tight">
                  {{ group.name }}
                </h2>
                <p class="text-[11px] text-muted">
                  {{ group.activities.length }} activit{{ group.activities.length !== 1 ? 'ies' : 'y' }} available
                </p>
              </div>
            </div>
            <div class="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <UIcon
              :name="collapsedGroups.has(group.name) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
              class="w-4 h-4 text-white/40 transition-transform duration-200 group-hover/header:text-white/70"
            />
          </button>

          <!-- Activity Cards Grid -->
          <div v-show="!collapsedGroups.has(group.name)" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="activity in group.activities"
              :key="activity.slug"
              class="group/card relative aspect-square rounded-xl overflow-visible"
            >
              <NuxtLink
                :to="`/activities/${activity.slug}`"
                data-testid="activity-card"
                class="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1 block"
              >
                <!-- Background Image -->
                <img
                  :src="activity.image"
                  :alt="activity.title"
                  class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110"
                  onerror="this.src='/KiSS/img/activities/placeholder.webp'"
                >

                <!-- Dark Overlay for text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

                <!-- Shimmer effect on hover -->
                <div class="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

                <!-- Content Area -->
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <!-- Activity Title -->
                  <p class="text-white text-base font-bold leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                    {{ activity.title }}
                  </p>

                  <!-- Activity Description -->
                  <p v-if="activity.description" class="text-white/70 text-xs mt-1 line-clamp-2 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {{ activity.description }}
                  </p>

                  <!-- Hover indicator line -->
                  <div class="mt-1.5 h-0.5 w-0 group-hover/card:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
                </div>
              </NuxtLink>

              <!-- Hover Tooltip -->
              <div
                v-if="activity.description"
                class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 z-50 opacity-0 group-hover/card:opacity-100 pointer-events-none group-hover/card:pointer-events-none transition-opacity duration-200"
              >
                <div class="rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-sm p-3 shadow-xl">
                  <p class="text-white text-xs font-semibold mb-1">
                    {{ activity.title }}
                  </p>
                  <p class="text-white/70 text-xs leading-relaxed line-clamp-4">
                    {{ activity.description }}
                  </p>
                </div>
                <!-- Tooltip arrow -->
                <div class="w-3 h-3 bg-gray-900/95 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useActivitiesBrowse } from '~/composables/useActivitiesBrowse'

const { categoryGroups, collapsedGroups, toggleGroup, breadcrumbs } = useActivitiesBrowse()
</script>
