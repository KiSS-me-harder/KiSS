<script setup lang="ts">
/**
 * Displays the milestone levels timeline for a metric.
 */
import type { MetricMilestone } from '~/types/enrollment'

defineProps<{
  milestones: MetricMilestone[]
  isMilestoneAchieved: (milestone: MetricMilestone) => boolean
  getFieldValue: (fieldId: string) => number
  getFieldLabel: (fieldId: string) => string
  getFieldUnit: (fieldId: string) => string
}>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">
        Milestone Levels
      </h2>
      <span class="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
        Auto-unlocked by your values
      </span>
    </div>
    <p class="text-sm text-white/50 mb-5">
      Milestones unlock automatically when your reported values meet the requirements.
    </p>

    <div class="relative">
      <div class="absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/10" />

      <div class="space-y-3">
        <div
          v-for="(milestone, index) in milestones"
          :key="milestone.id"
          class="group relative rounded-xl border overflow-hidden transition-all duration-200"
          :class="isMilestoneAchieved(milestone)
            ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
            : 'bg-white/5 border-white/10'"
        >
          <div class="flex items-center gap-4 p-4">
            <div class="relative flex items-center justify-center shrink-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 z-10"
                :class="isMilestoneAchieved(milestone)
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white/10 text-white/40'"
              >
                <UIcon v-if="isMilestoneAchieved(milestone)" name="i-lucide-check" class="w-5 h-5" />
                <template v-else>
                  {{ index + 1 }}
                </template>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold transition-colors" :class="isMilestoneAchieved(milestone) ? 'text-white' : 'text-white/70'">
                {{ milestone.title }}
              </h3>
              <p class="text-sm text-white/50 mt-0.5">
                {{ milestone.description }}
              </p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="(value, fieldId) in milestone.requires"
                  :key="fieldId"
                  class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  :class="getFieldValue(fieldId) >= value
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/40'"
                >
                  <UIcon name="i-lucide-check" class="w-3 h-3" />
                  {{ getFieldLabel(fieldId) }}: {{ value }}{{ getFieldUnit(fieldId) }}
                  <span class="opacity-60">(current: {{ getFieldValue(fieldId) }}{{ getFieldUnit(fieldId) }})</span>
                </span>
              </div>
            </div>

            <div class="shrink-0">
              <span
                v-if="isMilestoneAchieved(milestone)"
                class="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full"
              >Achieved</span>
              <span
                v-else
                class="text-xs font-medium text-white/30 bg-white/5 px-2.5 py-1 rounded-full"
              >Not yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
