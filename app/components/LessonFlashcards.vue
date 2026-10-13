<script setup lang="ts">
defineProps<{
  flashcards: Record<string, unknown>[]
  flashcardAnswered: Record<number, boolean>
  flashcardsCorrect: number
  answerFlashcard: (fcIndex: number, optIndex: number) => void
  getFlashcardOptionClass: (fcIndex: number, optIndex: number) => string
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">
        Flashcards
      </h3>
      <span class="text-sm text-muted">
        {{ flashcardsCorrect }}/{{ flashcards.length }} correct
      </span>
    </div>

    <div class="space-y-4">
      <div
        v-for="(flashcard, fcIndex) in flashcards"
        :key="fcIndex"
        class="p-4 rounded-xl border border-white/10 bg-white/5"
      >
        <p class="text-sm font-medium text-white mb-3">
          {{ flashcard.question }}
        </p>
        <div class="space-y-2">
          <button
            v-for="(option, optIndex) in flashcard.options"
            :key="optIndex"
            class="w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors"
            :class="getFlashcardOptionClass(fcIndex, optIndex)"
            @click="answerFlashcard(fcIndex, optIndex)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
