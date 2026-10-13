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
 * Builds a single DegreeCourseInfo object for a given course and level.
 * @param dc - The degree level course.
 * @param allCourses - All course content entries.
 * @param degreeId - The current degree slug.
 * @param baseURL - Base URL for assets.
 * @param store - The enrollment store.
 * @returns Degree course info object.
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
 * @param selectedLevel - The selected degree level.
 * @param allCourses - All course content entries.
 * @param degreeId - The current degree slug.
 * @param baseURL - Base URL for assets.
 * @param store - The enrollment store.
 * @returns Array of degree course info objects.
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
 * Builds cumulative course info array including all courses from the selected title
 * and all lower titles, deduplicated by course slug (keeping the highest level).
 * @param degreeLevels - All degree levels ordered from lowest to highest.
 * @param selectedLevelIndex - The index of the selected title level.
 * @param allCourses - All course content entries.
 * @param degreeId - The current degree slug.
 * @param baseURL - Base URL for assets.
 * @param store - The enrollment store.
 * @returns Array of degree course info objects with cumulative courses.
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
 * Extracts prerequisites for a course up to the given level from all course content.
 * @param courseName - The course slug.
 * @param maxLevel - The maximum level to include.
 * @param allCourses - All course content entries.
 * @returns Array of prerequisite objects.
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
 * Handles enrolling in a degree and its courses, respecting prerequisites (page-level).
 * Only enrolls in courses whose prerequisites are currently met.
 * @param degreeId - The degree slug.
 * @param titleName - The title/level name.
 * @param selectedLevel - The selected degree level.
 * @param allCourses - All course content entries.
 * @param store - The enrollment store.
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
    const courseName = dc.slug
    if (!store.isEnrolled(courseName)) {
      // Extract prerequisites for this course up to the selected level
      const prerequisites = getCoursePrerequisites(courseName, dc.level, allCourses)
      // Only enroll if prerequisites are met
      if (prerequisites.length === 0 || store.areDependenciesMet(courseName, dc.level, prerequisites)) {
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
    }
  }
}

/**
 * Checks and enrolls in any newly available courses for a degree whose prerequisites are now met.
 * Used for auto-enrollment on course completion and "Complete Enrollment" button.
 * @param degreeId - The degree slug.
 * @param selectedLevel - The selected degree level.
 * @param allCourses - All course content entries.
 * @param store - The enrollment store.
 */
export function checkAndEnrollAvailableCourses(
  degreeId: string,
  selectedLevel: DegreeLevel,
  allCourses: unknown[],
  store: ReturnType<typeof useEnrollmentStore>
) {
  for (const dc of selectedLevel.courses) {
    const courseName = dc.slug
    if (!store.isEnrolled(courseName)) {
      const prerequisites = getCoursePrerequisites(courseName, dc.level, allCourses)
      if (prerequisites.length === 0 || store.areDependenciesMet(courseName, dc.level, prerequisites)) {
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
    }
  }
}

/**
 * Handles unenrolling from a degree and all its courses (page-level).
 * @param degreeId - The degree slug.
 * @param titleName - The title/level name.
 * @param selectedLevel - The selected degree level.
 * @param store - The enrollment store.
 */
export function unenrollFromDegreeForPage(
  degreeId: string,
  titleName: string,
  selectedLevel: DegreeLevel,
  store: ReturnType<typeof useEnrollmentStore>
) {
  store.unenrollFromDegree(degreeId)
  for (const dc of selectedLevel.courses) {
    const courseName = dc.slug
    if (store.isEnrolled(courseName)) {
      store.unenrollFromCourse(courseName)
    }
  }
}

/**
 * Checks if a title/level is fully completed.
 * @param titleIndex - The index of the title to check.
 * @param degreeLevels - Array of degree levels.
 * @param allCourses - All course content entries.
 * @param store - The enrollment store.
 * @returns True if all courses and levels are completed.
 */
export function checkTitleCompleted(
  titleIndex: number,
  degreeLevels: DegreeLevel[],
  allCourses: unknown[],
  store: ReturnType<typeof useEnrollmentStore>
): boolean {
  if (titleIndex >= degreeLevels.length) return false
  const title = degreeLevels[titleIndex]
  if (!title || !allCourses.length) return false
  for (const dc of title.courses) {
    const courseName = dc.slug
    if (!store.isEnrolled(courseName)) return false
    const prefix = `courses/${courseName}/`
    const levels = allCourses
      .filter(item => (item as { stem?: string }).stem?.startsWith(prefix))
      .map((item) => {
        const parts = (item as { stem?: string }).stem?.split('/') || []
        return parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
      })
      .filter(l => !isNaN(l) && l <= dc.level)
      .sort((a, b) => a - b)
    for (const level of levels) {
      if (!store.isLevelCompleted(courseName, level)) return false
    }
  }
  return true
}

/**
 * Returns the tier color class for a max level.
 * @param maxLevel - The maximum level number.
 * @returns Tailwind CSS background color class.
 */
export function getTierColor(maxLevel: number): string {
  if (maxLevel >= 300) return 'bg-red-500'
  if (maxLevel >= 200) return 'bg-blue-500'
  return 'bg-green-500'
}

/**
 * Returns the tier label for a max level.
 * @param maxLevel - The maximum level number.
 * @returns Tier label string.
 */
export function getTierLabel(maxLevel: number): string {
  if (maxLevel >= 300) return 'Tier 3'
  if (maxLevel >= 200) return 'Tier 2'
  return 'Tier 1'
}

/**
 * Builds structured data JSON-LD for a degree page.
 * @param degreeId - The degree slug.
 * @param title - The degree title.
 * @param description - The degree description.
 * @returns JSON string of structured data.
 */
export function buildDegreeStructuredData(degreeId: string, title: string | undefined, description: string | undefined): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `https://kiss-academy.github.io/KiSS/degrees/${degreeId}#course`,
        'url': `https://kiss-academy.github.io/KiSS/degrees/${degreeId}`,
        'name': title,
        'description': description,
        'inLanguage': 'en',
        'provider': { '@type': 'Organization', 'name': 'KiSS Academy', 'url': 'https://kiss-academy.github.io/KiSS/' }
      },
      {
        '@type': 'WebPage',
        '@id': `https://kiss-academy.github.io/KiSS/degrees/${degreeId}#webpage`,
        'url': `https://kiss-academy.github.io/KiSS/degrees/${degreeId}`,
        'name': title,
        'description': description,
        'inLanguage': 'en',
        'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kiss-academy.github.io/KiSS/#website',
        'url': 'https://kiss-academy.github.io/KiSS/',
        'name': 'KiSS Academy',
        'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
        'inLanguage': 'en'
      }
    ]
  })
}
