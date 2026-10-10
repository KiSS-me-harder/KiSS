<script setup lang="ts">
const totalTasks = 7
const completedTasks = 4
const progressPercent = computed(() => {
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
})
</script>

<template>
  <div class="space-y-6">
    <UCard :ui="{ root: 'overflow-hidden' }">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-muted">
          Today's Progress
        </span>
        <span class="text-sm font-semibold text-highlighted">
          {{ progressPercent }}%
        </span>
      </div>
      <UProgress :model-value="progressPercent" :max="100" color="primary" />
      <p class="text-xs text-muted mt-2">
        {{ completedTasks }} of {{ totalTasks }} tasks completed
      </p>
    </UCard>
  </div>
</template>
