<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'

useHead({
  title: 'Flashcards'
})

useSeoMeta({
  title: 'Flashcards',
  description: 'Study with flashcards at KiSS Academy. Test your knowledge and reinforce what you have learned in your classes.',
  ogTitle: 'Flashcards',
  ogDescription: 'Study with flashcards at KiSS Academy. Test your knowledge and reinforce what you have learned in your classes.',
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': 'https://kiss-academy.github.io/KiSS/flashcards/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/flashcards/',
            'name': 'Flashcards',
            'description': 'Study with flashcards at KiSS Academy. Test your knowledge and reinforce what you have learned in your classes.',
            'inLanguage': 'en',
            'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
          },
          {
            '@type': 'WebSite',
            '@id': 'https://kiss-academy.github.io/KiSS/#website',
            'url': 'https://kiss-academy.github.io/KiSS/',
            'name': 'KiSS Academy',
            'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
            'inLanguage': 'en'
          }
        ]
      })
    }
  ]
})

interface Flashcard {
  id: number
  question: string
  options: string[]
  correctIndex: number
  className: string
  classSlug: string
  degree: string
  level: number
}

const store = useEnrollmentStore()

// Fetch all class data and extract flashcards from enrolled classes only
const { data: allClasses } = await useAsyncData('flashcards-classes', () => {
  return queryCollection('classes').all()
})

// Build the full deck of flashcards from enrolled classes
const allDeckCards = computed<Flashcard[]>(() => {
  if (!allClasses.value) return []

  const cards: Flashcard[] = []
  let id = 0

  // Only include flashcards from enrolled classes
  for (const item of allClasses.value) {
    const itemAny = item as any
    const flashcardsData = itemAny.flashcards
    if (!flashcardsData || !Array.isArray(flashcardsData) || flashcardsData.length === 0) continue

    // Extract degree and class slug from stem: "classes/degree/class-slug/level"
    const stemParts = itemAny.stem?.split('/') || []
    if (stemParts.length < 3) continue
    const degree = stemParts[1] || ''
    const classSlug = `${degree}/${stemParts[2]}`
    const className = itemAny.class || ''
    const level = parseInt(itemAny.level, 10)

    // Skip if not enrolled in this class
    if (!store.isEnrolled(classSlug)) continue

    for (const fc of flashcardsData) {
      cards.push({
        id: id++,
        question: fc.question,
        options: fc.options,
        correctIndex: fc.correctIndex,
        className,
        classSlug,
        degree,
        level
      })
    }
  }

  return cards
})

// Knowledge breakdown by degree
const knowledgeBreakdown = computed(() => {
  return store.getKnowledgeBreakdown()
})

// Stats summary
const statsSummary = computed(() => {
  const totalCards = allDeckCards.value.length
  const reviewedCards = new Set(store.cardSpacedRep.map(e => e.cardId)).size
  const masteredCards = store.cardSpacedRep.filter(e => e.consecutiveSuccesses >= 3).length
  const dueCount = store.getDueCards(allDeckCards.value).length
  return { totalCards, reviewedCards, masteredCards, dueCount }
})

// Current card being shown
const currentCardId = ref<number | null>(null)
const selectedOption = ref<number | null>(null)
const answered = ref(false)
const showSplash = ref(false)
const splashMessage = ref('Good girl!')
const showKnowledgePanel = ref(true)

const splashWords = computed(() => splashMessage.value.split(' '))

function letterIndexAnim(wordIndex: number, letterIndex: number) {
  let globalIndex = 0
  for (let w = 0; w < wordIndex; w++) {
    globalIndex += splashWords.value[w]!.length
  }
  return globalIndex + letterIndex
}

// Get the current card from the deck
const currentCard = computed<Flashcard | null>(() => {
  if (currentCardId.value === null) return null
  return allDeckCards.value.find(c => c.id === currentCardId.value) || null
})

// Pick the next due card, prioritizing weakest degree areas
function pickNextCard() {
  const dueCards = store.getDueCards(allDeckCards.value)

  if (dueCards.length === 0) {
    // No due cards - pick a random card from the deck for review
    if (allDeckCards.value.length > 0) {
      const randomIndex = Math.floor(Math.random() * allDeckCards.value.length)
      currentCardId.value = allDeckCards.value[randomIndex]!.id
    }
  }
  else {
    // Pick the top priority card (weakest degree area)
    currentCardId.value = dueCards[0]!.cardId
  }

  selectedOption.value = null
  answered.value = false
}

// Pick a random card from the deck (used after wrong answers)
function pickRandomCard() {
  if (allDeckCards.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * allDeckCards.value.length)
    currentCardId.value = allDeckCards.value[randomIndex]!.id
  }
  selectedOption.value = null
  answered.value = false
}

// Initialize: pick first card
watch(allDeckCards, (cards) => {
  if (cards.length > 0 && currentCardId.value === null) {
    pickNextCard()
  }
}, { immediate: true })

