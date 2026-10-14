import { useEnrollmentLogic } from '~/composables/useEnrollmentLogic'

export type {
  LevelProgress, CourseEnrollment, DegreeEnrollment, FlashcardAnswer,
  CardSpacedRep, CharacterStats, CharacterCustomization,
  UserProfile, MetricMilestone, MetricDataPoint, MetricProgress,
  ClubMembership, ExamTaskCompletion, MetricField
} from '~/types/enrollment'

export const useEnrollmentStore = defineStore('enrollment', () => {
  const logic = useEnrollmentLogic()

  // Note: localStorage loading is handled by the enrollment-loader plugin
  // to ensure it runs after hydration regardless of when the store was created.

  watch([
    logic.profile, logic.enrollments, logic.degreeEnrollments,
    logic.flashcardAnswers, logic.cardSpacedRep, logic.detentionCount,
    logic.metricProgress, logic.clubMemberships, logic.examTasks
  ], () => {
    logic.saveToStorage()
  }, { deep: true })

  return {
    profile: logic.profile,
    enrollments: logic.enrollments,
    degreeEnrollments: logic.degreeEnrollments,
    flashcardAnswers: logic.flashcardAnswers,
    detentionCount: logic.detentionCount,
    metricProgress: logic.metricProgress,
    cardSpacedRep: logic.cardSpacedRep,
    clubMemberships: logic.clubMemberships,
    examTasks: logic.examTasks,
    enrolledCourseSlugs: logic.enrolledCourseSlugs,
    enrolledCourseCount: logic.enrolledCourseCount,
    completedLevelsCount: logic.completedLevelsCount,
    completedCoursesCount: logic.completedCoursesCount,
    flashcardsAnswered: logic.flashcardsAnswered,
    flashcardsCorrect: logic.flashcardsCorrect,
    enrolledDegreeSlugs: logic.enrolledDegreeSlugs,
    updateProfile: logic.updateProfile,
    updateStat: logic.updateStat,
    addXp: logic.addXp,
    getXpForNextLevel: logic.getXpForNextLevel,
    updateCustomization: logic.updateCustomization,
    addAccessory: logic.addAccessory,
    removeAccessory: logic.removeAccessory,
    unlockAchievement: logic.unlockAchievement,
    checkAchievements: logic.checkAchievements,
    getUnlockedAchievements: logic.getUnlockedAchievements,
    enrollInCourse: logic.enrollInCourse,
    unenrollFromCourse: logic.unenrollFromCourse,
    isEnrolled: logic.isEnrolled,
    getEnrollment: logic.getEnrollment,
    completeLevel: logic.completeLevel,
    resetLevel: logic.resetLevel,
    isLevelCompleted: logic.isLevelCompleted,
    areDependenciesMet: logic.areDependenciesMet,
    canEnroll: logic.canEnroll,
    isDegreeEnrolled: logic.isDegreeEnrolled,
    getDegreeEnrollment: logic.getDegreeEnrollment,
    hasDegreeEnrollment: logic.hasDegreeEnrollment,
    enrollInDegree: logic.enrollInDegree,
    unenrollFromDegree: logic.unenrollFromDegree,
    recordFlashcardAnswer: logic.recordFlashcardAnswer,
    getOrCreateCardRep: logic.getOrCreateCardRep,
    recordCardAnswerWithSpacedRep: logic.recordCardAnswerWithSpacedRep,
    getDueCards: logic.getDueCardsFn,
    getDegreeKnowledgeScore: logic.getDegreeKnowledgeScoreFn,
    getKnowledgeBreakdown: logic.getKnowledgeBreakdownFn,
    addDetention: logic.addDetention,
    getMetricProgress: logic.getMetricProgressFn,
    getMetricValueField: logic.getMetricValueFieldFn,
    getMetricDataPoints: logic.getMetricDataPointsFn,
    getMetricLatestValues: logic.getMetricLatestValuesFn,
    isMilestoneAchieved: logic.isMilestoneAchievedFn,
    getAchievedMilestoneCount: logic.getAchievedMilestoneCount,
    logActivity: logic.logActivity,
    deleteDataPoint: logic.deleteDataPoint,
    hasActivityLoggedToday: logic.hasActivityLoggedTodayFn,
    isActivityDoneRecently: logic.isActivityDoneRecentlyFn,
    joinClub: logic.joinClub,
    leaveClub: logic.leaveClub,
    isClubMember: logic.isClubMember,
    getClubActivitySlugs: logic.getClubActivitySlugs,
    toggleExamTask: logic.toggleExamTask,
    isExamTaskCompleted: logic.isExamTaskCompleted,
    loadFromStorage: logic.loadFromStorage
  }
})
