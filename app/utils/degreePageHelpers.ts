/**
 * Helper functions for degree page logic.
 * Extracted from useDegreePage to keep the composable within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'

/**
 * Degree level class definition.
 */
export interface DegreeLevelCourse {
  slug: string
  level: number
}

/**
 * Degree level definition.
 */
export interface DegreeLevel {
  name: string
  description: string
  courses: DegreeLevelCourse[]
}

/**
 * Course info for a degree page.
 */
export interface DegreeCourseInfo {
  slug: string
  degree: string
  courseName: string
  courseTitle: string
  maxLevel: number
  availableLevels: number[]
  isEnrolled: boolean
  completedLevels: number
  totalLevels: number
  image: string
  degreeLabel: string
  isCrossDegree: boolean
  // Prerequisites for the first level of this course
  prerequisites: { course: string, level: number }[]
}

/**
 * Builds a single DegreeCourseInfo for a course and level.
 */
function buildSingleCourseInfo(
  dc: DegreeLevelCourse,
  allCourses: unknown[],
  degreeId: string,
  baseURL: string,
  store: ReturnType<typeof useEnrollmentStore>
): DegreeCourseInfo {
  const courseName = dc.slug
  const degree = degreeId
  const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const courseTitle = courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const prefix = `courses/${courseName}/`
  const courseLevels = allCourses
    .filter(item => (item as { stem?: string }).stem?.startsWith(prefix))
    .map((item) => {
      const parts = (item as { stem?: string }).stem?.split('/') || []
      const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
      return {
        level,
        dependencies: (item as { meta?: { dependencies?: unknown[] } }).meta?.dependencies || []
      }
    })
    .filter(item => !isNaN(item.level))
    .sort((a, b) => a.level - b.level)

  const availableLevels = courseLevels
    .filter(item => item.level <= dc.level)
    .map(item => item.level)

  const allPrerequisites = getCoursePrerequisites(courseName, dc.level, allCourses)

  const isEnrolled = store.isEnrolled(courseName)
  const enrollment = store.getEnrollment(courseName)
  const completedLevels = enrollment
    ? enrollment.levels.filter((l: { completed: boolean }) => l.completed).length
    : 0

  return {
    slug: courseName,
    degree,
    courseName,
    courseTitle,
    maxLevel: dc.level,
    availableLevels,
    isEnrolled,
    completedLevels,
    totalLevels: availableLevels.length,
    image: `${baseURL}img/degrees/${degree}.webp`,
    degreeLabel,
    isCrossDegree: false,
    prerequisites: allPrerequisites
  }
}

/**
 * Builds course info array for a selected degree level.
 */
export function buildCourseInfos(
  selectedLevel: DegreeLevel | null,
  allCourses: unknown[],
  degreeId: string,
  baseURL: string,
  store: ReturnType<typeof useEnrollmentStore>
): DegreeCourseInfo[] {
  if (!selectedLevel || !allCourses.length) return []
  const result: DegreeCourseInfo[] = []
  const seenSlugs = new Set<string>()

  for (const dc of selectedLevel.courses) {
    if (seenSlugs.has(dc.slug)) continue
    seenSlugs.add(dc.slug)
    result.push(buildSingleCourseInfo(dc, allCourses, degreeId, baseURL, store))
  }
  return result
}

/**
 * Builds cumulative course info including all courses from the selected title and lower titles.
 */
export function buildCumulativeCourseInfos(
  degreeLevels: DegreeLevel[],
  selectedLevelIndex: number,
  allCourses: unknown[],
  degreeId: string,
  baseURL: string,
  store: ReturnType<typeof useEnrollmentStore>
): DegreeCourseInfo[] {
  if (degreeLevels.length === 0 || !allCourses.length) return []
  const selectedLevel = degreeLevels[selectedLevelIndex]
  if (!selectedLevel) return []

  // Collect all courses from all titles up to and including the selected one
  const seenSlugs = new Map<string, number>()
  for (let i = 0; i <= selectedLevelIndex; i++) {
    const level = degreeLevels[i]
    if (!level) continue
    for (const dc of level.courses) {
      const currentMax = seenSlugs.get(dc.slug) ?? 0
      if (dc.level > currentMax) {
        seenSlugs.set(dc.slug, dc.level)
      }
    }
  }

  // Build course infos for cumulative courses
  const result: DegreeCourseInfo[] = []
  const seenResultSlugs = new Set<string>()
  for (const [slug, maxLevel] of seenSlugs.entries()) {
    if (seenResultSlugs.has(slug)) continue
    seenResultSlugs.add(slug)
    const dc: DegreeLevelCourse = { slug, level: maxLevel }
    result.push(buildSingleCourseInfo(dc, allCourses, degreeId, baseURL, store))
  }
  return result
}

/**
 * Extracts prerequisites for a course up to the given level.
 */
