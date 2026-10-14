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

  // Enrollment helpers — delegated to utility functions
  // Auto-save is handled by the store's watch, not here
  const enrollInCourse = (s: string, n: string, d: string, l: number[]) => enrollInCourseFn(enrollments, s, n, d, l)
  const unenrollFromCourse = (s: string) => unenrollFromCourseFn(enrollments, s)
  const isEnrolled = (s: string) => isEnrolledFn(enrollments, s)
  const getEnrollment = (s: string) => getEnrollmentFn(enrollments, s)
  const completeLevel = (s: string, l: number) => completeLevelFn(enrollments, s, l)
  const resetLevel = (s: string, l: number) => resetLevelFn(enrollments, s, l)
  const isLevelCompleted = (s: string, l: number) => isLevelCompletedFn(enrollments, s, l)
  const areDependenciesMet = (_s: string, _l: number, d: { course: string, level: number }[]) => areDependenciesMetFn(enrollments, d)
  const canEnroll = (s: string, d: { course: string, level: number }[]) => canEnrollFn(enrollments, s, d)

  const isDegreeEnrolled = (s: string) => isDegreeEnrolledFn(degreeEnrollments, s)
  const getDegreeEnrollment = (s: string) => getDegreeEnrollmentFn(degreeEnrollments, s)
  const enrollInDegree = (s: string, t: string) => enrollInDegreeFn(degreeEnrollments, s, t)
  const unenrollFromDegree = (s: string) => unenrollFromDegreeFn(degreeEnrollments, s)
  const hasDegreeEnrollment = (s: string) => isDegreeEnrolledFn(degreeEnrollments, s)

  const joinClub = (s: string, r?: string) => joinClubFn(clubMemberships, s, !r || isDegreeEnrolledFn(degreeEnrollments, r))
  const leaveClub = (s: string) => leaveClubFn(clubMemberships, s)
  const isClubMember = (s: string) => isClubMemberFn(clubMemberships, s)
  const getClubActivitySlugs = (m: Record<string, string[]>) => getClubActivitySlugsFn(clubMemberships, m)
  const toggleExamTask = (c: string, l: number, t: number) => toggleExamTaskFn(examTasks, c, l, t)
  const isExamTaskCompleted = (c: string, l: number, t: number) => isExamTaskCompletedFn(examTasks, c, l, t)

  function recordFlashcardAnswer(cardId: number, courseName: string, level: number, correct: boolean) {
    flashcardAnswers.value.push({ cardId, courseName, level, correct, answeredAt: Date.now() })
  }
  function addDetention() {
    detentionCount.value++
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
