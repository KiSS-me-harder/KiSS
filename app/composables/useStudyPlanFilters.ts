import type { CourseInfo, DegreeTitle } from '../utils/studyPlanGraph'
import type { useEnrollmentStore } from '~/stores/enrollment'
import { loadFilterState as loadFilterStateUtil, enrollAllSelected as enrollAllSelectedUtil } from '~/utils/studyPlanFilterHelpers'

/**
 * Filter state management for study plan (degree selection, title tracking, enrollment).
 */
export function useStudyPlanFilters(
  courseMap: ComputedRef<Map<string, CourseInfo>>,
  degreeTitlesMap: ComputedRef<Map<string, DegreeTitle[]>>,
  titleCourseSet: ComputedRef<Set<string>>,
  selectedDegrees: ComputedRef<Set<string>>,
  degreeTargetTitle: ComputedRef<Record<string, string>>,
  allDegreesList: ComputedRef<{ slug: string, label: string }[]>,
  planStore: ReturnType<typeof import('~/stores/studyPlan').useStudyPlanStore>,
  store: ReturnType<typeof useEnrollmentStore>
) {
  const enrollableCoursesCount = computed(() => {
    let count = 0
    for (const [key] of courseMap.value) {
      if (!titleCourseSet.value.has(key)) continue
      if (!store.isEnrolled(key)) count++
    }
    return count
  })

  function getDegreeTitles(degreeSlug: string): string[] {
    const titles = degreeTitlesMap.value.get(degreeSlug)
    if (!titles || titles.length === 0) return []
    return titles.map(t => t.name)
  }

  function autoAddTargetCourses() {
    for (const degreeSlug of selectedDegrees.value) {
      const targetTitle = degreeTargetTitle.value[degreeSlug]
      if (!targetTitle) continue
      const titles = degreeTitlesMap.value.get(degreeSlug)
      if (!titles) continue
      const title = titles.find(t => t.name === targetTitle)
      if (!title) continue
      for (const crs of title.courses) {
        planStore.addToStudyPlan(`${degreeSlug}/${crs.slug}`)
      }
    }
  }

  function loadFilterState(onBuild: () => void) {
    loadFilterStateUtil(courseMap.value, allDegreesList.value, selectedDegrees.value, degreeTargetTitle.value, store.degreeEnrollments, key => store.isEnrolled(key), slug => store.getDegreeEnrollment(slug) || null, slug => planStore.selectDegree(slug), (slug, title) => planStore.setTargetTitle(slug, title), slug => planStore.getTargetTitle(slug), degreeTitlesMap.value, key => store.getEnrollment(key) || null, autoAddTargetCourses, onBuild)
  }

  function onDegreeToggle(degreeSlug: string, onBuild: () => void) {
    if (planStore.isDegreeSelected(degreeSlug)) planStore.deselectDegree(degreeSlug)
    else {
      planStore.selectDegree(degreeSlug)
      if (!planStore.getTargetTitle(degreeSlug)) planStore.setTargetTitle(degreeSlug, getDegreeTitles(degreeSlug)[0] || 'Junior')
    }
    autoAddTargetCourses()
    onBuild()
  }

  function toggleAllDegrees(onBuild: () => void) {
    if (planStore.selectedDegrees.size === allDegreesList.value.length) {
      for (const d of allDegreesList.value) planStore.deselectDegree(d.slug)
    } else {
      for (const d of allDegreesList.value) {
        planStore.selectDegree(d.slug)
        if (!planStore.getTargetTitle(d.slug)) planStore.setTargetTitle(d.slug, getDegreeTitles(d.slug)[0] || 'Junior')
      }
    }
    autoAddTargetCourses()
    onBuild()
  }

  function onTitleChange(degreeSlug: string, titleName: string, onBuild: () => void) {
    planStore.setTargetTitle(degreeSlug, titleName)
    onBuild()
  }

  async function enrollAllSelected(enrolling: Ref<boolean>, onBuild: () => void) {
    await enrollAllSelectedUtil(courseMap.value, titleCourseSet.value, [...selectedDegrees.value], degreeTargetTitle.value, degreeTitlesMap.value, key => store.isEnrolled(key), (key, courseName, degree, levels) => store.enrollInCourse(key, courseName, degree, levels), enrolling, onBuild)
  }

  return {
    enrollableCoursesCount, getDegreeTitles, autoAddTargetCourses,
    loadFilterState, onDegreeToggle, toggleAllDegrees, onTitleChange, enrollAllSelected
  }
}
