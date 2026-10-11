<template>
  <div class="relative min-h-screen">
    <!-- Ambient Background -->
    <div class="fixed inset-0 z-0">
      <img
        :src="lessonData?.image"
        alt=""
        class="w-full h-full object-cover scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      <!-- Subtle animated particles -->
      <div class="absolute inset-0 opacity-20">
        <div class="particle particle-1" />
        <div class="particle particle-2" />
        <div class="particle particle-3" />
        <div class="particle particle-4" />
        <div class="particle particle-5" />
      </div>
    </div>

    <!-- Top Bar -->
    <div class="relative z-20 flex items-center justify-between px-6 py-3 border-b border-white/10 backdrop-blur-md bg-black/40">
      <div class="flex items-center gap-3">
        <NuxtLink to="/classes" class="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <UIcon name="i-lucide-book-text" class="size-4" />
          <span class="text-sm font-medium">Classes</span>
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3 text-white/30" />
        <NuxtLink :to="`/classes/${degree}/${slug}`" class="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <span class="text-sm font-medium">{{ lessonData?.className }}</span>
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3 text-white/30" />
        <span class="text-sm text-white font-medium">Level {{ lessonData?.level }}</span>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2.5 py-1 rounded-md backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider"
          :class="levelBadgeColor"
        >
          Level {{ lessonData?.level }}
        </span>
        <span v-if="isLevelCompleted()" class="px-2.5 py-1 rounded-md bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
          <UIcon name="i-lucide-check" class="inline size-3 mr-0.5" />
          Completed
        </span>
      </div>
    </div>

    <!-- Main Classroom Area -->
    <div v-if="lessonData" class="relative z-10 flex flex-col lg:flex-row gap-0">

      <!-- Blackboard / Lesson Content Area -->
      <div class="flex-1 p-6 lg:p-8">
        <!-- Lesson Title -->
        <div class="mb-6">
          <h1 class="text-2xl lg:text-3xl font-bold text-white leading-tight">
            {{ lessonData.title }}
          </h1>
          <p class="text-white/50 text-sm mt-1">
            {{ lessonData.degreeLabel }} • {{ lessonData.className }}
          </p>
        </div>

        <!-- Blackboard -->
        <div class="relative rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-2xl shadow-black/50">
          <!-- Blackboard frame -->
          <div class="absolute inset-0 bg-gradient-to-b from-amber-950/20 to-transparent pointer-events-none" />
          <!-- Blackboard surface -->
          <div class="relative bg-gradient-to-b from-green-950/90 via-green-900/80 to-green-950/90 backdrop-blur-sm p-6 lg:p-8 min-h-[400px]">
            <!-- Chalk tray decoration -->
            <div class="absolute bottom-0 left-0 right-0 h-3 bg-amber-900/40 flex items-center justify-center gap-4">
              <div class="w-8 h-1.5 rounded-full bg-white/30" />
              <div class="w-6 h-1.5 rounded-full bg-pink-200/30" />
              <div class="w-10 h-1.5 rounded-full bg-yellow-200/30" />
            </div>

            <!-- Lesson Content -->
            <div v-if="lessonData.body" class="prose prose-invert prose-sm lg:prose-base max-w-none chalk-text">
              <ContentRenderer :value="lessonData.contentItem" />
            </div>
            <div v-else class="chalk-text text-white/40 text-center py-12">
              <UIcon name="i-lucide-chalkboard" class="size-12 mx-auto mb-3 opacity-50" />
              <p class="text-lg">No lesson material available for this level yet.</p>
            </div>
          </div>
        </div>

        <!-- Flashcards / Homework Section -->
        <div v-if="lessonData.flashcards && lessonData.flashcards.length > 0" class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-clipboard-list" class="size-5 text-pink-400" />
              <h2 class="text-lg font-semibold text-white">Homework — Knowledge Check</h2>
            </div>
            <span class="text-xs text-white/50">
              {{ flashcardsCorrect }}/{{ lessonData.flashcards.length }} correct
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(flashcard, fcIndex) in lessonData.flashcards"
              :key="fcIndex"
              class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-3 transition-all duration-300"
              :class="{
                'border-emerald-500/30 bg-emerald-500/5': flashcardAnswered[fcIndex] === true,
                'border-red-500/30 bg-red-500/5': flashcardAnswered[fcIndex] === false
              }"
            >
              <div class="flex items-start gap-2">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {{ fcIndex + 1 }}
                </span>
                <p class="text-sm font-medium text-white">
                  {{ flashcard.question }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                <button
                  v-for="(option, optIndex) in flashcard.options"
                  :key="optIndex"
                  type="button"
                  class="text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border"
                  :class="getFlashcardOptionClass(fcIndex, optIndex)"
                  :disabled="flashcardAnswered[fcIndex] !== undefined"
                  @click="answerFlashcard(fcIndex, optIndex)"
                >
                  <span class="inline-block w-5 h-5 rounded-full border border-current text-[10px] text-center leading-5 mr-2 opacity-60">
                    {{ String.fromCharCode(65 + optIndex) }}
                  </span>
                  {{ option }}
                </button>
              </div>

              <div
                v-if="flashcardAnswered[fcIndex] !== undefined"
                class="text-xs p-2.5 rounded-lg pl-8 flex items-center gap-2"
                :class="flashcardAnswered[fcIndex]
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'"
              >
                <UIcon
                  :name="flashcardAnswered[fcIndex] ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                  class="size-4 flex-shrink-0"
                />
                <span v-if="flashcardAnswered[fcIndex]">
                  Correct! Well done.
                </span>
                <span v-else>
                  Incorrect — the answer is <strong>"{{ flashcard.options[flashcard.correctIndex] }}"</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Exam Section -->
        <div v-if="lessonData.exam && lessonData.exam.length > 0" class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="size-5 text-amber-400" />
              <h2 class="text-lg font-semibold text-white">Exam Requirements</h2>
            </div>
            <span class="text-xs text-white/50">
              {{ getExamCompletedCount }}/{{ lessonData.exam.length }} done
            </span>
          </div>

          <div class="space-y-3">
            <template v-for="(task, taskIndex) in lessonData.exam" :key="taskIndex">
              <!-- Checklist task: interactive checkbox -->
              <div
                v-if="getExamTaskType(task) === 'checklist'"
                class="rounded-xl border backdrop-blur-sm p-4 flex items-start gap-3 transition-all duration-200 cursor-pointer"
                :class="isExamTaskDone(taskIndex)
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'"
                @click="toggleExamTaskDone(taskIndex)"
              >
                <div
                  class="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all duration-200"
                  :class="isExamTaskDone(taskIndex)
                    ? 'border-emerald-400 bg-emerald-500/30'
                    : 'border-white/30 bg-transparent'"
                >
                  <UIcon v-if="isExamTaskDone(taskIndex)" name="i-lucide-check" class="size-3 text-emerald-400" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm" :class="isExamTaskDone(taskIndex) ? 'text-emerald-300 line-through opacity-70' : 'text-white/80'">
                    {{ getExamTaskText(task) }}
                  </p>
                </div>
              </div>

              <!-- Milestone task: metric-based progress -->
              <div
                v-else
                class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-3"
              >
                <div class="flex items-start gap-2">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center mt-0.5">
                    <UIcon name="i-lucide-target" class="size-3" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-white">{{ getExamTaskText(task) }}</p>
                    <p class="text-xs text-white/40 mt-1">
                      Metric: {{ getExamTaskMetric(task).label }}
                      <span v-if="getExamTaskMetric(task).target">
                        — Target: {{ getExamTaskMetric(task).target }} {{ getExamTaskMetric(task).unit }}
                      </span>
                    </p>
                    <!-- Progress bar -->
                    <div class="mt-2">
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-white/50">Progress</span>
                        <span class="text-cyan-400 font-medium">
                          {{ getMilestoneCurrentValue(task) }}/{{ getExamTaskMetric(task).target }} {{ getExamTaskMetric(task).unit }}
                        </span>
                      </div>
                      <div class="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :class="isMilestoneAchieved(task) ? 'bg-emerald-500' : 'bg-cyan-500'"
                          :style="{ width: Math.min(100, (getMilestoneCurrentValue(task) / (getExamTaskMetric(task).target || 1)) * 100) + '%' }"
                        />
                      </div>
                    </div>
                    <div v-if="isMilestoneAchieved(task)" class="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                      <UIcon name="i-lucide-check-circle" class="size-3" />
                      <span>Milestone achieved!</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Metrics Requirements Section -->
        <div v-if="lessonData.metrics && lessonData.metrics.length > 0" class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="size-5 text-cyan-400" />
              <h2 class="text-lg font-semibold text-white">Metrics Requirements</h2>
            </div>
            <span class="text-xs text-white/50">
              {{ lessonData.metrics.length }} metrics
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(metric, metricIndex) in lessonData.metrics"
              :key="metricIndex"
              class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-3"
            >
              <div class="flex items-start gap-2">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {{ metricIndex + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-white">{{ metric.label }}</p>
                  <p class="text-xs text-white/40 mt-0.5">
                    Target: {{ metric.target }} {{ metric.unit }}
                    <span v-if="metric.increment">(increment: {{ metric.increment }} {{ metric.unit }})</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Level Navigation -->
        <div class="mt-8 flex items-center justify-between">
          <NuxtLink
            v-if="lessonData.previousLevel"
            :to="lessonData.previousLevel.path"
            class="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4 text-white/60 group-hover:text-white transition-colors" />
            <div>
              <p class="text-[10px] text-white/40 uppercase tracking-wider">Previous</p>
              <p class="text-sm text-white font-medium">Lvl {{ lessonData.previousLevel.level }}</p>
            </div>
          </NuxtLink>
          <div v-else />

          <NuxtLink
            v-if="lessonData.nextLevel && isLevelUnlockedByLevel(lessonData.nextLevel.level)"
            :to="lessonData.nextLevel.path"
            class="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div class="text-right">
              <p class="text-[10px] text-white/40 uppercase tracking-wider">Next Lesson</p>
              <p class="text-sm text-white font-medium">Lvl {{ lessonData.nextLevel.level }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-white/60 group-hover:text-white transition-colors" />
          </NuxtLink>
          <div v-else />
        </div>
      </div>

      <!-- Sidebar / Grade Book -->
      <div class="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 backdrop-blur-md p-6 space-y-5">
        <!-- Progress Card -->
        <div>
          <h3 class="text-xs uppercase tracking-wider text-white/40 font-semibold mb-3">Your Progress</h3>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-white/60">Status</span>
              <span :class="isLevelCompleted() ? 'text-emerald-400 font-medium' : 'text-white/40'">
                {{ isLevelCompleted() ? 'Completed' : 'In Progress' }}
              </span>
            </div>

            <div v-if="isEnrolled" class="space-y-2">
              <UButton
                v-if="!isLevelCompleted()"
                size="xs"
                color="primary"
                block
                @click="completeCurrentLevel"
              >
                <template #leading>
                  <UIcon name="i-lucide-check" class="size-3" />
                </template>
                Complete Level
              </UButton>

              <UButton
                v-else
                size="xs"
                variant="outline"
                color="neutral"
                block
                @click="resetCurrentLevel"
              >
                <template #leading>
                  <UIcon name="i-lucide-rotate-ccw" class="size-3" />
                </template>
                Reset Level
              </UButton>
            </div>

            <UButton
              v-else
              size="xs"
              color="primary"
              block
              @click="handleEnroll"
            >
              <template #leading>
                <UIcon name="i-lucide-plus" class="size-3" />
              </template>
              Enroll in Class
            </UButton>
          </div>
        </div>

        <!-- Class Levels -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs uppercase tracking-wider text-white/40 font-semibold">Class Levels</h3>
            <NuxtLink :to="`/classes/${degree}/${slug}`" class="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </NuxtLink>
          </div>
          <div class="space-y-1 max-h-64 lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-1 custom-scrollbar">
            <template v-for="level in sortedLevelsData" :key="level.level">
              <NuxtLink
                v-if="isSidebarLevelUnlocked(level.level)"
                :to="`/classes/${degree}/${slug}/${level.level}`"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
                :class="level.level === lessonData.level
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'hover:bg-white/5 border border-transparent'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  :class="isLevelCompleted(level.level)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : level.level === lessonData.level
                      ? 'bg-purple-500/30 text-purple-300'
                      : 'bg-white/10 text-white/40'"
                >
                  <UIcon v-if="isLevelCompleted(level.level)" name="i-lucide-check" class="size-3" />
                  <template v-else>{{ level.level }}</template>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-white/70 truncate" :class="{ 'text-white font-medium': level.level === lessonData.level }">
                    {{ level.title }}
                  </p>
                </div>
                <UIcon v-if="level.level === lessonData.level" name="i-lucide-book-open" class="size-3 text-purple-400 flex-shrink-0" />
              </NuxtLink>
              <div
                v-else
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-not-allowed opacity-50"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-white/10 text-white/40"
                >
                  <UIcon name="i-lucide-lock" class="size-3" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-white/40 truncate">
                    {{ level.title }}
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Back to Class Overview -->
        <NuxtLink :to="`/classes/${degree}/${slug}`" class="block">
          <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
            <UIcon name="i-lucide-grid-2x2" class="size-4 mx-auto text-white/40 mb-1" />
            <p class="text-xs text-white/60">Class Overview</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="fixed inset-0 z-10 flex items-center justify-center bg-black/80">
      <div class="text-center">
        <UIcon name="i-lucide-loader" class="size-8 animate-spin text-purple-400 mx-auto mb-3" />
        <p class="text-sm text-white/60">Entering classroom...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'

definePageMeta({
  layout: 'blank'
})

const route = useRoute()
const { app } = useRuntimeConfig()

const degree = computed(() => route.params.degree as string)
const slug = computed(() => route.params.slug as string)
const levelParam = computed(() => parseInt(route.params.level as string, 10))
const classSlug = computed(() => `${degree.value}/${slug.value}`)
const store = useEnrollmentStore()

// Fetch only the classes for this specific class slug
const { data: classLevels } = await useAsyncData(
  () => `lesson-${classSlug.value}-${levelParam.value}`,
  () => queryCollection('classes')
    .where('stem', 'LIKE', `classes/${degree.value}/${slug.value}%`)
    .all(),
  {
    watch: [classSlug, levelParam]
  }
)

// Sort levels - exclude _index.md items which have no level
const sortedLevelsData = computed(() => {
  if (!classLevels.value) return []
  return classLevels.value
    .filter(item => !(item as any).stem?.endsWith('/_index'))
    .map(item => ({
      level: parseInt((item as any).meta?.level, 10),
      title: (item as any).title,
      item
    }))
    .filter(l => !isNaN(l.level))
    .sort((a, b) => a.level - b.level)
})

// Find the current level's data
const currentLevelItem = computed(() => {
  const found = sortedLevelsData.value.find(l => l.level === levelParam.value)
  return found?.item || null
})

// Build a lookup of all levels by their item for dependency resolution
const levelItemMap = computed(() => {
  const map = new Map<number, any>()
  for (const l of sortedLevelsData.value) {
    map.set(l.level, l.item)
  }
  return map
})

// Check if a specific level is unlocked (its dependencies are met)
function isLevelUnlockedByLevel(levelNum: number): boolean {
  const item = levelItemMap.value.get(levelNum)
  if (!item) return false
  const deps = (item as any).meta?.dependencies || []
  if (!deps.length) return true
  return store.areDependenciesMet(classSlug.value, levelNum, deps)
}

// Alias for sidebar usage
function isSidebarLevelUnlocked(levelNum: number): boolean {
  return isLevelUnlockedByLevel(levelNum)
}

// Check if the current level's dependencies are met
const currentLevelDeps = computed(() => {
  const item = currentLevelItem.value
  if (!item) return []
  return (item as any).meta?.dependencies || []
})

const isLevelUnlocked = computed(() => {
  if (!currentLevelDeps.value.length) return true
  return store.areDependenciesMet(classSlug.value, levelParam.value, currentLevelDeps.value)
})

// Redirect to class page if level is locked
if (process.client) {
  watch([isLevelUnlocked, currentLevelItem], ([unlocked, item]) => {
    if (item && !unlocked) {
      navigateTo(`/classes/${degree.value}/${slug.value}`, { replace: true })
    }
  }, { immediate: true })
}

// Find adjacent levels
const previousLevel = computed(() => {
  const idx = sortedLevelsData.value.findIndex(l => l.level === levelParam.value)
  if (idx <= 0) return null
  return { level: sortedLevelsData.value[idx - 1]!.level, path: `/classes/${degree.value}/${slug.value}/${sortedLevelsData.value[idx - 1]!.level}` }
})

const nextLevel = computed(() => {
  const idx = sortedLevelsData.value.findIndex(l => l.level === levelParam.value)
  if (idx === -1 || idx >= sortedLevelsData.value.length - 1) return null
  return { level: sortedLevelsData.value[idx + 1]!.level, path: `/classes/${degree.value}/${slug.value}/${sortedLevelsData.value[idx + 1]!.level}` }
})

// Build lesson data
const lessonData = computed(() => {
  const item = currentLevelItem.value
  if (!item) return null

  const itemAny = item as any
  const level = parseInt(itemAny.meta?.level, 10)
  const className = itemAny.class || slug.value.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const degreeLabel = degree.value.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const flashcards = itemAny.meta?.flashcards || []
  const exam = itemAny.meta?.exam || []
  const metrics = itemAny.meta?.metrics || []

  return {
    title: itemAny.title,
    level,
    className,
    degree: degree.value,
    degreeLabel,
    image: `${app.baseURL}img/degrees/${degree.value}.webp`,
    body: itemAny.body,
    contentItem: item,
    flashcards,
    exam,
    metrics,
    previousLevel: previousLevel.value,
    nextLevel: nextLevel.value
  }
})

// Level badge color based on level range
const levelBadgeColor = computed(() => {
  const level = levelParam.value
  if (level >= 100 && level < 200) return 'bg-green-500/90'
  if (level >= 200 && level < 300) return 'bg-blue-500/90'
  if (level >= 300 && level < 400) return 'bg-red-500/90'
  return 'bg-gray-500/90'
})

// --- Enrollment State ---
const isEnrolled = computed(() => store.isEnrolled(classSlug.value))

function isLevelCompleted(level?: number) {
  const l = level ?? levelParam.value
  return store.isLevelCompleted(classSlug.value, l)
}

function completeCurrentLevel() {
  store.completeLevel(classSlug.value, levelParam.value)
  store.addXp(10)
  store.checkAchievements()
}

function resetCurrentLevel() {
  store.resetLevel(classSlug.value, levelParam.value)
}

function handleEnroll() {
  const levels = sortedLevelsData.value.filter(l => !isNaN(l.level)).map(l => l.level)
  store.enrollInClass(classSlug.value, slug.value, degree.value, levels)
}

// --- Flashcard State ---
const flashcardAnswered = ref<Record<number, boolean>>({})
const flashcardsCorrect = computed(() => Object.values(flashcardAnswered.value).filter(v => v).length)

function answerFlashcard(fcIndex: number, optIndex: number) {
  if (!lessonData.value) return
  const flashcard = lessonData.value.flashcards[fcIndex]
  if (!flashcard) return

  const isCorrect = optIndex === flashcard.correctIndex
  flashcardAnswered.value[fcIndex] = isCorrect

  store.recordFlashcardAnswer(fcIndex, lessonData.value.className, lessonData.value.level, isCorrect)
}

function getFlashcardOptionClass(fcIndex: number, optIndex: number) {
  const answered = flashcardAnswered.value[fcIndex]
  if (answered === undefined) {
    return 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer'
  }
  if (!lessonData.value) return 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
  const flashcard = lessonData.value.flashcards[fcIndex]
  if (!flashcard) return 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'

  if (optIndex === flashcard.correctIndex) {
    return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-not-allowed'
  }
  if (flashcardAnswered.value[fcIndex] === false && optIndex !== flashcard.correctIndex) {
    return 'border-red-500/20 bg-red-500/5 text-white/30 cursor-not-allowed'
  }
  return 'border-white/5 bg-transparent text-white/20 cursor-not-allowed'
}

// --- Exam Task Helpers ---

// Exam tasks can be:
// - A string (treated as a checklist item)
// - An object with { type: 'checklist', text: string }
// - An object with { type: 'milestone', text: string, metric: string, field: string, target: number, unit: string, label?: string }

function getExamTaskType(task: any): string {
  if (typeof task === 'string') return 'checklist'
  return task.type || 'checklist'
}

function getExamTaskText(task: any): string {
  if (typeof task === 'string') return task
  return task.text || ''
}

function getExamTaskMetric(task: any): { label: string; target: number; unit: string } {
  if (typeof task === 'object' && task.type === 'milestone') {
    return {
      label: task.label || task.field || '',
      target: task.target || 0,
      unit: task.unit || ''
    }
  }
  return { label: '', target: 0, unit: '' }
}

function isExamTaskDone(taskIndex: number): boolean {
  return store.isExamTaskCompleted(classSlug.value, levelParam.value, taskIndex)
}

function toggleExamTaskDone(taskIndex: number) {
  store.toggleExamTask(classSlug.value, levelParam.value, taskIndex)
}

const getExamCompletedCount = computed(() => {
  if (!lessonData.value?.exam) return 0
  let count = 0
  for (let i = 0; i < lessonData.value.exam.length; i++) {
    const task = lessonData.value.exam[i]
    if (getExamTaskType(task) === 'checklist') {
      if (isExamTaskDone(i)) count++
    } else {
      // Milestone: count as done if the metric target is met
      if (isMilestoneAchieved(task)) count++
    }
  }
  return count
})

function getMilestoneCurrentValue(task: any): number {
  if (typeof task !== 'object' || task.type !== 'milestone') return 0
  const metricSlug = task.metric
  const fieldId = task.field
  if (!metricSlug || !fieldId) return 0
  return store.getMetricValueField(metricSlug, fieldId)
}

function isMilestoneAchieved(task: any): boolean {
  if (typeof task !== 'object' || task.type !== 'milestone') return false
  const current = getMilestoneCurrentValue(task)
  return current >= (task.target || 0)
}

// --- SEO ---
useSeoMeta({
  title: computed(() => lessonData.value ? `${lessonData.value.title} - Level ${lessonData.value.level}` : 'Lesson'),
  description: computed(() => {
    if (!lessonData.value?.body) return ''
    const body = lessonData.value.body
    if (typeof body === 'string') return body.slice(0, 160)
    if (typeof body === 'object' && body.children) {
      return body.children.map((c: any) => c.value || '').join('').slice(0, 160)
    }
    return ''
  })
})
</script>

<style scoped>
/* Chalk-like text effect on the blackboard */
.chalk-text {
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
}

.chalk-text :deep(h1),
.chalk-text :deep(h2),
.chalk-text :deep(h3) {
  color: rgba(255, 255, 255, 0.95);
}

.chalk-text :deep(p) {
  color: rgba(255, 255, 255, 0.8);
}

.chalk-text :deep(strong) {
  color: rgba(255, 255, 255, 0.95);
}

.chalk-text :deep(ul),
.chalk-text :deep(ol) {
  color: rgba(255, 255, 255, 0.8);
}

/* Ambient floating particles */
.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float-particle linear infinite;
}

.particle-1 { top: 20%; left: 10%; animation-duration: 15s; animation-delay: 0s; }
.particle-2 { top: 60%; left: 80%; animation-duration: 20s; animation-delay: -5s; }
.particle-3 { top: 40%; left: 50%; animation-duration: 18s; animation-delay: -3s; }
.particle-4 { top: 80%; left: 30%; animation-duration: 22s; animation-delay: -8s; }
.particle-5 { top: 10%; left: 70%; animation-duration: 16s; animation-delay: -2s; }

@keyframes float-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(100px, -200px) scale(0.5); opacity: 0; }
}

/* Custom scrollbar for sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
