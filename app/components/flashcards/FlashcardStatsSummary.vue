<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bar-chart-3" class="size-4 text-purple-400" />
        <h2 class="text-base font-semibold">
          Study Stats
        </h2>
      </div>
    </template>
    <div class="grid grid-cols-2 gap-3">
      <div class="p-3 rounded-lg bg-white/5 border border-white/10">
        <p class="text-[10px] text-muted uppercase tracking-wider">
          Total Cards
        </p>
        <p class="text-2xl font-bold text-white">
          {{ statsSummary.totalCards }}
        </p>
      </div>
      <div class="p-3 rounded-lg bg-white/5 border border-white/10">
        <p class="text-[10px] text-muted uppercase tracking-wider">
          Due Now
        </p>
        <p class="text-2xl font-bold text-amber-400">
          {{ statsSummary.dueCount }}
        </p>
      </div>
      <div class="p-3 rounded-lg bg-white/5 border border-white/10">
        <p class="text-[10px] text-muted uppercase tracking-wider">
          Reviewed
        </p>
        <p class="text-2xl font-bold text-emerald-400">
          {{ statsSummary.reviewedCards }}
        </p>
      </div>
      <div class="p-3 rounded-lg bg-white/5 border border-white/10">
        <p class="text-[10px] text-muted uppercase tracking-wider">
          Mastered
        </p>
        <p class="text-2xl font-bold text-amber-400">
          {{ statsSummary.masteredCards }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  statsSummary: { totalCards: number, dueCount: number, reviewedCards: number, masteredCards: number }
}>()
</script>
