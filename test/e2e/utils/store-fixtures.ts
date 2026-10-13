import type { Page } from 'playwright-core'
import { url, waitForHydration } from '@nuxt/test-utils/e2e'
import type {
  CourseEnrollment,
  DegreeEnrollment,
  FlashcardAnswer,
  ClubMembership,
  ExamTaskCompletion,
  MetricProgress,
  CharacterStats,
  CharacterCustomization,
  Achievement
} from '~/types/enrollment'

// ── Types ──

/**
 * Partial enrollment store data that a test can provide.
 * Only the fields that differ from the default need to be specified.
 */
export interface EnrollmentFixtureOptions {
  /** Course enrollments for the test scenario. */
  enrollments?: CourseEnrollment[]
  /** Degree enrollments for the test scenario. */
  degreeEnrollments?: DegreeEnrollment[]
  /** Flashcard answer history. */
  flashcardAnswers?: FlashcardAnswer[]
  /** Club memberships. */
  clubMemberships?: ClubMembership[]
  /** Exam task completions. */
  examTasks?: ExamTaskCompletion[]
  /** Metric progress data. */
  metricProgress?: MetricProgress[]
  /** User profile overrides (merged with defaults). */
  profileName?: string
  profileDegree?: string
  profileStats?: Partial<CharacterStats>
  profileCustomization?: Partial<CharacterCustomization>
  profileAchievements?: Achievement[]
  profileXp?: number
  profileLevel?: number
  /** Detention count. */
  detentionCount?: number
}

/**
 * Study plan store data for test scenarios.
 */
export interface StudyPlanFixtureOptions {
  /** Class slugs added to the study plan. */
  studyPlan?: string[]
  /** Degree slugs selected in the filter. */
  selectedDegrees?: string[]
  /** Target title per degree. */
  degreeTargetTitle?: Record<string, string>
}

/**
 * Club activities store data for test scenarios.
 */
export interface ClubActivitiesFixtureOptions {
  /** Completed activities keyed by club slug. */
  completedActivities?: Record<string, string[]>
}

/**
 * Schedule store data for test scenarios.
 */
export interface ScheduleFixtureOptions {
  /** Routine activity assignments. */
  routineAssignments?: { activitySlug: string, slot: string }[]
  /** Class schedule entries. */
  scheduleEntries?: { id: number, classSlug: string, day: number, section: string }[]
}

// ── Defaults ──

const DEFAULT_STATS: CharacterStats = {
  obedience: 10,
  charm: 5,
  knowledge: 8,
  confidence: 3,
  flexibility: 7,
  creativity: 6
}

const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  hairColor: '#8B4513',
  skinTone: '#F5D5C8',
  eyeColor: '#4A90D9',
  outfit: 'casual',
  accessories: []
}

/**
 * Returns the default enrollment storage data structure.
 * Tests should merge their specific data on top of this.
 */
function createDefaultEnrollmentData(): {
  version: number
  profile: {
    name: string
    email: string
    degree: string
    avatarSrc: string
    stats: CharacterStats
    customization: CharacterCustomization
    achievements: Achievement[]
    xp: number
    level: number
  }
  enrollments: CourseEnrollment[]
  degreeEnrollments: DegreeEnrollment[]
  flashcardAnswers: FlashcardAnswer[]
  cardSpacedRep: unknown[]
  detentionCount: number
  metricProgress: MetricProgress[]
  clubMemberships: ClubMembership[]
  examTasks: ExamTaskCompletion[]
} {
  return {
    version: 10,
    profile: {
      name: 'Test',
      email: 'test@test.com',
      degree: '',
      avatarSrc: '',
      stats: { ...DEFAULT_STATS },
      customization: { ...DEFAULT_CUSTOMIZATION },
      achievements: [],
      xp: 0,
      level: 1
    },
    enrollments: [],
    degreeEnrollments: [],
    flashcardAnswers: [],
    cardSpacedRep: [],
    detentionCount: 0,
    metricProgress: [],
    clubMemberships: [],
    examTasks: []
  }
}

// ── Builders ──

/**
 * Builds enrollment store data from partial options, merging with defaults.
 * @param options - Partial enrollment data to override defaults.
 * @returns Complete enrollment storage data object.
 */
