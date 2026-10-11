<template>
  <div class="relative min-h-screen overflow-hidden">
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
            v-if="lessonData.nextLevel"
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
            <NuxtLink
              v-for="level in sortedLevelsData"
              :key="level.level"
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

const route = useRoute()

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

  return {
    title: itemAny.title,
    level,
    className,
    degree: degree.value,
    degreeLabel,
    image: `/img/degrees/${degree.value}.webp`,
    body: itemAny.body,
    contentItem: item,
    flashcards,
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
