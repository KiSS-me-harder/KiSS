<script setup lang="ts">
/**
 * Displays a single flashcard with question, options, and feedback.
 */
interface Flashcard {
  id: number
  question: string
  options: string[]
  correctIndex: number
  courseName: string
  level: number
}

interface CardRep {
  consecutiveSuccesses: number
  totalCorrect: number
  totalIncorrect: number
  intervalDays: number
}

const props = defineProps<{
  currentCard: Flashcard | null
  currentCardRep: CardRep | null
  selectedOption: number | null
  answered: boolean
  statsSummary: { dueCount: number, totalCards: number }
  getOptionVariant: (index: number) => string
  getOptionClass: (index: number) => string
  selectOption: (index: number) => void
}>()

function getOptionVariantTyped(index: number) {
  return props.getOptionVariant(index) as 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
}
</script>

<template>
  <div class="rounded-2xl shadow-2xl border-2 border-border/60 bg-card flex flex-col relative overflow-hidden min-h-[400px]">
    <div v-if="currentCard" class="px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs text-purple-300 font-medium">{{ currentCard.courseName }}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">Level {{ currentCard.level }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="currentCardRep" class="text-[10px] text-muted">
          <template v-if="currentCardRep.consecutiveSuccesses >= 3">
            <UIcon name="i-lucide-flame" class="inline-block size-3 text-amber-400 mr-0.5" />
            {{ currentCardRep.consecutiveSuccesses }} streak
          </template>
          <template v-else-if="currentCardRep.consecutiveSuccesses > 0">
            <UIcon name="i-lucide-trending-up" class="inline-block size-3 text-emerald-400 mr-0.5" />
            {{ currentCardRep.consecutiveSuccesses }} streak
          </template>
          <template v-else-if="currentCardRep.totalCorrect + currentCardRep.totalIncorrect > 0">
            <UIcon name="i-lucide-refresh-cw" class="inline-block size-3 text-muted mr-0.5" />
            Reviewing
          </template>
        </span>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center flex-1 px-16 pt-16 pb-16">
      <div class="flex items-center gap-3 mb-5">
        <p class="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Question
        </p>
        <span v-if="currentCard && statsSummary.totalCards > 0" class="text-[10px] text-muted-foreground/60">
          {{ statsSummary.dueCount }} due · {{ statsSummary.totalCards }} total
        </span>
      </div>
      <h2 class="text-xl font-bold text-foreground leading-relaxed text-center mb-10">
        {{ currentCard?.question }}
      </h2>

      <div class="w-16 h-px bg-border/50 mb-10" />

      <div v-if="currentCard" class="grid grid-cols-1 gap-5 w-full">
        <UButton
          v-for="(option, index) in currentCard.options"
          :key="index"
          :variant="getOptionVariantTyped(index)"
          :class="getOptionClass(index)"
          size="md"
          block
          :disabled="answered"
          role="option"
          @click="selectOption(index)"
        >
          {{ option }}
        </UButton>
      </div>

      <div
        v-if="answered && currentCard"
        class="mt-5 p-3 rounded-lg text-center text-sm font-medium w-full"
        :class="selectedOption === currentCard.correctIndex
          ? 'bg-success-100 text-success-700 dark:bg-success-400/10 dark:text-success-400'
          : 'bg-error-100 text-error-700 dark:bg-error-400/10 dark:text-error-400'"
      >
        <span v-if="selectedOption === currentCard.correctIndex">
          <UIcon name="i-lucide-check-circle" class="inline-block mr-1" /> Correct!
          <span v-if="currentCardRep" class="text-[11px] opacity-70 block mt-0.5">
            Next review in {{ currentCardRep.intervalDays }} day{{ currentCardRep.intervalDays !== 1 ? 's' : '' }}
          </span>
        </span>
        <span v-else>
          <UIcon name="i-lucide-x-circle" class="inline-block mr-1" /> Incorrect — the answer is {{ currentCard.options[currentCard.correctIndex] }}
          <span class="text-[11px] opacity-70 block mt-0.5">Card returned to deck for immediate review</span>
        </span>
      </div>
    </div>
  </div>
</template>
