<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()

const id = computed(() => route.params.id as string)

const { data: home } = await useAsyncData(
  () => `degree-${id.value}`,
  () => queryCollection('content')
    .path(`/degrees/${id.value}`)
    .first(),
  {
    watch: [id]
  }
)

const title = computed(() => home.value?.title)
const description = computed(() => home.value?.description)
const body = computed(() => home.value?.body)

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: 'Degrees',
    icon: 'i-lucide-graduation-cap',
    to: '/degrees'
  },
  {
    label: title.value,
    to: `/degrees/${id.value}`
  }
])

useSeoMeta({
  title,
  description
})

// Mock data for mandatory courses per degree
const mandatoryCourses = computed(() => {
  const coursesByDegree: Record<string, { name: string; image: string; badge?: string; active?: boolean }[]> = {
    'sissy': [
      { name: 'Beauty Science', image: 'sissy', badge: 'F' },
      { name: 'Crossdressing Studies', image: 'sissy', badge: 'F', active: true },
      { name: 'Deportment Artistry', image: 'sissy', badge: 'F' },
      { name: 'Bodyshaping Technology', image: 'sissy', badge: 'F' },
    ],
    'anal-slut': [
      { name: 'Hygiene Fundamentals', image: 'anal-slut', badge: 'A' },
      { name: 'Rectal Endurance', image: 'anal-slut', badge: 'A', active: true },
      { name: 'Lubricant Science', image: 'anal-slut', badge: 'A' },
      { name: 'Performance Techniques', image: 'anal-slut', badge: 'A' },
    ],
    'cum-eater': [
      { name: 'Oral Basics', image: 'cum-eater', badge: 'C' },
      { name: 'Swallowing Techniques', image: 'cum-eater', badge: 'C', active: true },
      { name: 'Endurance Training', image: 'cum-eater', badge: 'C' },
      { name: 'Aftercare Protocols', image: 'cum-eater', badge: 'C' },
    ],
    'cock-gobbler': [
      { name: 'Deep Throat 101', image: 'cock-gobbler', badge: 'C' },
      { name: 'Breath Control', image: 'cock-gobbler', badge: 'C', active: true },
      { name: 'Speed Training', image: 'cock-gobbler', badge: 'C' },
      { name: 'Advanced Gobbler', image: 'cock-gobbler', badge: 'C' },
    ],
    'chaste': [
      { name: 'Chastity Mindset', image: 'chaste', badge: 'Ch' },
      { name: 'Device Care', image: 'chaste', badge: 'Ch', active: true },
      { name: 'Denial Techniques', image: 'chaste', badge: 'Ch' },
      { name: 'Submission Training', image: 'chaste', badge: 'Ch' },
    ],
    'hypnosub': [
      { name: 'Trance Induction', image: 'hypnosub', badge: 'H' },
      { name: 'Suggestion Response', image: 'hypnosub', badge: 'H', active: true },
      { name: 'Deep Sleep Training', image: 'hypnosub', badge: 'H' },
      { name: 'Trigger Conditioning', image: 'hypnosub', badge: 'H' },
    ],
    'pet': [
      { name: 'Animal Behavior', image: 'pet', badge: 'P' },
      { name: 'Basic Commands', image: 'pet', badge: 'P', active: true },
      { name: 'Trick Training', image: 'pet', badge: 'P' },
      { name: 'Pack Dynamics', image: 'pet', badge: 'P' },
    ],
    'voyeur': [
      { name: 'Observation Skills', image: 'voyeur', badge: 'V' },
      { name: 'Stealth Techniques', image: 'voyeur', badge: 'V', active: true },
      { name: 'Memory Training', image: 'voyeur', badge: 'V' },
      { name: 'Reporting Protocols', image: 'voyeur', badge: 'V' },
    ],
  }
  return coursesByDegree[id.value] || []
})

// Mock data for final exams per degree
const finalExams = computed(() => {
  const examsByDegree: Record<string, { name: string; duration: string; tasks: number; steps: number }[]> = {
    'sissy': [
      { name: 'Femme Foundations', duration: '~6 h', tasks: 11, steps: 24 },
      { name: 'Feminine Immersion', duration: '~12 h', tasks: 22, steps: 24 },
      { name: 'Feminine Lifestyle', duration: '~2 days, 6 h', tasks: 59, steps: 24 },
    ],
    'anal-slut': [
      { name: 'Endurance Exam', duration: '~4 h', tasks: 8, steps: 16 },
      { name: 'Hygiene Certification', duration: '~2 h', tasks: 5, steps: 12 },
      { name: 'Final Performance', duration: '~8 h', tasks: 15, steps: 32 },
    ],
    'cum-eater': [
      { name: 'Volume Test', duration: '~3 h', tasks: 10, steps: 20 },
      { name: 'Speed Challenge', duration: '~2 h', tasks: 6, steps: 12 },
      { name: 'Endurance Final', duration: '~6 h', tasks: 18, steps: 28 },
    ],
    'cock-gobbler': [
      { name: 'Depth Certification', duration: '~3 h', tasks: 9, steps: 18 },
      { name: 'Speed Gobbler Exam', duration: '~2 h', tasks: 7, steps: 14 },
      { name: 'Master Gobbler', duration: '~5 h', tasks: 14, steps: 26 },
    ],
    'chaste': [
      { name: '30-Day Lockup', duration: '~30 days', tasks: 30, steps: 30 },
      { name: 'Denial Endurance', duration: '~7 days', tasks: 7, steps: 14 },
      { name: 'Submission Trial', duration: '~14 days', tasks: 14, steps: 21 },
    ],
    'hypnosub': [
      { name: 'Deep Trance Exam', duration: '~4 h', tasks: 12, steps: 20 },
      { name: 'Trigger Response Test', duration: '~2 h', tasks: 8, steps: 16 },
      { name: 'Total Surrender', duration: '~8 h', tasks: 20, steps: 30 },
    ],
    'pet': [
      { name: 'Obedience Trial', duration: '~3 h', tasks: 10, steps: 18 },
      { name: 'Trick Showcase', duration: '~2 h', tasks: 6, steps: 12 },
      { name: 'Pack Leader Approval', duration: '~5 h', tasks: 15, steps: 24 },
    ],
    'voyeur': [
      { name: 'Observation Exam', duration: '~4 h', tasks: 12, steps: 20 },
      { name: 'Stealth Certification', duration: '~3 h', tasks: 8, steps: 16 },
      { name: 'Final Report', duration: '~6 h', tasks: 16, steps: 24 },
    ],
  }
  return examsByDegree[id.value] || []
})

