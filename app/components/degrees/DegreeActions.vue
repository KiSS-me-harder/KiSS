<script setup lang="ts">
/**
 * Shows the enrollment action buttons and final grade section for a degree page.
 */
const props = defineProps<{
  isDegreeFullyEnrolled: boolean
  isDegreePartiallyEnrolled: boolean
  selectedLevelName: string | undefined
  overallProgress: number
}>()

const emit = defineEmits<{
  (e: 'enroll' | 'unenroll'): void
}>()

const gradeLabel = computed(() => {
  const p = props.overallProgress
  if (p === 0) return { label: 'F', color: 'text-red-400' }
  if (p >= 90) return { label: 'A+', color: 'text-emerald-400' }
  if (p >= 80) return { label: 'A', color: 'text-green-400' }
  if (p >= 70) return { label: 'B', color: 'text-blue-400' }
  if (p >= 60) return { label: 'C', color: 'text-yellow-400' }
  return { label: 'F', color: 'text-red-400' }
})
</script>

<template>
  <div class="pt-1 space-y-2">
    <UButton
      v-if="!isDegreeFullyEnrolled"
      size="md"
      color="primary"
      class="w-full sm:w-auto"
      @click="emit('enroll')"
    >
      <template #leading>
        <UIcon name="i-lucide-plus" class="size-4" />
      </template>
      {{ isDegreePartiallyEnrolled ? 'Complete Enrollment for' : 'Enroll in' }} {{ selectedLevelName || 'this title' }}
    </UButton>
    <UButton
      v-if="isDegreePartiallyEnrolled"
      variant="outline"
      color="error"
      size="md"
      class="w-full sm:w-auto"
      @click="emit('unenroll')"
    >
      <template #leading>
        <UIcon name="i-lucide-minus" class="size-4" />
      </template>
      Unenroll from all classes
    </UButton>
    <p v-if="isDegreePartiallyEnrolled && !isDegreeFullyEnrolled" class="text-[11px] text-muted">
      You're partially enrolled. Click above to enroll in the remaining classes.
    </p>
  </div>

  <UCard class="mt-4">
    <div>
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-semibold">Final Grade</span>
        <span class="text-xs text-muted">
          {{ overallProgress }}%
          <span :class="gradeLabel.color" class="font-bold">{{ gradeLabel.label }}</span>
        </span>
      </div>
      <UProgress
        :model-value="overallProgress"
        :animated="false"
        color="success"
        size="sm"
        class="mb-2"
      />
      <p class="text-xs text-muted text-center">
        Complete all classes at your target level to earn your grade
      </p>
    </div>
  </UCard>
</template>