export function buildEnrollmentData(options: EnrollmentFixtureOptions = {}) {
  const data = createDefaultEnrollmentData()

  // Merge profile overrides
  if (options.profileName !== undefined) data.profile.name = options.profileName
  if (options.profileDegree !== undefined) data.profile.degree = options.profileDegree
  if (options.profileStats) data.profile.stats = { ...data.profile.stats, ...options.profileStats }
  if (options.profileCustomization) data.profile.customization = { ...data.profile.customization, ...options.profileCustomization }
  if (options.profileAchievements !== undefined) data.profile.achievements = options.profileAchievements
  if (options.profileXp !== undefined) data.profile.xp = options.profileXp
  if (options.profileLevel !== undefined) data.profile.level = options.profileLevel

  // Override arrays if provided
  if (options.enrollments !== undefined) data.enrollments = options.enrollments
  if (options.degreeEnrollments !== undefined) data.degreeEnrollments = options.degreeEnrollments
  if (options.flashcardAnswers !== undefined) data.flashcardAnswers = options.flashcardAnswers
  if (options.clubMemberships !== undefined) data.clubMemberships = options.clubMemberships
  if (options.examTasks !== undefined) data.examTasks = options.examTasks
  if (options.metricProgress !== undefined) data.metricProgress = options.metricProgress
  if (options.detentionCount !== undefined) data.detentionCount = options.detentionCount

  return data
}

/**
 * Creates a concise course enrollment for test data.
 * @param slug - Course slug.
 * @param degree - Degree slug.
 * @param levels - Level numbers to create.
 * @param completedLevels - Levels that should be marked as completed.
 */
export function createCourseEnrollment(
  slug: string,
  degree: string,
  levels: number[],
  completedLevels: number[] = []
): CourseEnrollment {
  return {
    slug,
    courseName: slug,
    degree,
    enrolledAt: Date.now(),
    levels: levels.map(level => ({
      level,
      completed: completedLevels.includes(level),
      completedAt: completedLevels.includes(level) ? Date.now() : undefined
    }))
  }
}

/**
 * Creates a degree enrollment for test data.
 * @param degreeSlug - Degree slug.
 * @param title - Target title name.
 */
export function createDegreeEnrollment(degreeSlug: string, title: string): DegreeEnrollment {
  return {
    degreeSlug,
    title,
    enrolledAt: Date.now()
  }
}

/**
 * Creates a club membership for test data.
 * @param clubSlug - Club slug.
 */
export function createClubMembership(clubSlug: string): ClubMembership {
  return {
    clubSlug,
    joinedAt: Date.now()
  }
}

/**
 * Creates an exam task completion for test data.
 * @param courseSlug - Course slug.
 * @param level - Level number.
 * @param taskId - Task ID.
 * @param completed - Whether the task is completed.
 */
export function createExamTask(
  courseSlug: string,
  level: number,
  taskId: number,
  completed: boolean = false
): ExamTaskCompletion {
  return {
    courseSlug,
    level,
    taskId,
    completed,
    completedAt: completed ? Date.now() : undefined
  }
}

// ── Page Helpers ──

/**
 * Sets the enrollment store data in the browser's localStorage and reloads the page.
 * @param page - Playwright page instance.
 * @param options - Partial enrollment data to merge with defaults.
 */
export async function setEnrollmentStore(page: Page, options: EnrollmentFixtureOptions = {}) {
  const data = buildEnrollmentData(options)
  await page.evaluate((d: typeof data) => {
    localStorage.setItem('kiss-enrollment', JSON.stringify(d))
  }, data)
  await page.reload()
  await waitForHydration(page, url('/'))
}

/**
 * Sets the study plan store data in the browser's localStorage.
 * @param page - Playwright page instance.
 * @param options - Study plan data to set.
 */
export async function setStudyPlanStore(page: Page, options: StudyPlanFixtureOptions = {}) {
  await page.evaluate((opts: StudyPlanFixtureOptions) => {
    if (opts.studyPlan !== undefined) {
      localStorage.setItem('kiss-study-plan', JSON.stringify(opts.studyPlan))
    }
    if (opts.selectedDegrees !== undefined) {
      localStorage.setItem('kiss-study-plan-degrees', JSON.stringify(opts.selectedDegrees))
    }
    if (opts.degreeTargetTitle !== undefined) {
      localStorage.setItem('kiss-study-plan-titles', JSON.stringify(opts.degreeTargetTitle))
    }
  }, options)
  await page.reload()
  await waitForHydration(page, url('/'))
}