export function getCoursePrerequisites(
  courseName: string,
  maxLevel: number,
  allCourses: unknown[]
): { course: string, level: number }[] {
  const prefix = `courses/${courseName}/`
  const allPrerequisites: { course: string, level: number }[] = []
  const seenPrereqKeys = new Set<string>()

  const courseLevels = allCourses
    .filter(item => (item as { stem?: string }).stem?.startsWith(prefix))
    .map((item) => {
      const parts = (item as { stem?: string }).stem?.split('/') || []
      const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
      return {
        level,
        dependencies: (item as { meta?: { dependencies?: unknown[] } }).meta?.dependencies || []
      }
    })
    .filter(item => !isNaN(item.level) && item.level <= maxLevel)

  for (const cl of courseLevels) {
    for (const dep of cl.dependencies) {
      const d = dep as { class?: string, level?: number }
      if (d.class && d.level != null) {
        const key = `${d.class}-${d.level}`
        if (!seenPrereqKeys.has(key)) {
          seenPrereqKeys.add(key)
          allPrerequisites.push({ course: d.class, level: d.level })
        }
      }
    }
  }
  return allPrerequisites
}

/**
 * Enrolls in a single course for a degree, respecting prerequisites.
 */
function enrollSingleCourseForDegree(
  courseName: string, dc: DegreeLevelCourse, allCourses: unknown[], degreeId: string, store: ReturnType<typeof useEnrollmentStore>
) {
  if (store.isEnrolled(courseName)) return
  const prerequisites = getCoursePrerequisites(courseName, dc.level, allCourses)
  const externalPrerequisites = prerequisites.filter(p => p.course !== courseName)
  if (externalPrerequisites.length > 0 && !store.areDependenciesMet(courseName, dc.level, externalPrerequisites)) return
  const prefix = `courses/${courseName}/`
  const levels = allCourses
    .filter(item => (item as { stem?: string }).stem?.startsWith(prefix))
    .map((item) => {
      const parts = (item as { stem?: string }).stem?.split('/') || []
      return parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
    })
    .filter(l => !isNaN(l) && l <= dc.level)
    .sort((a, b) => a - b)
  store.enrollInCourse(courseName, courseName, degreeId, levels)
}

/**
 * Enrolls in a degree and its courses, respecting prerequisites.
 */
export function enrollInDegreeForPage(
  degreeId: string,
  titleName: string,
  selectedLevel: DegreeLevel,
  allCourses: unknown[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.enrollInDegree(degreeId, titleName)
  for (const dc of selectedLevel.courses) {
    enrollSingleCourseForDegree(dc.slug, dc, allCourses, degreeId, store)
  }
}

/**
 * Checks and enrolls in newly available courses whose prerequisites are now met.
 */
export function checkAndEnrollAvailableCourses(
  degreeId: string,
  selectedLevel: DegreeLevel,
  allCourses: unknown[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  for (const dc of selectedLevel.courses) {
    enrollSingleCourseForDegree(dc.slug, dc, allCourses, degreeId, store)
  }
}

/**
 * Collects all unique course slugs up to the given level index.
 */
export function getCumulativeCourseSlugs(degreeLevels: DegreeLevel[], upToIndex: number): Set<string> {
  const slugs = new Set<string>()
  for (let i = 0; i <= upToIndex && i < degreeLevels.length; i++) {
    for (const dc of degreeLevels[i].courses) {
      slugs.add(dc.slug)
    }
  }
  return slugs
}

/**
 * Unenrolls from a degree and all its cumulative courses.
 */
export function unenrollFromDegreeForPage(
  degreeId: string, enrolledLevelIndex: number, degreeLevels: DegreeLevel[], store: ReturnType<typeof useEnrollmentStore>
) {
  const courseSlugs = getCumulativeCourseSlugs(degreeLevels, enrolledLevelIndex)
  for (const courseName of courseSlugs) {
    if (store.isEnrolled(courseName)) store.unenrollFromCourse(courseName)
  }
  store.unenrollFromDegree(degreeId)
}

/**
 * Leaves all clubs that require a specific degree.
 */
export function leaveClubsForDegree(
  degreeId: string,
  clubs: { requiredDegree?: string, _path?: string }[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  for (const club of clubs) {
    if (club.requiredDegree === degreeId) {
      const clubSlug = club._path?.split('/').pop()
      if (clubSlug && store.isClubMember(clubSlug)) {
        store.leaveClub(clubSlug)
      }
    }
  }
}

/**
 * Unenrolls from courses removed when switching degree titles.
 */
export function unenrollRemovedCourses(
  degreeLevels: DegreeLevel[], oldTitleIndex: number, newTitleIndex: number, store: ReturnType<typeof useEnrollmentStore>
) {
  const oldCourses = getCumulativeCourseSlugs(degreeLevels, oldTitleIndex)
  const newCourses = getCumulativeCourseSlugs(degreeLevels, newTitleIndex)
  for (const slug of oldCourses) {
    if (!newCourses.has(slug) && store.isEnrolled(slug)) {
      store.unenrollFromCourse(slug)
    }
  }
}
