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
      <div v-if="levelGroups.length" class="space-y-8">
        <!-- Level Group Sections -->
        <div v-for="group in levelGroups" :key="group.level" class="space-y-4">
          <!-- Group Header -->
          <button type="button" class="flex items-center gap-3 w-full group/header text-left" @click="toggleGroup(group.level)">
            <div class="flex items-center gap-2.5">
              <span
                class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg"
                :class="group.badgeColor"
              >
                {{ group.badge }}
              </span>
              <div>
                <h2 class="text-base font-bold text-white tracking-tight">
                  {{ group.label }}
                </h2>
                <p class="text-[11px] text-muted">
                  {{ group.entries.length }} class{{ group.entries.length !== 1 ? 'es' : '' }} available
                </p>
              </div>
            </div>
            <div class="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <UIcon
              :name="collapsedGroups.has(group.level) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
              class="w-4 h-4 text-white/40 transition-transform duration-200 group-hover/header:text-white/70"
            />
          </button>

          <!-- Class Cards Grid -->
          <div v-show="!collapsedGroups.has(group.level)" class="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div
              v-for="item in group.entries"
              :key="item.path"
              class="group/card relative aspect-square rounded-xl overflow-visible"
            >
              <NuxtLink
                :to="item.path"
                data-testid="course-card"
                class="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-white/20 hover:-translate-y-1 block"
              >
                <!-- Background Image -->
                <img
                  :src="item.image"
                  :alt="item.courseTitle"
                  class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110"
                  :class="isEligible(item) ? '' : 'blur-md group-hover/card:blur-none'"
                >

                <!-- Dark Overlay for text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

                <!-- Lock Badge for unmet prerequisites -->
                <NuxtLink
                  v-if="!isEligible(item)"
                  :to="`/courses/${getUnmetDependency(item)?.course || ''}`"
                  data-lock-badge="true"
                  class="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center gap-0.5 shadow-lg hover:bg-black/80 transition-colors duration-200"
                >
                  <UIcon name="i-lucide-lock" class="w-3 h-3 text-white/80" />
                  <span class="text-white/90 text-[10px] font-bold leading-none">
                    {{ getAbbrLabel(getUnmetDependency(item)!) }}
                  </span>
                </NuxtLink>

                <!-- Shimmer effect on hover -->
                <div class="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />

                <!-- Content Area -->
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <!-- Class Title -->
                  <p class="text-white text-base font-bold leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                    {{ item.courseTitle }}
                  </p>

                  <!-- Level Title -->
                  <p class="text-white/90 text-sm mt-1 line-clamp-1 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {{ item.title }}
                  </p>

                  <!-- Total levels in this class -->
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-white/70 text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{{ item.totalLevels }} levels total</span>
                  </div>

                  <!-- Hover indicator line -->
                  <div class="mt-1.5 h-0.5 w-0 group-hover/card:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
                </div>
              </NuxtLink>

              <!-- Hover Tooltip -->
              <div
                v-if="item.description"
                class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 z-50 opacity-0 group-hover/card:opacity-100 pointer-events-none group-hover/card:pointer-events-none transition-opacity duration-200"
              >
                <div class="rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-sm p-3 shadow-xl">
                  <p class="text-white text-xs font-semibold mb-1">
                    {{ item.courseTitle }}
                  </p>
                  <p class="text-white/70 text-xs leading-relaxed line-clamp-4">
                    {{ item.description }}
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
import { useCoursesIndex } from '~/composables/useCoursesIndex'

const { levelGroups, isEligible, getUnmetDependency, getAbbrLabel, breadcrumbs } = useCoursesIndex()
const collapsedGroups = ref(new Set<number>())

function toggleGroup(level: number) {
  if (collapsedGroups.value.has(level)) {
    collapsedGroups.value.delete(level)
  } else {
    collapsedGroups.value.add(level)
  }
}
</script>