/**
 * Sets the club activities store data in the browser's localStorage.
 * @param page - Playwright page instance.
 * @param options - Club activities data to set.
 */
export async function setClubActivitiesStore(page: Page, options: ClubActivitiesFixtureOptions = {}) {
  await page.evaluate((opts: ClubActivitiesFixtureOptions) => {
    if (opts.completedActivities) {
      for (const [clubSlug, activities] of Object.entries(opts.completedActivities)) {
        localStorage.setItem(`club-activities-${clubSlug}`, JSON.stringify(activities))
      }
    }
  }, options)
  await page.reload()
  await waitForHydration(page, url('/'))
}

/**
 * Sets the schedule store data in the browser's localStorage.
 * @param page - Playwright page instance.
 * @param options - Schedule data to set.
 */
export async function setScheduleStore(page: Page, options: ScheduleFixtureOptions = {}) {
  await page.evaluate((opts: ScheduleFixtureOptions) => {
    if (opts.routineAssignments !== undefined) {
      localStorage.setItem('kiss-schedule-routine', JSON.stringify(opts.routineAssignments))
    }
    if (opts.scheduleEntries !== undefined) {
      localStorage.setItem('kiss-schedule-entries', JSON.stringify(opts.scheduleEntries))
    }
  }, options)
  await page.reload()
  await waitForHydration(page, url('/'))
}

/**
 * Clears all store data from localStorage and reloads the page.
 * @param page - Playwright page instance.
 */
export async function clearAllStores(page: Page) {
  await page.evaluate(() => {
    const keysToRemove = [
      'kiss-enrollment',
      'kiss-study-plan',
      'kiss-study-plan-degrees',
      'kiss-study-plan-titles',
      'kiss-schedule-routine',
      'kiss-schedule-entries',
      'kiss-binaural-beats',
      'kiss-haptics',
      'kiss-hypnotic-spiral'
    ]
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
    // Also remove club-activities-* keys
    const clubKeys = Object.keys(localStorage).filter(k => k.startsWith('club-activities-'))
    for (const key of clubKeys) {
      localStorage.removeItem(key)
    }
  })
  await page.reload()
  await waitForHydration(page, url('/'))
}

/**
 * Sets a simple boolean setting in localStorage (for non-store settings like binaural beats).
 * @param page - Playwright page instance.
 * @param key - The localStorage key.
 * @param value - The boolean value.
 */
export async function setSetting(page: Page, key: string, value: boolean) {
  await page.evaluate(([k, v]) => {
    localStorage.setItem(k, String(v))
  }, [key, value] as [string, boolean])
}

/**
 * Media player state for non-reactive test scenarios.
 */
export interface MediaPlayerState {
  currentMedia?: { title: string, author: string, type: string, currentPage: string }
  isPlaying?: boolean
  binauralEnabled?: boolean
  showSpiral?: boolean
  hapticsEnabled?: boolean
}

/**
 * Sets the media player state directly in the Pinia store via page.evaluate.
 * The mediaPlayer store does not persist to localStorage, so we must set
 * its reactive state directly for the widget to render.
 * @param page - Playwright page instance.
 * @param state - Media player state to set.
 */
export async function setMediaPlayerState(page: Page, state: MediaPlayerState) {
  await page.evaluate((s: MediaPlayerState) => {
    // Access the Pinia store via the Nuxt app instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nuxtApp = (window as any).__NUXT__?.nuxtApp as any
    if (nuxtApp?.nuxtApp?.$pinia) {
      const store = nuxtApp.nuxtApp.$pinia.state.value.mediaPlayer as Record<string, unknown> | undefined
      if (store) {
        if (s.currentMedia) {
          store.currentMedia = {
            title: s.currentMedia.title,
            type: s.currentMedia.type,
            url: '',
            author: s.currentMedia.author,
            currentPage: s.currentMedia.currentPage
          }
        }
        if (s.isPlaying !== undefined) store.isPlaying = s.isPlaying
        if (s.binauralEnabled !== undefined) store.binauralEnabled = s.binauralEnabled
        if (s.showSpiral !== undefined) store.showSpiral = s.showSpiral
        if (s.hapticsEnabled !== undefined) store.hapticsEnabled = s.hapticsEnabled
      }
    }
  }, state)
}
