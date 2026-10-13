/**
 * Pure utility functions for enrollment domain operations.
 * These functions operate on plain arrays (no refs) and have no side effects
 * beyond mutating the passed arrays.
 */
import type { ClubMembership, ExamTaskCompletion, DegreeEnrollment } from '~/types/enrollment'

/**
 * Checks if a user is a member of the given club.
 * @param clubMemberships - Array of club memberships.
 * @param clubSlug - The slug identifier of the club.
 * @returns True if the user is a member of the club.
 */
export function isClubMember(clubMemberships: ClubMembership[], clubSlug: string): boolean {
  return clubMemberships.some(m => m.clubSlug === clubSlug)
}

/**
 * Joins a club if the user has the required degree.
 * @param clubMemberships - Array of club memberships (mutated).
 * @param clubSlug - The slug identifier of the club.
 * @param hasRequiredDegree - Whether the user meets degree requirements.
 * @returns True if the join was successful.
 */
export function joinClub(clubMemberships: ClubMembership[], clubSlug: string, hasRequiredDegree: boolean): boolean {
  if (!hasRequiredDegree) return false
  if (isClubMember(clubMemberships, clubSlug)) return true
  clubMemberships.push({ clubSlug, joinedAt: Date.now() })
  return true
}

/**
 * Leaves a club by removing the membership entry.
 * @param clubMemberships - Array of club memberships (mutated).
 * @param clubSlug - The slug identifier of the club to leave.
 */
export function leaveClub(clubMemberships: ClubMembership[], clubSlug: string) {
  const idx = clubMemberships.findIndex(m => m.clubSlug === clubSlug)
  if (idx !== -1) clubMemberships.splice(idx, 1)
}

/**
 * Collects all activity slugs from the activity map for the user's joined clubs.
 * @param clubMemberships - Array of club memberships.
 * @param clubActivitiesMap - Map from club slug to array of activity slugs.
 * @returns Array of all activity slugs for joined clubs.
 */
export function getClubActivitySlugs(
  clubMemberships: ClubMembership[],
  clubActivitiesMap: Record<string, string[]>
): string[] {
  const slugs: string[] = []
  for (const membership of clubMemberships) {
    const activities = clubActivitiesMap[membership.clubSlug]
    if (activities) {
      slugs.push(...activities)
    }
  }
  return slugs
}

/**
 * Toggles the completion state of an exam task.
 * If the task exists, its completed state is flipped.
 * If it doesn't exist, a new completed entry is added.
 * @param examTasks - Array of exam task completions (mutated).
 * @param courseSlug - The course slug.
 * @param level - The level number.
 * @param taskId - The task identifier.
 */
export function toggleExamTask(
  examTasks: ExamTaskCompletion[],
  courseSlug: string,
  level: number,
  taskId: number
) {
  const existing = examTasks.find(
    t => t.courseSlug === courseSlug && t.level === level && t.taskId === taskId
  )
  if (existing) {
    existing.completed = !existing.completed
    existing.completedAt = existing.completed ? Date.now() : undefined
  } else {
    examTasks.push({ courseSlug, level, taskId, completed: true, completedAt: Date.now() })
  }
}

/**
 * Checks if a specific exam task is marked as completed.
 * @param examTasks - Array of exam task completions.
 * @param courseSlug - The course slug.
 * @param level - The level number.
 * @param taskId - The task identifier.
 * @returns True if the task is completed.
 */
export function isExamTaskCompleted(
  examTasks: ExamTaskCompletion[],
  courseSlug: string,
  level: number,
  taskId: number
): boolean {
  const task = examTasks.find(
    t => t.courseSlug === courseSlug && t.level === level && t.taskId === taskId
  )
  return task?.completed ?? false
}

/**
 * Checks if the user is enrolled in a specific degree program.
 * @param degreeEnrollments - Array of degree enrollments.
 * @param degreeSlug - The degree slug to check.
 * @returns True if enrolled in the degree.
 */
export function isDegreeEnrolled(degreeEnrollments: DegreeEnrollment[], degreeSlug: string): boolean {
  return degreeEnrollments.some(d => d.degreeSlug === degreeSlug)
}

/**
 * Retrieves the enrollment record for a specific degree.
 * @param degreeEnrollments - Array of degree enrollments.
 * @param degreeSlug - The degree slug to find.
 * @returns The degree enrollment record, or undefined if not enrolled.
 */
export function getDegreeEnrollment(
  degreeEnrollments: DegreeEnrollment[],
  degreeSlug: string
): DegreeEnrollment | undefined {
  return degreeEnrollments.find(d => d.degreeSlug === degreeSlug)
}
