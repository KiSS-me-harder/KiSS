<template>
  <div class="group/level relative aspect-square rounded-xl overflow-visible">
    <NuxtLink
      v-if="isEligible"
      :to="levelUrl"
      class="relative aspect-square rounded-xl overflow-hidden border shadow-lg shadow-black/20 transition-all duration-300 block"
      :class="enrolled
        ? 'border-white/10 group-hover/level:border-emerald-500/40 group-hover/level:shadow-xl group-hover/level:shadow-emerald-500/10 group-hover/level:-translate-y-1'
        : 'border-white/10 group-hover/level:border-white/20 group-hover/level:shadow-xl group-hover/level:shadow-purple-500/10 group-hover/level:-translate-y-1'"
    >
      <img :src="classImage" :alt="title" class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/level:scale-110">
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div class="absolute inset-0 opacity-0 group-hover/level:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10" />
      <div class="absolute top-2 right-2 z-10 flex items-center gap-1">
        <span class="px-2 py-0.5 rounded-md backdrop-blur-sm text-white text-[9px] font-bold" :class="isCompleted ? 'bg-emerald-500/80' : 'bg-white/20'">
          Lvl {{ level }}
        </span>
        <span v-if="isCompleted" class="w-5 h-5 rounded-full bg-emerald-500/80 backdrop-blur-sm flex items-center justify-center">
          <UIcon name="i-lucide-check" class="w-3 h-3 text-white" />
        </span>
      </div>
      <div v-if="dependencies.length" class="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <span
          v-for="(dep, idx) in dependencies"
          :key="idx"
          class="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
          :title="`${formatCourseSlug(dep.course)} Level ${dep.level}`"
        >
          <UIcon name="i-lucide-lock" class="w-3 h-3" />
          <span>L{{ dep.level }}</span>
        </span>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-3">
        <p class="text-white text-xs font-bold leading-tight tracking-tight drop-shadow-md line-clamp-2">{{ title }}</p>
        <div v-if="dependencies.length" class="mt-1 flex items-center gap-1">
          <UIcon name="i-lucide-link" class="w-3 h-3 text-amber-400/60" />
          <span class="text-[9px] text-amber-400/60">{{ dependencies.length }} prerequisite{{ dependencies.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="mt-1.5 h-0.5 w-0 group-hover/level:w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
      </div>
    </NuxtLink>

    <!-- Locked Level Card -->
    <div v-else class="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20 cursor-not-allowed">
      <img :src="classImage" :alt="title" class="absolute inset-0 w-full h-full object-cover blur-md">
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div class="absolute inset-0 flex items-center justify-center z-20">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <UIcon name="i-lucide-lock" class="w-5 h-5 text-amber-400" />
          </div>
          <span class="text-[9px] text-white/60 font-medium uppercase tracking-wider">Locked</span>
        </div>
      </div>
      <div class="absolute top-2 right-2 z-10 flex items-center gap-1">
        <span class="px-2 py-0.5 rounded-md backdrop-blur-sm text-white text-[9px] font-bold" :class="isCompleted ? 'bg-emerald-500/80' : 'bg-white/20'">
          Lvl {{ level }}
        </span>
      </div>
      <div v-if="dependencies.length" class="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <span
          v-for="(dep, idx) in dependencies"
          :key="idx"
          class="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
          :title="`${formatCourseSlug(dep.course)} Level ${dep.level}`"
        >
          <UIcon name="i-lucide-lock" class="w-3 h-3" />
          <span>L{{ dep.level }}</span>
        </span>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-3">
        <p class="text-white/40 text-xs font-bold leading-tight tracking-tight drop-shadow-md line-clamp-2">
          {{ title }}
        </p>
      </div>
    </div>

    <!-- Hover Tooltip -->
    <div v-if="description" class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 z-50 opacity-0 group-hover/level:opacity-100 pointer-events-none group-hover/level:pointer-events-none transition-opacity duration-200">
      <div class="rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-sm p-3 shadow-xl">
        <p class="text-white text-xs font-semibold mb-1">
          Lvl {{ level }}: {{ title }}
        </p>
        <p class="text-white/70 text-xs leading-relaxed line-clamp-4">
          {{ description }}
        </p>
      </div>
      <div class="w-3 h-3 bg-gray-900/95 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  level: number
  title: string
  description: string
  dependencies: { course: string, level: number }[]
  classImage: string
  levelUrl: string
  enrolled: boolean
  isEligible: boolean
  isCompleted: boolean
}>()

/**
 * Formats a course slug for display (e.g. "bimbo-behavior" → "Bimbo Behavior").
 * @param slug - The course slug.
 * @returns Formatted display name.
 */
function formatCourseSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>
