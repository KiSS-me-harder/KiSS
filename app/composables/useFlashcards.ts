/**
 * Composable for flashcards page logic.
 * Handles flashcard deck building, spaced repetition, and study stats.
 */
import { useEnrollmentStore } from '~/stores/enrollment'
import { buildFlashcardDeck, computeCourseKnowledgeBreakdown } from '~/utils/flashcardHelpers'
import type { Flashcard } from '~/utils/flashcardHelpers'

export async function useFlashcards() {
  const store = useEnrollmentStore()

  const { data: allCourses } = await useAsyncData('flashcards-courses', () => queryCollection('courses').all())

  const allDeckCards = computed(() => buildFlashcardDeck(allCourses.value || [], store))
  const knowledgeBreakdown = computed(() => store.getKnowledgeBreakdown())

  const statsSummary = computed(() => {
    const totalCards = allDeckCards.value.length
    const reviewedCards = new Set(store.cardSpacedRep.map((e: { cardId: number }) => String(e.cardId))).size
    const masteredCards = store.cardSpacedRep.filter((e: { consecutiveSuccesses: number }) => e.consecutiveSuccesses >= 3).length
    const dueCount = store.getDueCards(allDeckCards.value).length
    return { totalCards, reviewedCards, masteredCards, dueCount }
  })

  const selectedOption = ref<number | null>(null)
  const answered = ref(false)
  const showSplash = ref(false)
  const showKnowledgePanel = ref(true)
  const currentCard = ref<Flashcard | null>(null)

  function pickNextCard() {
    const dueCards = store.getDueCards(allDeckCards.value)
    if (dueCards.length === 0 && allDeckCards.value.length > 0) {
      const randomIndex = Math.floor(Math.random() * allDeckCards.value.length)
      currentCard.value = allDeckCards.value[randomIndex] || null
    } else if (dueCards.length > 0) {
      currentCard.value = allDeckCards.value.find(c => c.id === dueCards[0]!.cardId) || null
    }
    selectedOption.value = null
    answered.value = false
  }

  function pickRandomCard() {
    if (allDeckCards.value.length > 0) {
      const randomIndex = Math.floor(Math.random() * allDeckCards.value.length)
      currentCard.value = allDeckCards.value[randomIndex] || null
    }
    selectedOption.value = null
    answered.value = false
  }

  watch(allDeckCards, (cards) => {
    if (cards.length > 0 && currentCard.value === null) pickNextCard()
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
    store.recordCardAnswerWithSpacedRep(card.id, card.courseName, card.degree, card.level, isCorrect)
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

  const currentCardRep = computed(() => {
    if (!currentCard.value) return null
    return store.cardSpacedRep.find((e: { cardId: number }) => e.cardId === currentCard.value!.id) || null
  })

  const courseKnowledgeBreakdown = computed(() => computeCourseKnowledgeBreakdown(allDeckCards.value, store))

  return {
    allDeckCards, knowledgeBreakdown, statsSummary,
    selectedOption, answered, showSplash, showKnowledgePanel,
    currentCard, pickNextCard, pickRandomCard, selectOption,
    getOptionVariant, getOptionClass, currentCardRep, courseKnowledgeBreakdown
  }
}
