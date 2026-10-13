import { createDefaultAchievements } from '~/utils/enrollmentHelpers'
import { useSpacedRepetition, useMetrics } from './useEnrollmentExtras'
import {
  createDefaultProfile, updateProfile as updateProfileFn, updateStat as updateStatFn,
  addXp as addXpFn, getXpForNextLevel as getXpForNextLevelFn,
  updateCustomization as updateCustomizationFn, addAccessory as addAccessoryFn,
  removeAccessory as removeAccessoryFn, unlockAchievement as unlockAchievementFn,
  checkAchievements as checkAchievementsFn, getUnlockedAchievements as getUnlockedAchievementsFn
} from '~/utils/profileHelpers'
import {
  enrollInCourse as enrollInCourseFn, unenrollFromCourse as unenrollFromCourseFn,
  isEnrolled as isEnrolledFn, getEnrollment as getEnrollmentFn,
  completeLevel as completeLevelFn, resetLevel as resetLevelFn,
  isLevelCompleted as isLevelCompletedFn,
  areDependenciesMet as areDependenciesMetFn, canEnroll as canEnrollFn,
  isDegreeEnrolledFn, getDegreeEnrollmentFn,
  enrollInDegree as enrollInDegreeFn, unenrollFromDegree as unenrollFromDegreeFn,
  hasDegreeEnrollment as hasDegreeEnrollmentFn,
  joinClubFn, leaveClubFn, isClubMemberFn, getClubActivitySlugsFn,
  toggleExamTaskFn, isExamTaskCompletedFn,
  saveEnrollmentToStorage, loadEnrollmentFromStorage,
  applyLoadedEnrollmentData,
  getEnrolledCourseSlugs, countCompletedLevels, countCompletedCourses, getEnrolledDegreeSlugs
} from '~/utils/enrollmentHelpers2'
import type {
  CourseEnrollment, DegreeEnrollment, FlashcardAnswer,
  CardSpacedRep, CharacterStats, CharacterCustomization,
  UserProfile, MetricProgress,
  ClubMembership, ExamTaskCompletion
} from '~/types/enrollment'

