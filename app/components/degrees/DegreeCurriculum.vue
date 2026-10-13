<script setup lang="ts">
/**
 * Displays the curriculum course cards for a selected degree title,
 * showing progress and enrollment status for each course.
 */
import type { DegreeCourseInfo, DegreeLevel } from '~/utils/degreePageHelpers'

defineProps<{
  selectedLevel: DegreeLevel | null
  courseInfos: DegreeCourseInfo[]
  getTierColor: (maxLevel: number) => string
  getTierLabel: (maxLevel: number) => string
  overallProgress: number
}>()
</script>

<template>
  <UCard v-if="selectedLevel && courseInfos.length">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="size-4 text-blue-400" />
          <h2 class="text-base font-semibold">
            {{ selectedLevel.name }} Curriculum
          </h2>
        </div>
        <UBadge variant="subtle" size="xs" color="neutral">
          {{ courseInfos.length }} courses
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-for="courseInfo in courseInfos"
        :key="courseInfo.slug"
        class="relative rounded-lg overflow-hidden border border-white/10 group"
      >
        <NuxtLink
          :to="`/courses/${courseInfo.slug}`"
          class="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
        >
          <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <img :src="courseInfo.image" :alt="courseInfo.courseTitle" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
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
            <div class="flex items-center gap-2 text-[10px] text-muted">
              <span class="px-1.5 py-0.5 rounded font-bold" :class="getTierColor(courseInfo.maxLevel)">
                {{ getTierLabel(courseInfo.maxLevel) }}
              </span>
              <span>·</span>
              <span>{{ courseInfo.totalLevels }} levels</span>
            </div>
            <div v-if="courseInfo.isEnrolled" class="mt-2">
              <div class="flex items-center justify-between text-[10px] text-muted mb-0.5">
                <span>Progress</span>
                <span>{{ courseInfo.completedLevels }}/{{ courseInfo.totalLevels }}</span>
              </div>
              <UProgress
                :model-value="courseInfo.totalLevels > 0 ? (courseInfo.completedLevels / courseInfo.totalLevels) * 100 : 0"
                :animated="false"
                color="success"
                size="xs"
              />
            </div>
          </div>
          <div class="shrink-0">
            <UIcon
              v-if="courseInfo.isEnrolled"
              name="i-lucide-check-circle-2"
              class="size-5 text-emerald-400"
            />
            <UIcon
              v-else
              name="i-lucide-circle"
              class="size-5 text-muted/40"
            />
          </div>
        </NuxtLink>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-white/10">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-muted">Overall progress</span>
        <span class="text-xs text-muted">
          {{ overallProgress }}%
          <span v-if="overallProgress === 0" class="text-red-400 font-bold">F</span>
          <span v-else-if="overallProgress >= 90" class="text-emerald-400 font-bold">A+</span>
          <span v-else-if="overallProgress >= 80" class="text-green-400 font-bold">A</span>
          <span v-else-if="overallProgress >= 70" class="text-blue-400 font-bold">B</span>
          <span v-else-if="overallProgress >= 60" class="text-yellow-400 font-bold">C</span>
        </span>
      </div>
      <UProgress
        :model-value="overallProgress"
        :animated="false"
        color="success"
        size="sm"
      />
    </div>
  </UCard>
</template>
