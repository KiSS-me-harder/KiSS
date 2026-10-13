<script setup lang="ts">
/**
 * Displays the target title selector for a degree program.
 * Allows the user to choose which title/level to target.
 * Includes an enrollment confirmation button below the title options.
 */
import type { DegreeLevel } from '~/utils/degreePageHelpers'

const props = defineProps<{
  degreeLevels: DegreeLevel[]
  selectedLevelIndex: number
  isTitleCompleted: (index: number) => boolean
  levelNameColors: string[]
  levelBadgeColors: string[]
  isDegreeFullyEnrolled?: boolean
  isDegreePartiallyEnrolled?: boolean
  selectedLevelName?: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedLevelIndex', index: number): void
  (e: 'enroll' | 'complete-enrollment'): void
}>()
</script>

<template>
  <UCard v-if="degreeLevels.length">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-target" class="size-4 text-purple-400" />
        <h2 class="text-base font-semibold">
          Title
        </h2>
      </div>
    </template>
    <div class="space-y-2">
      <button
        v-for="(level, index) in degreeLevels"
        :key="level.name"
        type="button"
        class="w-full text-left p-3 rounded-lg border transition-all duration-200"
        :class="selectedLevelIndex === index
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'"
        @click="emit('update:selectedLevelIndex', index)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            :class="[levelBadgeColors[index]]"
          >
            {{ level.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold" :class="levelNameColors[index]">
                {{ level.name }}
              </span>
              <span class="text-[10px] text-muted">
                {{ level.courses.length }} class{{ level.courses.length !== 1 ? 'es' : '' }}
              </span>
              <UIcon
                v-if="isTitleCompleted(index)"
                name="i-lucide-trophy"
                class="size-3.5 text-amber-400 shrink-0"
              />
            </div>
            <p class="text-[11px] text-muted mt-0.5 line-clamp-1">
              {{ level.description }}
            </p>
          </div>
          <UIcon
            v-if="selectedLevelIndex === index"
            name="i-lucide-check-circle"
            class="size-4 text-purple-400 shrink-0"
          />
        </div>
      </button>
    </div>

    <!-- Enrollment button below title selector -->
    <div v-if="!props.isDegreeFullyEnrolled" class="mt-4 pt-4 border-t border-white/10">
      <UButton
        size="md"
        color="primary"
        class="w-full"
        @click="props.isDegreePartiallyEnrolled ? emit('complete-enrollment') : emit('enroll')"
      >
        <template #leading>
          <UIcon name="i-lucide-plus" class="size-4" />
        </template>
        {{ props.isDegreePartiallyEnrolled ? 'Complete Enrollment' : `Enroll in ${props.selectedLevelName ?? 'this Degree'}` }}
      </UButton>
      <p v-if="props.isDegreePartiallyEnrolled" class="text-xs text-muted mt-1 text-center">
        You're partially enrolled
      </p>
    </div>
  </UCard>
</template>