export function useEnrollmentLogic() {
  const { app } = useRuntimeConfig()
  const defaultStats = { obedience: 10, charm: 5, knowledge: 8, confidence: 3, flexibility: 7, creativity: 6 }
  const defaultCustomization = { hairColor: '#8B4513', skinTone: '#F5D5C8', eyeColor: '#4A90D9', outfit: 'casual', accessories: [] }

  const profile = ref<UserProfile>(createDefaultProfile(app.baseURL))
  const enrollments = ref<CourseEnrollment[]>([])
  const degreeEnrollments = ref<DegreeEnrollment[]>([])
  const flashcardAnswers = ref<FlashcardAnswer[]>([])
  const cardSpacedRep = ref<CardSpacedRep[]>([])
  const detentionCount = ref(0)
  const metricProgress = ref<MetricProgress[]>([])
  const clubMemberships = ref<ClubMembership[]>([])
  const examTasks = ref<ExamTaskCompletion[]>([])

  const enrolledCourseSlugs = computed(() => getEnrolledCourseSlugs(enrollments.value))
  const enrolledCourseCount = computed(() => enrollments.value.length)
  const completedLevelsCount = computed(() => countCompletedLevels(enrollments.value))
  const completedCoursesCount = computed(() => countCompletedCourses(enrollments.value))
  const flashcardsAnswered = computed(() => flashcardAnswers.value.length)
  const flashcardsCorrect = computed(() => flashcardAnswers.value.filter(a => a.correct).length)
  const enrolledDegreeSlugs = computed(() => getEnrolledDegreeSlugs(degreeEnrollments.value))

  // Profile helpers — delegated to utility functions
  const updateProfile = (u: Partial<UserProfile>) => updateProfileFn(profile, u)
  const updateStat = (s: keyof CharacterStats, v: number) => updateStatFn(profile, s, v)
  const addXp = (a: number) => addXpFn(profile, a)
  const getXpForNextLevel = () => getXpForNextLevelFn(profile)
  const updateCustomization = (u: Partial<CharacterCustomization>) => updateCustomizationFn(profile, u)
  const addAccessory = (a: string) => addAccessoryFn(profile, a)
  const removeAccessory = (a: string) => removeAccessoryFn(profile, a)
  const unlockAchievement = (id: string) => unlockAchievementFn(profile, id)
  const checkAchievements = () => checkAchievementsFn(profile)
  const getUnlockedAchievements = () => getUnlockedAchievementsFn(profile)

  // Helper: wrap a mutating function so it auto-saves after execution
  const saveAfter = (fn: (...args: unknown[]) => void) => {
    return (...args: unknown[]) => {
      fn(...args)
      saveToStorage()
    }
  }

  // Enrollment helpers — delegated to utility functions
  const enrollInCourse = saveAfter((...a: [string, string, string, number[]]) => enrollInCourseFn(enrollments, ...a)) as (s: string, n: string, d: string, l: number[]) => void
  const unenrollFromCourse = saveAfter((...a: [string]) => unenrollFromCourseFn(enrollments, ...a)) as (s: string) => void
  const isEnrolled = (s: string) => isEnrolledFn(enrollments, s)
  const getEnrollment = (s: string) => getEnrollmentFn(enrollments, s)
  const completeLevel = saveAfter((...a: [string, number]) => completeLevelFn(enrollments, ...a)) as (s: string, l: number) => void
  const resetLevel = saveAfter((...a: [string, number]) => resetLevelFn(enrollments, ...a)) as (s: string, l: number) => void
  const isLevelCompleted = (s: string, l: number) => isLevelCompletedFn(enrollments, s, l)
  const areDependenciesMet = (_s: string, _l: number, d: { course: string, level: number }[]) => areDependenciesMetFn(enrollments, d)
  const canEnroll = (s: string, d: { course: string, level: number }[]) => canEnrollFn(enrollments, s, d)

  const isDegreeEnrolled = (s: string) => isDegreeEnrolledFn(degreeEnrollments, s)
  const getDegreeEnrollment = (s: string) => getDegreeEnrollmentFn(degreeEnrollments, s)
  const enrollInDegree = saveAfter((...a: [string, string]) => enrollInDegreeFn(degreeEnrollments, ...a)) as (s: string, t: string) => void
  const unenrollFromDegree = saveAfter((...a: [string]) => unenrollFromDegreeFn(degreeEnrollments, ...a)) as (s: string) => void
  const hasDegreeEnrollment = (s: string) => hasDegreeEnrollmentFn(enrollments, s)

  const joinClub = saveAfter((...a: [string, string?]) => joinClubFn(clubMemberships, a[0] as string, !a[1] || hasDegreeEnrollmentFn(enrollments, a[1] as string))) as (s: string, r?: string) => void
  const leaveClub = saveAfter((...a: [string]) => leaveClubFn(clubMemberships, ...a)) as (s: string) => void
  const isClubMember = (s: string) => isClubMemberFn(clubMemberships, s)
  const getClubActivitySlugs = (m: Record<string, string[]>) => getClubActivitySlugsFn(clubMemberships, m)
  const toggleExamTask = saveAfter((...a: [string, number, number]) => toggleExamTaskFn(examTasks, ...a)) as (c: string, l: number, t: number) => void
  const isExamTaskCompleted = (c: string, l: number, t: number) => isExamTaskCompletedFn(examTasks, c, l, t)

  function recordFlashcardAnswer(cardId: number, courseName: string, level: number, correct: boolean) {
    flashcardAnswers.value.push({ cardId, courseName, level, correct, answeredAt: Date.now() })
    saveToStorage()
  }
  function addDetention() {
    detentionCount.value++
    saveToStorage()
  }

  const spacedRep = useSpacedRepetition(cardSpacedRep, flashcardAnswers)
  const metrics = useMetrics(metricProgress)

  function saveToStorage() {
    saveEnrollmentToStorage({
      profile: profile.value, enrollments: enrollments.value,
      degreeEnrollments: degreeEnrollments.value, flashcardAnswers: flashcardAnswers.value,
      cardSpacedRep: cardSpacedRep.value, detentionCount: detentionCount.value,
      metricProgress: metricProgress.value, clubMemberships: clubMemberships.value,
      examTasks: examTasks.value, version: 10
    })
  }

  function loadFromStorage() {
    const data = loadEnrollmentFromStorage()
    if (!data) return
    applyLoadedEnrollmentData(data, profile, enrollments, degreeEnrollments, flashcardAnswers, cardSpacedRep, detentionCount, metricProgress, clubMemberships, examTasks, defaultStats, defaultCustomization, createDefaultAchievements)
  }

  return {
    profile, enrollments, degreeEnrollments, flashcardAnswers, detentionCount, metricProgress,
    cardSpacedRep, clubMemberships, examTasks,
    enrolledCourseSlugs, enrolledCourseCount, completedLevelsCount, completedCoursesCount,
    flashcardsAnswered, flashcardsCorrect, enrolledDegreeSlugs,
    updateProfile, updateStat, addXp, getXpForNextLevel,
    updateCustomization, addAccessory, removeAccessory,
    unlockAchievement, checkAchievements, getUnlockedAchievements,
    enrollInCourse, unenrollFromCourse, isEnrolled, getEnrollment,
    completeLevel, resetLevel, isLevelCompleted, areDependenciesMet, canEnroll,
    isDegreeEnrolled, getDegreeEnrollment,
    recordFlashcardAnswer,
    ...spacedRep,
    addDetention,
    ...metrics,
    hasDegreeEnrollment, enrollInDegree, unenrollFromDegree, joinClub, leaveClub, isClubMember, getClubActivitySlugs,
    toggleExamTask, isExamTaskCompleted,
    saveToStorage, loadFromStorage
  }
}
