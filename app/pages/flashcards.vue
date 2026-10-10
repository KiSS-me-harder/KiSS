<script setup lang="ts">
interface Flashcard {
  id: number
  question: string
  options: string[]
  correctIndex: number
}

interface CardStats {
  correct: number
  incorrect: number
  lastReviewed: number
}

const flashcards: Flashcard[] = [
  {
    id: 1,
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctIndex: 2
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctIndex: 1
  },
  {
    id: 3,
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctIndex: 3
  },
  {
    id: 4,
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctIndex: 1
  },
  {
    id: 5,
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctIndex: 2
  }
]

// Track performance for each card
const cardStats = ref<Record<number, CardStats>>({})

// Initialize stats for all cards
flashcards.forEach(card => {
  if (!cardStats.value[card.id]) {
    cardStats.value[card.id] = { correct: 0, incorrect: 0, lastReviewed: 0 }
  }
})

// Current card state
const currentCard = ref<Flashcard>(flashcards[0])
const selectedOption = ref<number | null>(null)
const answered = ref(false)
const showSplash = ref(false)
const splashMessage = ref('Good girl!')

const splashWords = computed(() => splashMessage.value.split(' '))

function letterIndex(wordIndex: number, letterIndex: number) {
  let globalIndex = 0
  for (let w = 0; w < wordIndex; w++) {
    globalIndex += splashWords.value[w].length
  }
  return globalIndex + letterIndex
}

// Pick the next card based on weakest knowledge
function pickNextCard() {
  const now = Date.now()
  let weakestCard = flashcards[0]
  let weakestScore = -Infinity

  for (const card of flashcards) {
    const stats = cardStats.value[card.id]
    // Score: higher is stronger. Unreviewed cards start at 0.
    // Correct answers increase strength, incorrect decrease it.
    // Recently reviewed cards get a time-based boost so we cycle through others first.
    const timeSinceReview = stats ? (now - stats.lastReviewed) / 1000 : 0
    const score = stats ? (stats.correct - stats.incorrect * 2) + timeSinceReview : 0
    if (score > weakestScore) {
      weakestScore = score
      weakestCard = card
    }
  }

  currentCard.value = weakestCard
  selectedOption.value = null
  answered.value = false
}

function selectOption(index: number) {
  if (answered.value) return
  selectedOption.value = index
  answered.value = true

  const isCorrect = index === currentCard.value.correctIndex
  const stats = cardStats.value[currentCard.value.id]

  if (isCorrect) {
    stats.correct++
    showSplash.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 1000)
  }
  else {
    stats.incorrect++
  }
  stats.lastReviewed = Date.now()

  // Auto-advance after a short delay
  setTimeout(pickNextCard, 1200)
}

function getOptionVariant(index: number) {
  if (!answered.value) return 'solid'
  if (index === currentCard.value.correctIndex) return 'success'
  return 'ghost'
}

function getOptionClass(index: number) {
  if (!answered.value) return ''
  if (index === currentCard.value.correctIndex) return 'ring-2 ring-success-500'
  if (index === selectedOption.value && index !== currentCard.value.correctIndex) return 'ring-2 ring-error-500'
  return 'opacity-20'
}
</script>

<template>
  <UDashboardPanel id="flashcards">
    <template #header>
      <UDashboardNavbar title="Flashcards">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-center py-16 px-4">
        <div class="w-full max-w-lg">
          <!-- Playing Card -->
          <div class="rounded-2xl shadow-2xl border-2 border-border/60 bg-card flex flex-col relative overflow-hidden min-h-[400px]">
            <!-- Card content -->
            <div class="flex flex-col items-center justify-center flex-1 px-16 pt-16 pb-16">
              <!-- Question -->
              <p class="text-xs text-muted-foreground mb-5 uppercase tracking-widest font-medium">Question</p>
              <h2 class="text-xl font-bold text-foreground leading-relaxed text-center mb-10">{{ currentCard.question }}</h2>

              <!-- Divider -->
              <div class="w-16 h-px bg-border/50 mb-10" />

              <!-- Options inside the card -->
              <div class="grid grid-cols-1 gap-5 w-full">
                <UButton
                  v-for="(option, index) in currentCard.options"
                  :key="index"
                  :variant="getOptionVariant(index)"
                  :class="getOptionClass(index)"
                  size="md"
                  block
                  :disabled="answered"
                  @click="selectOption(index)"
                >
                  {{ option }}
                </UButton>
              </div>

              <!-- Feedback inside the card -->
              <div
                v-if="answered"
                class="mt-5 p-3 rounded-lg text-center text-sm font-medium w-full"
                :class="selectedOption === currentCard.correctIndex
                  ? 'bg-success-100 text-success-700 dark:bg-success-400/10 dark:text-success-400'
                  : 'bg-error-100 text-error-700 dark:bg-error-400/10 dark:text-error-400'"
              >
                <span v-if="selectedOption === currentCard.correctIndex">
                  <UIcon name="i-lucide-check-circle" class="inline-block mr-1" /> Correct!
                </span>
                <span v-else>
                  <UIcon name="i-lucide-x-circle" class="inline-block mr-1" /> Incorrect — the answer is {{ currentCard.options[currentCard.correctIndex] }}
                </span>
              </div>
            </div>
          </div>
        </div>
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
                :style="{ '--i': letterIndex(wi, li) }"
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

