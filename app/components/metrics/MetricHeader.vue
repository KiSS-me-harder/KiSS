<script setup lang="ts">
/**
 * Displays the metric header card with title, description, value, and progress bar.
 */
defineProps<{
  title: string
  description: string
  icon: string
  metricValue: number
  achievedCount: number
  totalMilestones: number
}>()
</script>

<template>
  <div class="relative rounded-2xl overflow-hidden border border-purple-500/30">
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/20" />
    <div class="absolute inset-0 opacity-50" style="background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 60%)" />

    <div class="relative p-6 sm:p-8">
      <div class="flex items-start gap-5">
        <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
          <UIcon :name="icon || 'i-lucide-target'" class="w-7 h-7 text-purple-400" />
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-white">
            {{ title }}
          </h1>
          <p class="text-white/60 mt-1 leading-relaxed">
            {{ description }}
          </p>
          <div class="flex items-center gap-3 mt-3">
            <NuxtLink
              to="/activities"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <UIcon name="i-lucide-dumbbell" class="w-4 h-4" />
              Log activity to update
            </NuxtLink>
          </div>
        </div>
        <div class="text-right shrink-0 self-start">
          <div class="text-4xl font-bold leading-none" :class="metricValue >= 100 ? 'text-emerald-400' : 'text-purple-400'">
            {{ metricValue }}
          </div>
          <div class="text-xs text-white/40 mt-1">
            / 100
          </div>
        </div>
      </div>

      <div class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-white/60">Progress</span>
          <span class="text-sm font-semibold text-purple-400">
            {{ achievedCount }} of {{ totalMilestones }} milestones
          </span>
        </div>
        <div class="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="metricValue >= 100
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'"
            :style="{ width: `${metricValue}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
