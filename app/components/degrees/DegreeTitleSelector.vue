<script setup lang="ts">
/**
 * Displays the target title selector for a degree program.
 * Allows the user to choose which title/level to target.
 */
import type { DegreeLevel } from '~/utils/degreePageHelpers'

defineProps<{
  degreeLevels: DegreeLevel[]
  selectedLevelIndex: number
  isTitleCompleted: (index: number) => boolean
  levelNameColors: string[]
  levelBadgeColors: string[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedLevelIndex', index: number): void
}>()
</script>

<template>
  <UCard v-if="degreeLevels.length">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-target" class="size-4 text-purple-400" />
        <h2 class="text-base font-semibold">
          Target Title
        </h2>
      </div>
    </template>

    <p class="text-xs text-muted mb-3">
      Choose your target title for this degree. Each title represents a milestone with specific class requirements.
    </p>

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
              <UIcon
                v-else-if="index > 0 && !isTitleCompleted(index - 1) && !isTitleCompleted(index)"
                name="i-lucide-lock"
                class="size-3.5 text-muted/60 shrink-0"
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
  </UCard>
</template>
