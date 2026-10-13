<template>
  <div class="fixed inset-0 flex bg-gray-950">
    <LessonSidebar
      :degree="degree"
      :slug="slug"
      :level-param="levelParam"
      :class-slug="courseSlug"
      :sorted-levels-data="sortedLevelsData"
      :is-level-completed="isLevelCompleted"
      :is-level-unlocked-by-level="isLevelUnlockedByLevel"
      :level-badge-color="levelBadgeColor"
      :is-enrolled="isEnrolled"
      :handle-enroll="handleEnroll"
    />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Mobile header -->
      <header class="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40">
        <NuxtLink :to="`/courses/${slug}`" class="text-xs text-primary hover:underline">
          ← Back
        </NuxtLink>
        <span class="text-sm font-medium text-white truncate">{{ lessonData?.title }}</span>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto p-6 lg:p-10 space-y-8">
          <!-- Lesson header -->
          <div v-if="lessonData" class="space-y-4">
            <div class="flex items-center gap-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold text-white"
                :class="levelBadgeColor"
              >
                Level {{ lessonData.level }}
              </span>
              <span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                {{ lessonData.degreeLabel }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-white">
              {{ lessonData.title }}
            </h1>
          </div>

          <!-- Loading state -->
          <div v-if="!lessonData" class="flex items-center justify-center py-20">
            <div class="text-center">
              <UIcon name="i-lucide-loader" class="size-8 animate-spin text-purple-400 mx-auto mb-3" />
              <p class="text-sm text-white/60">
                Entering classroom...
              </p>
            </div>
          </div>

          <!-- Lesson body -->
          <div v-if="body" class="prose prose-invert chalk-text">
            <ContentRenderer :value="currentLevelItem as Record<string, unknown>" />
          </div>

          <!-- Flashcards -->
          <LessonFlashcards
            v-if="lessonData?.flashcards?.length"
            :flashcards="lessonData.flashcards"
            :flashcard-answered="flashcardAnswered"
            :flashcards-correct="flashcardsCorrect"
            :answer-flashcard="answerFlashcard"
            :get-flashcard-option-class="getFlashcardOptionClass"
          />

          <!-- Exam tasks -->
          <LessonExam
            v-if="lessonData?.exam?.length"
            :exam="lessonData.exam"
            :get-exam-task-type="getExamTaskType"
            :get-exam-task-text="getExamTaskText"
            :get-exam-task-metric="getExamTaskMetric"
            :is-exam-task-done="isExamTaskDone"
            :toggle-exam-task-done="toggleExamTaskDone"
            :get-exam-completed-count="getExamCompletedCount"
            :get-milestone-current-value="getMilestoneCurrentValue"
            :is-milestone-achieved="isMilestoneAchieved"
          />

          <!-- Level completion -->
          <div v-if="lessonData" class="flex items-center justify-between pt-6 border-t border-white/10">
            <NuxtLink
              v-if="lessonData.previousLevel"
              :to="lessonData.previousLevel.path"
              class="text-sm text-primary hover:underline"
            >
              ← Previous level
            </NuxtLink>
            <div v-else />
            <div class="flex items-center gap-3">
              <UButton
                v-if="isEnrolled"
                variant="outline"
                size="sm"
                @click="resetCurrentLevel"
              >
                Reset
              </UButton>
              <UButton
                v-if="isEnrolled"
                variant="solid"
                size="sm"
                @click="completeCurrentLevel"
              >
                Complete level
              </UButton>
              <NuxtLink
                v-if="lessonData.nextLevel"
                :to="lessonData.nextLevel.path"
              >
                <UButton variant="solid" size="sm">Next level →</UButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const lessonPage = await useLessonPage()
const degree = lessonPage.degree
const slug = lessonPage.slug
const levelParam = lessonPage.levelParam
const courseSlug = lessonPage.classSlug
const sortedLevelsData = lessonPage.sortedLevelsData
const currentLevelItem = lessonPage.currentLevelItem
const body = lessonPage.body
const isLevelUnlockedByLevel = lessonPage.isLevelUnlockedByLevel
const lessonData = lessonPage.lessonData
const levelBadgeColor = lessonPage.levelBadgeColor
const isEnrolled = lessonPage.isEnrolled
const isLevelCompleted = lessonPage.isLevelCompleted
const completeCurrentLevel = lessonPage.completeCurrentLevel
const resetCurrentLevel = lessonPage.resetCurrentLevel
const handleEnroll = lessonPage.handleEnroll
const flashcardAnswered = lessonPage.flashcardAnswered
const flashcardsCorrect = lessonPage.flashcardsCorrect
const answerFlashcard = lessonPage.answerFlashcard
const getFlashcardOptionClass = lessonPage.getFlashcardOptionClass
const getExamTaskType = lessonPage.getExamTaskType
const getExamTaskText = lessonPage.getExamTaskText
const getExamTaskMetric = lessonPage.getExamTaskMetric
const isExamTaskDone = lessonPage.isExamTaskDone
const toggleExamTaskDone = lessonPage.toggleExamTaskDone
const getExamCompletedCount = lessonPage.getExamCompletedCount
const getMilestoneCurrentValue = lessonPage.getMilestoneCurrentValue
const isMilestoneAchieved = lessonPage.isMilestoneAchieved
</script>

<style scoped>
.chalk-text { text-shadow: 0 0 1px rgba(255, 255, 255, 0.1); }
.chalk-text :deep(h1), .chalk-text :deep(h2), .chalk-text :deep(h3) { color: rgba(255, 255, 255, 0.95); }
.chalk-text :deep(p) { color: rgba(255, 255, 255, 0.8); }
.chalk-text :deep(strong) { color: rgba(255, 255, 255, 0.95); }
.chalk-text :deep(ul), .chalk-text :deep(ol) { color: rgba(255, 255, 255, 0.8); }
</style>
