/**
 * Course enrollment management helpers.
 * Extracted from useEnrollmentLogic to keep the composable within line limits.
 */
import { storageGetItem, storageSetItem } from '~/utils/storage'
import type { LevelProgress, CourseEnrollment, DegreeEnrollment, ClubMembership, ExamTaskCompletion, UserProfile } from '~/types/enrollment'
import {
  isClubMember, joinClub, leaveClub, getClubActivitySlugs,
  toggleExamTask, isExamTaskCompleted,
  isDegreeEnrolled, getDegreeEnrollment
} from '~/utils/enrollmentDomain'

/**
 * Enrolls in a course with the given levels.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @param courseName - Course display name.
 * @param degree - Degree slug.
 * @param availableLevels - Array of level numbers.
 */
export function enrollInCourse(
  enrollments: Ref<CourseEnrollment[]>,
  slug: string, courseName: string, degree: string, availableLevels: number[]
) {
  if (enrollments.value.some(e => e.slug === slug)) return
  const levels: LevelProgress[] = availableLevels.map(level => ({ level, completed: false }))
  enrollments.value.push({ slug, courseName, degree, enrolledAt: Date.now(), levels })
}

/**
 * Unenrolls from a course.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug to remove.
 */
export function unenrollFromCourse(enrollments: Ref<CourseEnrollment[]>, slug: string) {
  const idx = enrollments.value.findIndex(e => e.slug === slug)
  if (idx !== -1) enrollments.value.splice(idx, 1)
}

/**
 * Checks if a course is enrolled.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug to check.
 * @returns True if enrolled.
 */
export function isEnrolled(enrollments: Ref<CourseEnrollment[]>, slug: string) {
  return enrollments.value.some(e => e.slug === slug)
}

/**
 * Gets enrollment data for a course.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @returns Enrollment data or undefined.
 */
export function getEnrollment(enrollments: Ref<CourseEnrollment[]>, slug: string): CourseEnrollment | undefined {
  return enrollments.value.find(e => e.slug === slug)
}

/**
 * Marks a level as completed.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @param level - Level number.
 */
export function completeLevel(enrollments: Ref<CourseEnrollment[]>, slug: string, level: number) {
  const enrollment = enrollments.value.find(e => e.slug === slug)
  if (!enrollment) return
  const lp = enrollment.levels.find(l => l.level === level)
  if (lp) {
    lp.completed = true
    lp.completedAt = Date.now()
  }
}

/**
 * Resets a level completion status.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @param level - Level number.
 */
export function resetLevel(enrollments: Ref<CourseEnrollment[]>, slug: string, level: number) {
  const enrollment = enrollments.value.find(e => e.slug === slug)
  if (!enrollment) return
  const lp = enrollment.levels.find(l => l.level === level)
  if (lp) {
    lp.completed = false
    lp.completedAt = undefined
  }
}

/**
 * Checks if a specific level is completed.
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @param level - Level number.
 * @returns True if completed.
 */
export function isLevelCompleted(enrollments: Ref<CourseEnrollment[]>, slug: string, level: number): boolean {
  const enrollment = enrollments.value.find(e => e.slug === slug)
  if (!enrollment) return false
  return enrollment.levels.find(l => l.level === level)?.completed ?? false
}

/**
 * Checks if a level is completed by course name.
 * @param enrollments - The enrollments ref.
 * @param courseName - Course display name.
 * @param level - Level number.
 * @returns True if completed.
 */
export function isLevelCompletedByName(enrollments: Ref<CourseEnrollment[]>, courseName: string, level: number): boolean {
  const enrollment = enrollments.value.find(e => e.courseName === courseName)
  if (!enrollment) return false
  return enrollment.levels.find(l => l.level === level)?.completed ?? false
}

/**
 * Checks if all dependency levels are completed.
 * @param enrollments - The enrollments ref.
 * @param requiredDeps - Array of dependency course slug/level pairs.
 * @returns True if all met.
 */
export function areDependenciesMet(
  enrollments: Ref<CourseEnrollment[]>,
  requiredDeps: { course: string, level: number }[]
): boolean {
  for (const dep of requiredDeps) {
    if (!isLevelCompleted(enrollments, dep.course, dep.level)) return false
  }
  return true
}

/**
 * Checks if a course can be enrolled (not already enrolled and deps met).
 * @param enrollments - The enrollments ref.
 * @param slug - Course slug.
 * @param requiredDeps - Dependency requirements.
 * @returns True if enrollment is possible.
 */
export function canEnroll(
  enrollments: Ref<CourseEnrollment[]>,
  slug: string,
  requiredDeps: { course: string, level: number }[]
): boolean {
  if (isEnrolled(enrollments, slug)) return false
  return areDependenciesMet(enrollments, requiredDeps)
}

/**
 * Checks if a degree is enrolled.
 * @param degreeEnrollments - The degree enrollments ref.
 * @param degreeSlug - Degree slug.
 * @returns True if enrolled.
 */
