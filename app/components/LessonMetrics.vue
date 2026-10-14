<script setup lang="ts">
/**
 * Metrics component showing metric milestones that must be achieved to complete the lesson.
 */
defineProps<{
  metrics: string[]
  isMilestoneAchieved: (ref: string) => boolean
  getMetricsCompletedCount: number
}>()

/**
 * Returns a human-readable name from a milestone reference.
 */
function milestoneName(ref: string): string {
  const parts = ref.split('/')
  if (parts.length !== 2) return ref
  const [metricSlug, milestoneId] = parts
  const metricName = metricSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const milestoneLabel = milestoneId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return `${milestoneLabel} (${metricName})`
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">
        Metrics
      </h3>
      <span class="text-sm text-muted">
        {{ getMetricsCompletedCount }}/{{ metrics.length }} achieved
      </span>
    </div>

    <p class="text-sm text-muted">
      Achieve these metric milestones to mark them as complete.
    </p>

    <div class="space-y-2">
      <div
        v-for="(metric, index) in metrics"
        :key="index"
        class="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5"
        :class="{ 'opacity-50': isMilestoneAchieved(metric) }"
      >
        <UIcon
          :name="isMilestoneAchieved(metric) ? 'i-lucide-trophy' : 'i-lucide-target'"
          :class="isMilestoneAchieved(metric) ? 'w-5 h-5 text-amber-400' : 'w-5 h-5 text-purple-400'"
          class="shrink-0"
        />
        <span class="text-sm text-white">
          {{ milestoneName(metric) }}
        </span>
        <UBadge
          v-if="isMilestoneAchieved(metric)"
          label="Achieved"
          color="success"
          variant="subtle"
          size="xs"
        />
      </div>
    </div>
  </div>
</template>
