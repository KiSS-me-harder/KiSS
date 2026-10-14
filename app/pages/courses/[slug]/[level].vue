<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbItems" />
        </template>
        <template #right>
          <UButton
            variant="ghost"
            color="default"
            size="xs"
            class="xl:hidden"
            @click="sidebarRef?.openSidebar()"
          >
            <template #leading>
              <UIcon name="i-lucide-list" class="size-4" />
            </template>
            Sections
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex gap-8 p-4">
        <!-- Main content area -->
        <div class="flex-1 min-w-0">
          <!-- Loading state -->
          <div v-if="!lessonData" class="flex items-center justify-center">
            <div class="text-center">
              <UIcon name="i-lucide-loader" class="size-8 animate-spin text-purple-400 mx-auto mb-3" />
              <p class="text-sm text-white/60">
                Entering classroom...
              </p>
            </div>
          </div>

          <template v-if="lessonData">
            <!-- Lesson header -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold text-white"
                  :class="levelBadgeColor"
                >
                  Lesson {{ lessonData.level }}
                </span>
              </div>
              <h1 class="text-2xl font-bold text-white">
                {{ lessonData.title }}
              </h1>
            </div>

            <!-- Lesson body with section navigation wrapper -->
            <LessonSectionNav :level-param="levelParam" :body="currentLevelItem?.body">
              <div v-if="body" class="prose prose-invert chalk-text py-8">
                <ContentRenderer :value="currentLevelItem as Record<string, unknown>" />
              </div>
            </LessonSectionNav>

            <!-- Flashcards -->
            <LessonFlashcards
              v-if="lessonData?.flashcards?.length"
              :flashcards="lessonData.flashcards"
              :flashcard-answered="flashcardAnswered"
              :flashcards-correct="flashcardsCorrect"
              :answer-flashcard="answerFlashcard"
              :get-flashcard-option-class="getFlashcardOptionClass"
            />

            <!-- Homework section -->
            <LessonHomework
              v-if="lessonData?.homework?.length"
              :homework="lessonData.homework"
              :is-homework-done="isHomeworkDone"
              :toggle-homework-done="toggleHomeworkDone"
              :homework-completed-count="homeworkCompletedCount"
            />

            <!-- Exam activities -->
            <LessonExam
              v-if="lessonData?.exam?.length"
              :exam="lessonData.exam"
              :is-exam-activity-done="isExamActivityDone"
              :get-exam-completed-count="getExamCompletedCount"
            />

            <!-- Metrics milestones -->
            <LessonMetrics
              v-if="lessonData?.metrics?.length"
              :metrics="lessonData.metrics"
              :is-milestone-achieved="isMilestoneAchieved"
              :get-metrics-completed-count="getMetricsCompletedCount"
            />

            <!-- Level navigation -->
            <div class="flex items-center justify-between pt-6 border-t border-white/10">
              <NuxtLink
                v-if="lessonData.previousLevel"
                :to="lessonData.previousLevel.path"
                class="text-sm text-primary hover:underline"
              >
                ← Previous level
              </NuxtLink>
              <div v-else />
              <NuxtLink
                v-if="canProceedToNext && lessonData.nextLevel"
                :to="lessonData.nextLevel.path"
                class="text-sm text-primary hover:underline"
              >
                Next level →
              </NuxtLink>
            </div>
          </template>
        </div>

        <!-- Right sidebar: Section navigator -->
        <LessonSectionNavSidebar ref="sidebarRef" :level-param="levelParam" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const lessonPage = await useLessonPage()
const _degree = lessonPage.degree
const slug = lessonPage.slug
const levelParam = lessonPage.levelParam
const _courseSlug = lessonPage.classSlug
const _sortedLevelsData = lessonPage.sortedLevelsData
const currentLevelItem = lessonPage.currentLevelItem
const body = lessonPage.body
const _isLevelUnlockedByLevel = lessonPage.isLevelUnlockedByLevel
const lessonData = lessonPage.lessonData
const levelBadgeColor = lessonPage.levelBadgeColor
const _isEnrolled = lessonPage.isEnrolled
const _isLevelCompleted = lessonPage.isLevelCompleted
const _handleEnroll = lessonPage.handleEnroll
const flashcardAnswered = lessonPage.flashcardAnswered
const flashcardsCorrect = lessonPage.flashcardsCorrect
const answerFlashcard = lessonPage.answerFlashcard
const getFlashcardOptionClass = lessonPage.getFlashcardOptionClass
const isHomeworkDone = lessonPage.isHomeworkDone
const toggleHomeworkDone = lessonPage.toggleHomeworkDone
const homeworkCompletedCount = lessonPage.homeworkCompletedCount
const isExamActivityDone = lessonPage.isExamActivityDone
const getExamCompletedCount = lessonPage.getExamCompletedCount
const isMilestoneAchieved = lessonPage.isMilestoneAchieved
const getMetricsCompletedCount = lessonPage.getMetricsCompletedCount
const canProceedToNext = lessonPage.canProceedToNext

const sidebarRef = ref<InstanceType<typeof import('~/components/LessonSectionNavSidebar.vue')>>()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: 'Courses', icon: 'i-lucide-book-text', to: '/courses' },
  { label: lessonData.value?.title || 'Lesson', to: `/courses/${slug.value}` },
  { label: `Level ${lessonData.value?.level}` }
])
</script>

<style scoped>
.chalk-text { text-shadow: 0 0 1px rgba(255, 255, 255, 0.1); }
.chalk-text :deep(h1), .chalk-text :deep(h2), .chalk-text :deep(h3) { color: rgba(255, 255, 255, 0.95); }
.chalk-text :deep(p) { color: rgba(255, 255, 255, 0.8); }
.chalk-text :deep(strong) { color: rgba(255, 255, 255, 0.95); }
.chalk-text :deep(ul), .chalk-text :deep(ol) { color: rgba(255, 255, 255, 0.8); }
</style>
