<script setup lang="ts">
/**
 * Shows the target goal details for a selected degree title,
 * listing all required classes with their status.
 */
import type { DegreeCourseInfo, DegreeLevel } from '~/utils/degreePageHelpers'

defineProps<{
  selectedLevel: DegreeLevel | null
  courseInfos: DegreeCourseInfo[]
  getTierColor: (maxLevel: number) => string
  getTierLabel: (maxLevel: number) => string
}>()
</script>

<template>
  <UCard v-if="selectedLevel">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-flag" class="size-4 text-amber-400" />
        <h2 class="text-base font-semibold">
          {{ selectedLevel.name }} — Target Goal
        </h2>
      </div>
    </template>

    <p class="text-xs text-muted mb-3">
      To earn the <strong class="text-white">{{ selectedLevel.name }}</strong> title, you need to complete all the following classes:
    </p>

    <div class="space-y-2">
      <div
        v-for="courseInfo in courseInfos"
        :key="courseInfo.slug"
        class="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5"
      >
        <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <img :src="courseInfo.image" :alt="courseInfo.courseTitle" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-white truncate">
              {{ courseInfo.courseTitle }}
            </span>
            <span
              v-if="courseInfo.isCrossDegree"
              class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0"
            >
              {{ courseInfo.degreeLabel }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-muted mt-0.5">
            <span class="px-1.5 py-0.5 rounded font-bold" :class="getTierColor(courseInfo.maxLevel)">
              {{ getTierLabel(courseInfo.maxLevel) }}
            </span>
            <span>·</span>
            <span>Levels up to {{ courseInfo.maxLevel }}</span>
          </div>
          <div v-if="courseInfo.prerequisites.length" class="mt-0.5 flex items-center gap-1">
            <UIcon name="i-lucide-link" class="w-3 h-3 text-amber-400/60" />
            <span class="text-[10px] text-amber-400/60">{{ courseInfo.prerequisites.length }} prerequisite{{ courseInfo.prerequisites.length > 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="shrink-0">
          <template v-if="courseInfo.isEnrolled">
            <UIcon
              v-if="courseInfo.completedLevels === courseInfo.totalLevels"
              name="i-lucide-check-circle-2"
              class="size-5 text-emerald-400"
            />
            <UIcon
              v-else
              name="i-lucide-clock"
              class="size-5 text-amber-400"
            />
          </template>
          <UIcon
            v-else
            name="i-lucide-circle"
            class="size-5 text-muted/40"
          />
        </div>
      </div>
    </div>

    <div class="mt-3 pt-3 border-t border-white/10">
      <div class="flex items-center justify-between text-xs text-muted">
        <span>Title progress</span>
        <span>
          <strong class="text-white">{{ courseInfos.filter(c => c.isEnrolled && c.completedLevels === c.totalLevels).length }}</strong>
          /{{ courseInfos.length }} classes completed
        </span>
      </div>
      <UProgress
        :model-value="courseInfos.length > 0 ? (courseInfos.filter(c => c.isEnrolled && c.completedLevels === c.totalLevels).length / courseInfos.length) * 100 : 0"
        :animated="false"
        color="success"
        size="xs"
      />
    </div>
  </UCard>
</template>