// Mock progress values
const courseProgress = 0
const examProgress = 0
const finalGrade = 0
const isEnrolled = false
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
        <!-- Hero Image -->
        <div class="relative rounded-lg overflow-hidden">
          <img
            :src="`/img/degrees/${id}.webp`"
            :alt="title"
            class="w-full aspect-video object-cover"
          />
        </div>

        <!-- Title & Description -->
        <div>
          <h1 class="text-xl font-semibold text-white mb-2">
            {{ title }}
          </h1>
          <p class="text-sm text-muted leading-relaxed">
            {{ description }}
          </p>
        </div>

        <!-- Body Content -->
        <div v-if="body" class="text-sm text-muted/80 leading-relaxed">
          <ContentRenderer :value="home" />
        </div>

        <!-- Enroll Button -->
        <div class="pt-1">
          <UButton
            :variant="isEnrolled ? 'solid' : 'outline'"
            :color="isEnrolled ? 'primary' : 'secondary'"
            size="md"
            class="w-full sm:w-auto"
          >
            {{ isEnrolled ? 'Enrolled' : 'Enroll' }}
          </UButton>
        </div>

        <!-- Mandatory Courses Section -->
        <UCard>
          <template #header>
            <div class="text-center">
              <h2 class="text-base font-semibold">Mandatory Courses</h2>
              <p class="text-xs text-muted mt-0.5">(complete at least 3)</p>
            </div>
          </template>

          <!-- Course Cards -->
          <div class="grid grid-cols-2 gap-2 mb-3">
            <NuxtLink
              v-for="course in mandatoryCourses"
              :key="course.name"
              :to="`/classes/${course.name.toLowerCase().replace(/\s+/g, '-')}`"
              class="relative aspect-[3/4] rounded-lg overflow-hidden group"
            >
              <img
                :src="`/img/degrees/${course.image}.webp`"
                :alt="course.name"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <!-- Badge -->
              <div class="absolute top-1 right-1">
                <span class="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white text-[8px] font-bold">
                  {{ course.badge }}
                </span>
              </div>

              <!-- Active Badge -->
              <div v-if="course.active" class="absolute top-1 left-1">
                <span class="px-1 py-0.5 rounded-sm bg-blue-500 text-white text-[8px] font-bold uppercase">
                  Active
                </span>
              </div>

              <!-- Course Name -->
              <div class="absolute bottom-0 left-0 right-0 p-1.5">
                <p class="text-white text-[10px] font-semibold leading-tight">
                  {{ course.name }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- Course Progress Bar -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-muted">Course progress</span>
              <span class="text-xs text-muted">{{ courseProgress }}% <span class="text-red-400 font-bold">F</span></span>
            </div>
            <UProgress :model-value="courseProgress" :animated="false" color="success" size="sm" />
          </div>
        </UCard>

        <!-- Final Exams Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold">Final exams</h2>
              <UBadge variant="subtle" size="xs" color="neutral">
                VARIANT: TEXT
              </UBadge>
            </div>
          </template>

          <!-- Exam List -->
          <div class="space-y-2 mb-3">
            <div
              v-for="exam in finalExams"
              :key="exam.name"
              class="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
            >
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate">
                  {{ exam.name }} <span class="text-muted">[{{ exam.duration }}]</span>
                </p>
                <p class="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                  <UIcon name="i-lucide-list-checks" class="size-3" />
                  Multi-step · {{ exam.tasks }} tasks · {{ exam.steps }}h
                  <span class="text-muted/60">Join degree to unlock tasks</span>
                </p>
              </div>
              <UIcon name="i-lucide-lock" class="size-4 text-muted shrink-0" />
            </div>
          </div>

          <p class="text-xs text-muted text-center mb-3">(complete at least 1)</p>

          <!-- Exam Progress Bar -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-muted">Exams progress:</span>
              <span class="text-xs text-muted">{{ examProgress }}% <span class="text-red-400 font-bold">F</span></span>
            </div>
            <UProgress :model-value="examProgress" :animated="false" color="success" size="sm" />
          </div>
        </UCard>

        <!-- Final Grade Section -->
        <UCard>
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-semibold">Final Grade</span>
              <span class="text-xs text-muted">{{ finalGrade }}% <span class="text-red-400 font-bold">F</span></span>
            </div>
            <UProgress :model-value="finalGrade" :animated="false" color="success" size="sm" class="mb-2" />
            <p class="text-xs text-muted text-center">
              The final grade is comprised of 40% course grades and 60% graduation exam grade
            </p>
          </div>

          <!-- Join Degree Button -->
          <div class="pt-3">
            <UButton
              :variant="isEnrolled ? 'solid' : 'outline'"
              :color="isEnrolled ? 'primary' : 'secondary'"
              size="md"
              class="w-full"
            >
              {{ isEnrolled ? 'Enrolled' : 'Join Degree' }}
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Loading state -->
      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