export function isDegreeEnrolledFn(degreeEnrollments: Ref<DegreeEnrollment[]>, degreeSlug: string): boolean {
  return isDegreeEnrolled(degreeEnrollments.value, degreeSlug)
}

/**
 * Gets degree enrollment data.
 * @param degreeEnrollments - The degree enrollments ref.
 * @param degreeSlug - Degree slug.
 * @returns Degree enrollment or undefined.
 */
export function getDegreeEnrollmentFn(
  degreeEnrollments: Ref<DegreeEnrollment[]>,
  degreeSlug: string
): DegreeEnrollment | undefined {
  return getDegreeEnrollment(degreeEnrollments.value, degreeSlug)
}

/**
 * Enrolls in a degree program.
 * @param degreeEnrollments - The degree enrollments ref.
 * @param degreeSlug - Degree slug.
 * @param title - Title name.
 */
export function enrollInDegree(degreeEnrollments: Ref<DegreeEnrollment[]>, degreeSlug: string, title: string) {
  const existing = degreeEnrollments.value.find(d => d.degreeSlug === degreeSlug)
  if (existing) {
    existing.title = title
  } else {
    degreeEnrollments.value.push({ degreeSlug, title, enrolledAt: Date.now() })
  }
}

/**
 * Unenrolls from a degree program.
 * @param degreeEnrollments - The degree enrollments ref.
 * @param degreeSlug - Degree slug.
 */
export function unenrollFromDegree(degreeEnrollments: Ref<DegreeEnrollment[]>, degreeSlug: string) {
  degreeEnrollments.value = degreeEnrollments.value.filter(d => d.degreeSlug !== degreeSlug)
}

/**
 * Checks if any course from a degree is enrolled.
 * @param enrollments - The enrollments ref.
 * @param degreeSlug - Degree slug.
 * @returns True if any course from that degree is enrolled.
 */
export function hasDegreeEnrollment(enrollments: Ref<CourseEnrollment[]>, degreeSlug: string): boolean {
  return enrollments.value.some(e => e.degree === degreeSlug)
}

/**
 * Joins a club if degree requirement is met.
 * @param clubMemberships - The club memberships ref.
 * @param clubSlug - Club slug.
 * @param hasRequiredDegree - Whether the required degree is met.
 * @returns True if join succeeded.
 */
export function joinClubFn(
  clubMemberships: Ref<ClubMembership[]>,
  clubSlug: string,
  hasRequiredDegree: boolean
): boolean {
  return joinClub(clubMemberships.value, clubSlug, hasRequiredDegree)
}

/**
 * Leaves a club.
 * @param clubMemberships - The club memberships ref.
 * @param clubSlug - Club slug.
 */
export function leaveClubFn(clubMemberships: Ref<ClubMembership[]>, clubSlug: string) {
  leaveClub(clubMemberships.value, clubSlug)
}

/**
 * Checks if a user is a club member.
 * @param clubMemberships - The club memberships ref.
 * @param clubSlug - Club slug.
 * @returns True if member.
 */
export function isClubMemberFn(clubMemberships: Ref<ClubMembership[]>, clubSlug: string): boolean {
  return isClubMember(clubMemberships.value, clubSlug)
}

/**
 * Gets activity slugs for all joined clubs.
 * @param clubMemberships - The club memberships ref.
 * @param clubActivitiesMap - Map of club slugs to activity slugs.
 * @returns Array of activity slugs.
 */
export function getClubActivitySlugsFn(
  clubMemberships: Ref<ClubMembership[]>,
  clubActivitiesMap: Record<string, string[]>
): string[] {
  return getClubActivitySlugs(clubMemberships.value, clubActivitiesMap)
}

/**
 * Toggles an exam task completion.
 * @param examTasks - The exam tasks ref.
 * @param courseSlug - Course slug.
 * @param level - Level number.
 * @param taskId - Task ID.
 */
export function toggleExamTaskFn(
  examTasks: Ref<ExamTaskCompletion[]>,
  courseSlug: string, level: number, taskId: number
) {
  toggleExamTask(examTasks.value, courseSlug, level, taskId)
}

/**
 * Checks if an exam task is completed.
 * @param examTasks - The exam tasks ref.
 * @param courseSlug - Course slug.
 * @param level - Level number.
 * @param taskId - Task ID.
 * @returns True if completed.
 */
export function isExamTaskCompletedFn(
  examTasks: Ref<ExamTaskCompletion[]>,
  courseSlug: string, level: number, taskId: number
): boolean {
  return isExamTaskCompleted(examTasks.value, courseSlug, level, taskId)
}

/**
 * Enrollment storage data structure.
 */
export interface EnrollmentStorageData {
  profile?: unknown
  enrollments?: unknown
  degreeEnrollments?: unknown
  flashcardAnswers?: unknown
  cardSpacedRep?: unknown
  detentionCount?: number
  metricProgress?: unknown
  clubMemberships?: unknown
  examTasks?: unknown
  version?: number
}

