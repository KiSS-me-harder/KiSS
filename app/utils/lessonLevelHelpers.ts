/**
 * Level navigation helper functions for lesson pages.
 * Extracted from useLessonPage to keep the composable within line limits.
 */

/**
 * Sorted level data entry.
 */
export interface SortedLevelEntry {
  level: number
  title: string
  item: unknown
}

/**
 * Level navigation link.
 */
export interface LevelNavigation {
  level: number
  path: string
}

/**
 * Builds sorted level data from class level items.
 * @param classLevels - Array of class level content items.
 * @returns Sorted array of level entries.
 */
export function buildSortedLevels(classLevels: unknown[]): SortedLevelEntry[] {
  if (!classLevels) return []
  return classLevels
    .filter(item => !(item as { stem?: string }).stem?.endsWith('/_index'))
    .map((item) => {
      const parts = (item as { stem?: string }).stem?.split('/') || []
      const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : NaN
      return {
        level,
        title: (item as { title?: string }).title || '',
        item
      }
    })
    .filter(l => !isNaN(l.level))
    .sort((a, b) => a.level - b.level)
}

/**
 * Finds the previous level navigation link.
 * @param sortedLevels - Sorted level entries.
 * @param currentLevel - The current level number.
 * @param slug - The class slug.
 * @returns Navigation object or null if no previous level.
 */
export function findPreviousLevel(
  sortedLevels: SortedLevelEntry[],
  currentLevel: number,
  _degree: string,
  slug: string
): LevelNavigation | null {
  const idx = sortedLevels.findIndex(l => l.level === currentLevel)
  if (idx <= 0) return null
  const prev = sortedLevels[idx - 1]!
  return { level: prev.level, path: `/courses/${slug}/${prev.level}` }
}

/**
 * Finds the next level navigation link.
 * @param sortedLevels - Sorted level entries.
 * @param currentLevel - The current level number.
 * @param slug - The class slug.
 * @returns Navigation object or null if no next level.
 */
export function findNextLevel(
  sortedLevels: SortedLevelEntry[],
  currentLevel: number,
  _degree: string,
  slug: string
): LevelNavigation | null {
  const idx = sortedLevels.findIndex(l => l.level === currentLevel)
  if (idx === -1 || idx >= sortedLevels.length - 1) return null
  const next = sortedLevels[idx + 1]!
  return { level: next.level, path: `/courses/${slug}/${next.level}` }
}

/**
 * Returns the badge color class for a level number.
 * @param level - The level number.
 * @returns Tailwind CSS background color class.
 */
export function getLevelBadgeColor(level: number): string {
  if (level >= 100 && level < 200) return 'bg-green-500/90'
  if (level >= 200 && level < 300) return 'bg-blue-500/90'
  if (level >= 300 && level < 400) return 'bg-red-500/90'
  return 'bg-gray-500/90'
}

/**
 * Parses lesson data from a content item.
 * @param item - The current level content item.
 * @param degree - The degree slug.
 * @param slug - The class slug.
 * @param baseURL - The base URL for assets.
 * @returns Parsed lesson data object.
 */
export function parseLessonData(
  item: unknown,
  degree: string,
  slug: string,
  baseURL: string
) {
  const parts = (item as { stem?: string }).stem?.split('/') || []
  const level = parts.length >= 3 ? parseInt(parts[2] ?? '', 10) : 0
  const className = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const flashcards = ((item as { flashcards?: unknown }).flashcards as { question: string, options: string[], correctIndex: number }[]) || []
  const exam: (string | { type: string, text: string, metric: string, field: string, target: number, label: string, unit: string })[] = []
  const metrics: { id: string, label: string, target: number, unit: string }[] = []
  const body = typeof (item as { body?: unknown }).body === 'string' ? (item as { body: string }).body : ''
  return {
    title: (item as { title?: string }).title || '',
    level,
    className,
    degree,
    degreeLabel,
    image: `${baseURL}img/degrees/${degree}.webp`,
    body,
    contentItem: item,
    flashcards,
    exam,
    metrics
  }
}
