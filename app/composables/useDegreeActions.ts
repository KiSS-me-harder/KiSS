/**
 * Composable for degree page actions: auto-enrollment, unenrollment, and title completion checks.
 * Extracted from useDegreePage to keep the main composable within line limits.
 */
import { useEnrollmentStore } from '~/stores/enrollment'
import {
  checkAndEnrollAvailableCourses, unenrollFromDegreeForPage,
  leaveClubsForDegree
} from '~/utils/degreePageHelpers'
import { checkTitleCompleted } from '~/utils/degreeMetadata'
import type { DegreeLevel } from '~/utils/degreePageHelpers'

export function useDegreeActions(
  id: ComputedRef<string>,
  degreeLevels: ComputedRef<DegreeLevel[]>,
  selectedLevelIndex: Ref<number>,
  selectedLevel: ComputedRef<DegreeLevel | null>,
  allCourses: ComputedRef<unknown[]>
) {
  const store = useEnrollmentStore()

  const { data: allClubs } = useAsyncData('all-clubs-degree', () => queryCollection('clubs').all())

  // Auto-enrollment: watch for enrollment changes and check for newly available courses
  watch(
    () => (store.enrollments as unknown as CourseEnrollment[]).map(
      (e: { slug: string, levels: { level: number, completed: boolean }[] }) => ({
        slug: e.slug,
        levels: e.levels.map((l: { level: number, completed: boolean }) => ({ level: l.level, completed: l.completed }))
      })
    ),
    () => {
      if (!selectedLevel.value) return
      checkAndEnrollAvailableCourses(id.value, selectedLevel.value, allCourses.value || [], store)
    },
    { deep: true }
  )

  /**
   * Handles unenrolling from a degree and all its courses, plus leaving related clubs.
   */
  function handleUnenrollFromDegree() {
    const currentEnrollment = store.getDegreeEnrollment(id.value)
    if (!currentEnrollment) return
    const enrolledTitleIndex = degreeLevels.value.findIndex(l => l.name === currentEnrollment.title)
    const levelIndexToUse = enrolledTitleIndex >= 0 ? enrolledTitleIndex : selectedLevelIndex.value
    unenrollFromDegreeForPage(id.value, levelIndexToUse, degreeLevels.value, store)
    const clubs = allClubs.value as { requiredDegree?: string, _path?: string }[] | undefined
    if (clubs) leaveClubsForDegree(id.value, clubs, store)
    selectedLevelIndex.value = 0
  }

  /**
   * Checks if a title/level is fully completed.
   */
  function isTitleCompleted(titleIndex: number): boolean {
    return checkTitleCompleted(titleIndex, degreeLevels.value, allCourses.value || [], store)
  }

  return { handleUnenrollFromDegree, isTitleCompleted }
}