function selectOption(index: number) {
  if (answered.value) return
  const card = currentCard.value
  if (!card) return

  selectedOption.value = index
  answered.value = true

  const isCorrect = index === card.correctIndex

  if (isCorrect) {
    showSplash.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 1000)
  }

  // Record answer with spaced repetition tracking
  store.recordCardAnswerWithSpacedRep(card.id, card.className, card.degree, card.level, isCorrect)

  // Auto-advance after a short delay
  // Wrong answer: jump to a random card from the deck
  // Correct answer: continue with smart prioritization (weakest area first)
  setTimeout(() => {
    if (isCorrect) pickNextCard()
    else pickRandomCard()
  }, 1200)
}

function getOptionVariant(index: number) {
  if (!answered.value) return 'solid'
  const card = currentCard.value
  if (!card) return 'solid'
  if (index === card.correctIndex) return 'outline'
  return 'ghost'
}

function getOptionClass(index: number) {
  if (!answered.value) return ''
  const card = currentCard.value
  if (!card) return ''
  if (index === card.correctIndex) return 'ring-2 ring-success-500'
  if (index === selectedOption.value && index !== card.correctIndex) return 'ring-2 ring-error-500'
  return 'opacity-20'
}

// Get spaced rep stats for the current card
const currentCardRep = computed(() => {
  if (!currentCard.value) return null
  return store.cardSpacedRep.find(e => e.cardId === currentCard.value!.id) || null
})

// Knowledge breakdown by class — sorted from worst to best
// Only includes classes that have cards in the current deck
const classKnowledgeBreakdown = computed(() => {
  // Build a map of class slugs that have cards in the deck
  const classSlugsInDeck = new Map<string, { className: string; classSlug: string; degree: string; cardCount: number }>()
  for (const card of allDeckCards.value) {
    const key = card.classSlug
    const existing = classSlugsInDeck.get(key)
    if (existing) {
      existing.cardCount++
    } else {
      classSlugsInDeck.set(key, { className: card.className, classSlug: card.classSlug, degree: card.degree, cardCount: 1 })
    }
  }

  // Aggregate spaced rep data by class name
  const classData: Record<string, { correct: number; incorrect: number }> = {}
  for (const entry of store.cardSpacedRep) {
    if (!classData[entry.className]) {
      classData[entry.className] = { correct: 0, incorrect: 0 }
    }
    classData[entry.className]!.correct += entry.totalCorrect
    classData[entry.className]!.incorrect += entry.totalIncorrect
  }

  // Build result: only classes that have cards in the deck
  const result: Array<{ className: string; classSlug: string; degree: string; score: number; cardsReviewed: number; cardCount: number; totalIncorrect: number }> = []
  for (const [, info] of classSlugsInDeck) {
    const data = classData[info.className] || { correct: 0, incorrect: 0 }
    const total = data.correct + data.incorrect
    const score = total > 0 ? Math.round((data.correct / total) * 100) : 0
    result.push({
      className: info.className,
      classSlug: info.classSlug,
      degree: info.degree,
      score,
      cardsReviewed: total,
      cardCount: info.cardCount,
      totalIncorrect: data.incorrect
    })
  }

  // Sort: worst first (lowest score, then most failures, then never reviewed)
  result.sort((a, b) => {
    // Never reviewed classes go to the end
    if (a.cardsReviewed === 0 && b.cardsReviewed === 0) return 0
    if (a.cardsReviewed === 0) return 1
    if (b.cardsReviewed === 0) return -1
    // Lower score first (weaker knowledge)
    if (a.score !== b.score) return a.score - b.score
    // More failures first
    return b.totalIncorrect - a.totalIncorrect
  })

  return result
})
</script>

