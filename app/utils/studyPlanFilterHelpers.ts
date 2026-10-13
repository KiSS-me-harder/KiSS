/**
 * Helper functions for study plan filter state management.
 * Extracted from useStudyPlanFilters to keep the composable within line limits.
 */
import type { CourseInfo, DegreeTitle } from './studyPlanGraph'

/**
 * Determines the appropriate title for a degree based on enrollment level.
 * @param degreeSlug - The degree slug.
 * @param courseMap - Map of course slugs to course info.
 * @param degreeTitlesMap - Map of degree slugs to title definitions.
 * @param getEnrollment - Function to get enrollment for a course.
 * @returns The determined title name.
 */
export function determineTitleForDegree(
  degreeSlug: string,
  courseMap: Map<string, CourseInfo>,
  degreeTitlesMap: Map<string, DegreeTitle[]>,
  getEnrollment: (key: string) => { levels: { level: number }[] } | null
): string {
  const titles = degreeTitlesMap.get(degreeSlug)
  if (!titles || titles.length === 0) return 'Junior'
  let highestEnrolledLevel = 0
  for (const [key] of courseMap) {
    if (!key.startsWith(degreeSlug + '/')) continue
    const enrollment = getEnrollment(key)
    if (enrollment) {
      for (const lvl of enrollment.levels) {
        if (lvl.level > highestEnrolledLevel) highestEnrolledLevel = lvl.level
      }
    }
  }
  if (highestEnrolledLevel === 0) return titles[0]?.name || 'Junior'
  for (let i = titles.length - 1; i >= 0; i--) {
    const titleEntry = titles[i]
    if (!titleEntry) continue
    for (const tc of titleEntry.courses) {
      if (highestEnrolledLevel <= tc.maxLevel) return titleEntry.name
    }
  }
  return titles[titles.length - 1]?.name || titles[0]?.name || 'Junior'
}

/**
 * Loads initial filter state based on enrollments.
 * @param courseMap - Map of course slugs to course info.
 * @param allDegreesList - List of all degrees.
 * @param selectedDegrees - Set of selected degree slugs.
 * @param degreeTargetTitle - Map of degree slug to target title.
 * @param degreeEnrollments - Array of degree enrollments.
 * @param isEnrolled - Function to check if a course is enrolled.
 * @param getDegreeEnrollment - Function to get degree enrollment.
 * @param selectDegree - Function to select a degree.
 * @param setTargetTitle - Function to set target title.
 * @param getTargetTitle - Function to get target title.
 * @param degreeTitlesMap - Map of degree slugs to title definitions.
 * @param getEnrollment - Function to get enrollment for a course.
 * @param autoAddTargetCourses - Function to auto-add target courses.
 * @param onBuild - Callback to rebuild the graph.
 */
export function loadFilterState(
  courseMap: Map<string, CourseInfo>,
  allDegreesList: { slug: string, label: string }[],
  selectedDegrees: Set<string>,
  degreeTargetTitle: Record<string, string>,
  degreeEnrollments: { degreeSlug: string, title: string }[],
  isEnrolled: (key: string) => boolean,
  getDegreeEnrollment: (slug: string) => { title: string } | null,
  selectDegree: (slug: string) => void,
  setTargetTitle: (slug: string, title: string) => void,
  getTargetTitle: (slug: string) => string | undefined,
  degreeTitlesMap: Map<string, DegreeTitle[]>,
  getEnrollment: (key: string) => { levels: { level: number }[] } | null,
  autoAddTargetCourses: () => void,
  onBuild: () => void
): void {
  const enrolledDegrees = new Set<string>()
  for (const de of degreeEnrollments) enrolledDegrees.add(de.degreeSlug)
  for (const [key] of courseMap) {
    if (isEnrolled(key)) {
      const parts = key.split('/')
      if (parts.length >= 2 && parts[0]) enrolledDegrees.add(parts[0])
    }
  }
  // Always ensure enrolled degrees are selected, regardless of current filter state
  for (const d of allDegreesList) {
    if (enrolledDegrees.has(d.slug)) selectDegree(d.slug)
  }
  for (const d of allDegreesList) {
    if (enrolledDegrees.has(d.slug)) {
      const degEnrollment = getDegreeEnrollment(d.slug)
      if (degEnrollment) setTargetTitle(d.slug, degEnrollment.title)
      else setTargetTitle(d.slug, determineTitleForDegree(d.slug, courseMap, degreeTitlesMap, getEnrollment))
    } else if (!getTargetTitle(d.slug)) {
      const titles = degreeTitlesMap.get(d.slug)
      setTargetTitle(d.slug, titles?.[0]?.name || 'Junior')
    }
  }
  autoAddTargetCourses()
  onBuild()
}

/**
 * Enrolls in all selected courses up to their target levels.
 * @param courseMap - Map of course slugs to course info.
 * @param titleCourseSet - Set of course keys in target titles.
 * @param selectedDegrees - Set of selected degree slugs.
 * @param degreeTargetTitle - Map of degree slug to target title.
 * @param degreeTitlesMap - Map of degree slugs to title definitions.
 * @param isEnrolled - Function to check if a course is enrolled.
 * @param enrollInCourse - Function to enroll in a course.
 * @param enrolling - Ref tracking enrollment progress.
 * @param onBuild - Callback to rebuild the graph.
 */
export async function enrollAllSelected(
  courseMap: Map<string, CourseInfo>,
  titleCourseSet: Set<string>,
  selectedDegrees: string[],
  degreeTargetTitle: Record<string, string>,
  degreeTitlesMap: Map<string, DegreeTitle[]>,
  isEnrolled: (key: string) => boolean,
  enrollInCourse: (key: string, courseName: string, degree: string, levels: number[]) => void,
  enrolling: { value: boolean },
  onBuild: () => void
): Promise<void> {
  enrolling.value = true
  await new Promise(r => setTimeout(r, 300))
  for (const [key, info] of courseMap) {
    if (!titleCourseSet.has(key)) continue
    if (!isEnrolled(key)) {
      let maxLevel = 100
      for (const degreeSlug of selectedDegrees) {
        const targetTitle = degreeTargetTitle[degreeSlug]
        if (!targetTitle) continue
        const titles = degreeTitlesMap.get(degreeSlug)
        if (!titles) continue
        const title = titles.find(t => t.name === targetTitle)
        if (!title) continue
        const titleCourse = title.courses.find(c => c.slug === key)
        if (titleCourse) maxLevel = Math.max(maxLevel, titleCourse.maxLevel)
      }
      enrollInCourse(key, info.courseName, info.degree, info.levels.filter(l => l <= maxLevel))
    }
  }
  enrolling.value = false
  onBuild()
}