/**
 * Saves enrollment data to localStorage.
 * @param data - The storage data object.
 */
export function saveEnrollmentToStorage(data: EnrollmentStorageData) {
  if (!import.meta.client) return
  try {
    storageSetItem('kiss-enrollment', JSON.stringify(data))
  } catch {
    /* noop */
  }
}

/**
 * Loads enrollment data from localStorage.
 * @returns Parsed storage data or null.
 */
export function loadEnrollmentFromStorage(): EnrollmentStorageData | null {
  if (!import.meta.client) return null
  try {
    const raw = storageGetItem('kiss-enrollment')
    if (!raw) return null
    return JSON.parse(raw) as EnrollmentStorageData
  } catch {
    return null
  }
}

/**
 * Applies loaded enrollment data to profile state.
 * @param data - The loaded storage data.
 * @param profile - Profile ref.
 * @param enrollments - Enrollments ref.
 * @param degreeEnrollments - Degree enrollments ref.
 * @param flashcardAnswers - Flashcard answers ref.
 * @param cardSpacedRep - Card spaced repetition ref.
 * @param detentionCount - Detention count ref.
 * @param metricProgress - Metric progress ref.
 * @param clubMemberships - Club memberships ref.
 * @param examTasks - Exam tasks ref.
 * @param defaultStats - Default character stats.
 * @param defaultCustomization - Default character customization.
 * @param createDefaultAchievements - Function to create default achievements.
 */
export function applyLoadedEnrollmentData(
  data: EnrollmentStorageData,
  profile: Ref<UserProfile>,
  enrollments: Ref<CourseEnrollment[]>,
  degreeEnrollments: Ref<DegreeEnrollment[]>,
  flashcardAnswers: Ref<unknown[]>,
  cardSpacedRep: Ref<unknown[]>,
  detentionCount: Ref<number>,
  metricProgress: Ref<unknown[]>,
  clubMemberships: Ref<ClubMembership[]>,
  examTasks: Ref<ExamTaskCompletion[]>,
  defaultStats: Record<string, number>,
  defaultCustomization: Record<string, unknown>,
  createDefaultAchievements: () => unknown[]
) {
  if (data.profile) {
    const p = data.profile as UserProfile
    profile.value = {
      ...profile.value, ...p,
      stats: { ...defaultStats, ...(p.stats || {}) },
      customization: { ...defaultCustomization, ...(p.customization || {}) },
      achievements: p.achievements || createDefaultAchievements(),
      xp: p.xp ?? 0, level: p.level ?? 1
    }
  }
  if (data.enrollments) enrollments.value = data.enrollments as CourseEnrollment[]
  if (data.flashcardAnswers) flashcardAnswers.value = data.flashcardAnswers as unknown[]
  if (data.cardSpacedRep) cardSpacedRep.value = data.cardSpacedRep as unknown[]
  if (typeof data.detentionCount === 'number') detentionCount.value = data.detentionCount
  if (data.metricProgress && (data.version ?? 0) >= 7) metricProgress.value = data.metricProgress as unknown[]
  if (data.clubMemberships && (data.version ?? 0) >= 8) clubMemberships.value = data.clubMemberships as ClubMembership[]
  if (data.examTasks && (data.version ?? 0) >= 9) examTasks.value = data.examTasks as ExamTaskCompletion[]
  if (data.degreeEnrollments && (data.version ?? 0) >= 10) degreeEnrollments.value = data.degreeEnrollments as DegreeEnrollment[]
}

/**
 * Computes enrolled course slugs from enrollments.
 * @param enrollments - Array of course enrollments.
 * @returns Array of enrolled course slugs.
 */
export function getEnrolledCourseSlugs(enrollments: CourseEnrollment[]): string[] {
  return enrollments.map(e => e.slug)
}

/**
 * Counts completed levels across all enrollments.
 * @param enrollments - Array of course enrollments.
 * @returns Total completed level count.
 */
export function countCompletedLevels(enrollments: CourseEnrollment[]): number {
  return enrollments.reduce((sum, e) => sum + e.levels.filter(l => l.completed).length, 0)
}

/**
 * Counts fully completed courses.
 * @param enrollments - Array of course enrollments.
 * @returns Number of fully completed courses.
 */
export function countCompletedCourses(enrollments: CourseEnrollment[]): number {
  return enrollments.filter(e => e.levels.length > 0 && e.levels.every(l => l.completed)).length
}

/**
 * Gets enrolled degree slugs.
 * @param degreeEnrollments - Array of degree enrollments.
 * @returns Array of enrolled degree slugs.
 */
export function getEnrolledDegreeSlugs(degreeEnrollments: DegreeEnrollment[]): string[] {
  return degreeEnrollments.map(d => d.degreeSlug)
}
