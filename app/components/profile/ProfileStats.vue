<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-white">
        Progress
      </h2>
    </template>

    <div class="grid grid-cols-3 gap-4">
      <div class="text-center p-4 rounded-lg bg-white/5">
        <p class="text-2xl font-bold text-purple-400">
          {{ classesCompleted }}
        </p>
        <p class="text-xs text-white/40 mt-1">
          Classes Completed
        </p>
      </div>
      <div class="text-center p-4 rounded-lg bg-white/5">
        <p class="text-2xl font-bold text-pink-400">
          {{ flashcardsAnswered }}
        </p>
        <p class="text-xs text-white/40 mt-1">
          Flashcards Answered
        </p>
      </div>
      <div class="text-center p-4 rounded-lg bg-white/5">
        <p class="text-2xl font-bold text-amber-400">
          {{ detentionCount }}
        </p>
        <p class="text-xs text-white/40 mt-1">
          Detentions
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  classesCompleted: number
  flashcardsAnswered: number
  detentionCount: number
}>()
</script>
