<script setup lang="ts">
import { useDegreePage } from '~/composables/useDegreePage'
import DegreeHeroImage from '~/components/degrees/DegreeHeroImage.vue'
import DegreeTitleSelector from '~/components/degrees/DegreeTitleSelector.vue'
import DegreeCurriculum from '~/components/degrees/DegreeCurriculum.vue'
import DegreeActions from '~/components/degrees/DegreeActions.vue'

const route = useRoute()
const { app } = useRuntimeConfig()
const id = computed(() => route.params.id as string)

const {
  home, title, description, body, items,
  degreeLevels, selectedLevelIndex, selectedLevel,
  courseInfos, isDegreeFullyEnrolled, isDegreePartiallyEnrolled,
  overallProgress, handleEnrollInDegree, handleCompleteEnrollment, handleUnenrollFromDegree,
  isTitleCompleted,
  levelNameColors, levelBadgeColors
} = useDegreePage(id)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="home" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <!-- Left: Hero Image -->
          <div class="lg:col-span-2">
            <DegreeHeroImage
              :image-url="`${app.baseURL}img/degrees/${id}.webp`"
              :title="title"
            />
          </div>

          <!-- Right: Content -->
          <div class="lg:col-span-3 space-y-4">
            <div>
              <h1 class="text-xl font-semibold text-white mb-2">
                {{ title }}
              </h1>
              <p class="text-sm text-muted leading-relaxed">
                {{ description }}
              </p>
            </div>

            <div v-if="body" class="text-sm text-muted/80 leading-relaxed">
              <ContentRenderer :value="home" />
            </div>

            <DegreeTitleSelector
              :degree-levels="degreeLevels"
              :selected-level-index="selectedLevelIndex"
              :is-title-completed="isTitleCompleted"
              :level-name-colors="levelNameColors"
              :level-badge-colors="levelBadgeColors"
              :is-degree-fully-enrolled="isDegreeFullyEnrolled"
              :is-degree-partially-enrolled="isDegreePartiallyEnrolled"
              :selected-level-name="selectedLevel?.name"
              @update:selected-level-index="selectedLevelIndex = $event"
              @enroll="handleEnrollInDegree"
              @complete-enrollment="handleCompleteEnrollment"
            />

            <DegreeCurriculum
              :selected-level="selectedLevel"
              :course-infos="courseInfos"
              :overall-progress="overallProgress"
            />

            <DegreeActions
              :is-degree-partially-enrolled="isDegreePartiallyEnrolled"
              :selected-level-name="selectedLevel?.name"
              :overall-progress="overallProgress"
              @unenroll="handleUnenrollFromDegree"
            />
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
