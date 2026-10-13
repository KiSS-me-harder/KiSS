<script setup lang="ts">
import { useFlashcards } from '~/composables/useFlashcards'

useHead({ title: 'Flashcards' })
useSeoMeta({
  title: 'Flashcards',
  description: 'Study with flashcards at KiSS Academy.',
  ogTitle: 'Flashcards',
  ogDescription: 'Study with flashcards at KiSS Academy.',
  ogType: 'website'
})

const {
  allDeckCards, knowledgeBreakdown, statsSummary,
  selectedOption, answered, showSplash, showKnowledgePanel,
  currentCard, selectOption,
  getOptionVariant, getOptionClass, currentCardRep, courseKnowledgeBreakdown
} = await useFlashcards()

const splashWords = ['NICE', 'GREAT', 'PERFECT', 'EXCELLENT']
const letterIndexAnim = (wi: number, li: number) => wi * 5 + li
</script>

<template>
  <UDashboardPanel id="flashcards">
    <template #header>
      <UDashboardNavbar title="Flashcards">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <UButton
            variant="ghost"
            size="xs"
            color="neutral"
            @click="showKnowledgePanel = !showKnowledgePanel"
          >
            <UIcon name="i-lucide-brain" class="size-4 mr-1" />
            Knowledge
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 py-8">
        <!-- Main Flashcard Area -->
        <div :class="showKnowledgePanel ? 'lg:col-span-8' : 'lg:col-span-12'" class="flex items-start justify-center">
          <div class="w-full max-w-lg">
            <!-- Empty state -->
            <div v-if="allDeckCards.length === 0" class="rounded-2xl shadow-2xl border-2 border-border/60 bg-card p-12 text-center">
              <UIcon name="i-lucide-book-open" class="size-16 text-muted/40 mx-auto mb-4" />
              <h2 class="text-lg font-bold text-foreground mb-2">
                No Flashcards Available
              </h2>
              <p class="text-sm text-muted mb-6">
                Enroll in classes to build your flashcard deck.
              </p>
              <UButton to="/courses" color="primary">
                <UIcon name="i-lucide-compass" class="size-4 mr-1" />
                Browse Classes
              </UButton>
            </div>

            <!-- Playing Card -->
            <FlashcardsFlashcardPlayingCard
              v-else
              :current-card="currentCard"
              :current-card-rep="currentCardRep"
              :selected-option="selectedOption"
              :answered="answered"
              :stats-summary="statsSummary"
              :get-option-variant="getOptionVariant"
              :get-option-class="getOptionClass"
              :select-option="selectOption"
            />
          </div>
        </div>

        <!-- Knowledge Panel (Sidebar) -->
        <FlashcardsFlashcardKnowledgePanel
          v-if="showKnowledgePanel"
          :stats-summary="statsSummary"
          :course-knowledge-breakdown="courseKnowledgeBreakdown"
          :knowledge-breakdown="knowledgeBreakdown"
          :current-card-rep="currentCardRep"
        />
      </div>

      <!-- Splash overlay -->
      <Transition name="splash-fade">
        <div
          v-if="showSplash"
          class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40"
        >
          <div class="splash-text">
            <span
              v-for="(word, wi) in splashWords"
              :key="wi"
              class="splash-word"
            >
              <span
                v-for="(letter, li) in word"
                :key="li"
                class="splash-letter"
                :style="{ '--i': letterIndexAnim(wi, li) }"
              >{{ letter }}</span>
            </span>
          </div>
        </div>
      </Transition>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.15s ease;
}
.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

.splash-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 90vw;
  font-size: 6rem;
  font-weight: 900;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--ui-primary);
  text-shadow:
    0 0 10px color-mix(in srgb, var(--ui-primary) 80%, transparent),
    0 0 40px color-mix(in srgb, var(--ui-primary) 50%, transparent),
    0 0 80px color-mix(in srgb, var(--ui-primary) 30%, transparent),
    4px 4px 0 color-mix(in srgb, var(--ui-primary) 60%, black);
  letter-spacing: 0.05em;
  text-align: center;
  white-space: normal;
  line-height: 1.2;
}

.splash-word {
  display: inline-flex;
}
.splash-word + .splash-word {
  margin-left: 0.3em;
}
.splash-letter {
  display: inline-block;
  opacity: 0;
  transform: scale(0) rotate(-15deg);
  animation: letter-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--i) * 60ms);
}

@keyframes letter-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-15deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.3) rotate(3deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
</style>