<template>
  <UDashboardPanel id="flashcards">
    <template #header>
      <UDashboardNavbar title="Flashcards">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <!-- Knowledge Panel Toggle -->
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
              <h2 class="text-lg font-bold text-foreground mb-2">No Flashcards Available</h2>
              <p class="text-sm text-muted mb-6">Enroll in classes to build your flashcard deck. Cards are pulled from all your enrolled classes.</p>
              <UButton to="/classes" color="primary">
                <UIcon name="i-lucide-compass" class="size-4 mr-1" />
                Browse Classes
              </UButton>
            </div>

            <!-- Playing Card -->
            <div v-else class="rounded-2xl shadow-2xl border-2 border-border/60 bg-card flex flex-col relative overflow-hidden min-h-[400px]">
              <!-- Card header with class info -->
              <div v-if="currentCard" class="px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-purple-300 font-medium">{{ currentCard.className }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">Level {{ currentCard.level }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <!-- Card mastery indicator -->
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

              <!-- Card content -->
              <div class="flex flex-col items-center justify-center flex-1 px-16 pt-16 pb-16">
                <!-- Question with stats -->
                <div class="flex items-center gap-3 mb-5">
                  <p class="text-xs text-muted-foreground uppercase tracking-widest font-medium">Question</p>
                  <span v-if="currentCard && statsSummary.totalCards > 0" class="text-[10px] text-muted-foreground/60">
                    {{ statsSummary.dueCount }} due · {{ statsSummary.totalCards }} total
                  </span>
                </div>
                <h2 class="text-xl font-bold text-foreground leading-relaxed text-center mb-10">
                  {{ currentCard?.question }}
                </h2>

                <!-- Divider -->
                <div class="w-16 h-px bg-border/50 mb-10" />

                <!-- Options inside the card -->
                <div v-if="currentCard" class="grid grid-cols-1 gap-5 w-full">
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
          </div>
        </div>

        <!-- Knowledge Panel (Sidebar) -->
        <div v-if="showKnowledgePanel" class="lg:col-span-4 space-y-4">
          <!-- Stats Summary -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-bar-chart-3" class="size-4 text-purple-400" />
                <h2 class="text-base font-semibold">Study Stats</h2>
              </div>
            </template>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <p class="text-[10px] text-muted uppercase tracking-wider">Total Cards</p>
                <p class="text-2xl font-bold text-white">{{ statsSummary.totalCards }}</p>
              </div>
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <p class="text-[10px] text-muted uppercase tracking-wider">Due Now</p>
                <p class="text-2xl font-bold text-amber-400">{{ statsSummary.dueCount }}</p>
              </div>
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <p class="text-[10px] text-muted uppercase tracking-wider">Reviewed</p>
                <p class="text-2xl font-bold text-emerald-400">{{ statsSummary.reviewedCards }}</p>
              </div>
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <p class="text-[10px] text-muted uppercase tracking-wider">Mastered</p>
                <p class="text-2xl font-bold text-amber-400">{{ statsSummary.masteredCards }}</p>
              </div>
            </div>
          </UCard>

          <!-- Class Knowledge Tracker -->
          <UCard v-if="classKnowledgeBreakdown.length > 0">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-open" class="size-4 text-emerald-400" />
                <h2 class="text-base font-semibold">Class Focus</h2>
              </div>
            </template>
            <p class="text-[11px] text-muted mb-3">
              Classes in your deck, sorted from areas needing the most attention. Revisit these classes to strengthen your knowledge.
            </p>
            <div class="space-y-2">
              <div
                v-for="ck in classKnowledgeBreakdown"
                :key="ck.className"
                class="p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div class="flex items-center justify-between mb-1">
                  <NuxtLink
                    :to="`/classes/${ck.classSlug}`"
                    class="text-sm font-medium text-white hover:text-primary transition-colors capitalize"
                  >
                    {{ ck.className }}
                  </NuxtLink>
                  <span class="text-xs font-bold" :class="ck.cardsReviewed === 0 ? 'text-muted' : ck.score >= 70 ? 'text-emerald-400' : ck.score >= 40 ? 'text-amber-400' : 'text-red-400'">
                    <template v-if="ck.cardsReviewed === 0">New</template>
                    <template v-else>{{ ck.score }}%</template>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <UProgress
                    :model-value="ck.score"
                    :color="ck.cardsReviewed === 0 ? 'neutral' : ck.score >= 70 ? 'success' : ck.score >= 40 ? 'warning' : 'error'"
                    :size="'xs'"
                    :animated="false"
                    class="flex-1"
                  />
                  <span class="text-[10px] text-muted whitespace-nowrap">{{ ck.cardCount }} card{{ ck.cardCount !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Knowledge by Degree -->
          <UCard v-if="knowledgeBreakdown.length > 0">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-brain" class="size-4 text-amber-400" />
                <h2 class="text-base font-semibold">Knowledge by Degree</h2>
              </div>
            </template>
            <p class="text-[11px] text-muted mb-3">
              Your weakest areas are shown first. Flashcards prioritize these degrees.
            </p>
            <div class="space-y-3">
              <div
                v-for="kb in knowledgeBreakdown"
                :key="kb.degree"
                class="space-y-1.5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-white capitalize">{{ kb.degree }}</span>
                    <span class="text-[10px] text-muted">{{ kb.cardsReviewed }} cards</span>
                  </div>
                  <span class="text-sm font-bold" :class="kb.score >= 70 ? 'text-emerald-400' : kb.score >= 40 ? 'text-amber-400' : 'text-red-400'">
                    {{ kb.score }}%
                  </span>
                </div>
                <UProgress
                  :model-value="kb.score"
                  :color="kb.score >= 70 ? 'success' : kb.score >= 40 ? 'warning' : 'error'"
                  :size="'xs'"
                  :animated="false"
                />
              </div>
            </div>
          </UCard>

          <!-- Current Card Details -->
          <UCard v-if="currentCardRep">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="size-4 text-blue-400" />
                <h2 class="text-base font-semibold">Card Details</h2>
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

