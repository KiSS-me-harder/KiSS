<template>
  <div class="lg:col-span-4 space-y-4">
    <FlashcardsFlashcardStatsSummary :stats-summary="statsSummary" />
    <!-- Class Knowledge Tracker -->
    <UCard v-if="courseKnowledgeBreakdown.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="size-4 text-emerald-400" />
          <h2 class="text-base font-semibold">
            Class Focus
          </h2>
        </div>
      </template>
      <p class="text-[11px] text-muted mb-3">
        Classes in your deck, sorted from areas needing attention.
      </p>
      <div class="space-y-2">
        <div v-for="ck in courseKnowledgeBreakdown" :key="ck.courseName" class="p-2 rounded-lg bg-white/5 border border-white/10">
          <div class="flex items-center justify-between mb-1">
            <NuxtLink :to="`/courses/${ck.courseSlug}`" class="text-sm font-medium text-white hover:text-primary transition-colors capitalize">{{ ck.courseName }}</NuxtLink>
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
          <h2 class="text-base font-semibold">
            Knowledge by Degree
          </h2>
        </div>
      </template>
      <p class="text-[11px] text-muted mb-3">
        Your weakest areas are shown first.
      </p>
      <div class="space-y-3">
        <div v-for="kb in knowledgeBreakdown" :key="kb.degree" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-white capitalize">{{ kb.degree }}</span>
              <span class="text-[10px] text-muted">{{ kb.cardsReviewed }} cards</span>
            </div>
            <span class="text-sm font-bold" :class="kb.score >= 70 ? 'text-emerald-400' : kb.score >= 40 ? 'text-amber-400' : 'text-red-400'">{{ kb.score }}%</span>
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
    <FlashcardsFlashcardCardDetails :current-card-rep="currentCardRep" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  statsSummary: { totalCards: number, dueCount: number, reviewedCards: number, masteredCards: number }
  courseKnowledgeBreakdown: { courseName: string, courseSlug: string, cardsReviewed: number, score: number, cardCount: number }[]
  knowledgeBreakdown: { degree: string, cardsReviewed: number, score: number }[]
  currentCardRep: { totalCorrect: number, totalIncorrect: number, consecutiveSuccesses: number, intervalDays: number, lastFailed: number | null } | null
}>()
</script>
