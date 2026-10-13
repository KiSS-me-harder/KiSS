<template>
  <UCard v-if="currentCardRep">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="size-4 text-blue-400" />
        <h2 class="text-base font-semibold">
          Card Details
        </h2>
      </div>
    </template>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-muted">Correct answers</span>
        <span class="text-emerald-400 font-medium">{{ currentCardRep.totalCorrect }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Incorrect answers</span>
        <span class="text-red-400 font-medium">{{ currentCardRep.totalIncorrect }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Streak</span>
        <span class="text-amber-400 font-medium">{{ currentCardRep.consecutiveSuccesses }} 🔥</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Next review</span>
        <span class="text-white font-medium">
          <template v-if="currentCardRep.intervalDays === 0">Now</template>
          <template v-else>In {{ currentCardRep.intervalDays }} day{{ currentCardRep.intervalDays !== 1 ? 's' : '' }}</template>
        </span>
      </div>
      <div v-if="currentCardRep.lastFailed" class="flex justify-between">
        <span class="text-muted">Last failed</span>
        <span class="text-white font-medium">{{ new Date(currentCardRep.lastFailed).toLocaleDateString() }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  currentCardRep: { totalCorrect: number, totalIncorrect: number, consecutiveSuccesses: number, intervalDays: number, lastFailed: number | null } | null
}>()
</script>
