<script setup lang="ts">
/**
 * Exam component showing activity references that must be completed within 24 hours.
 */
defineProps<{
  exam: string[]
  isExamActivityDone: (activitySlug: string) => boolean
  getExamCompletedCount: number
}>()

/**
 * Returns a human-readable name from an activity slug.
 */
function activityName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">
        Exam
      </h3>
      <span class="text-sm text-muted">
        {{ getExamCompletedCount }}/{{ exam.length }} done
      </span>
    </div>

    <p class="text-sm text-muted">
      Complete these activities within the last 24 hours to mark them as done.
    </p>

    <div class="space-y-2">
      <div
        v-for="(activity, index) in exam"
        :key="index"
        class="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5"
        :class="{ 'opacity-50': isExamActivityDone(activity) }"
      >
        <UIcon
          :name="isExamActivityDone(activity) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
          :class="isExamActivityDone(activity) ? 'w-5 h-5 text-emerald-400' : 'w-5 h-5 text-white/40'"
          class="shrink-0"
        />
        <NuxtLink
          :to="`/activities/${activity}`"
          class="text-sm text-primary hover:underline"
        >
          {{ activityName(activity) }}
        </NuxtLink>
        <UBadge
          v-if="isExamActivityDone(activity)"
          label="Done"
          color="success"
          variant="subtle"
          size="xs"
        />
      </div>
    </div>
  </div>
</template>
