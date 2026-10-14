/**
 * Metadata helpers for degree pages: title completion, tier colors, and structured data.
 * Extracted from degreePageHelpers to keep it within line limits.
 */
import type { useEnrollmentStore } from '~/stores/enrollment'
import type { DegreeLevel } from '~/utils/degreePageHelpers'

/**
 * Checks if a title/level is fully completed.
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
 */
export function getTierColor(maxLevel: number): string {
  if (maxLevel >= 300) return 'bg-red-500'
  if (maxLevel >= 200) return 'bg-blue-500'
  return 'bg-green-500'
}

/**
 * Returns the tier label for a max level.
 */
export function getTierLabel(maxLevel: number): string {
  if (maxLevel >= 300) return 'Tier 3'
  if (maxLevel >= 200) return 'Tier 2'
  return 'Tier 1'
}

/**
 * Builds structured data JSON-LD for a degree page.
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
