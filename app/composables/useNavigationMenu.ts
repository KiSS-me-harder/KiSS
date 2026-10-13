import type { NavigationMenuItem } from '@nuxt/ui'
import {
  buildCoursesMenuChildren, buildFacultyMenuChildren, buildNavigationLinks,
  buildSimpleMenuChildren
} from '~/utils/navigationMenuHelpers'

/**
 * Composable that builds the sidebar navigation menu for the default layout.
 * Queries degrees, classes, clubs, punishments, and faculty content to populate
 * the menu children dynamically.
 */
export async function useNavigationMenu(open: Ref<boolean>) {
  const route = useRoute()

  const { data: degrees } = await useAsyncData('layout-degrees', () => queryCollection('degrees').all())
  const { data: allCourses } = await useAsyncData('layout-courses', () => queryCollection('courses').all())
  const { data: clubs } = await useAsyncData('layout-clubs', () => queryCollection('clubs').all())
  const { data: punishments } = await useAsyncData('layout-punishments', () => queryCollection('punishments').all())
  const { data: faculty } = await useAsyncData('layout-faculty', () => queryCollection('faculty').all())

  const selectHandler = () => {
    open.value = false
  }

  const degreesChildren = computed(() =>
    buildSimpleMenuChildren(degrees.value || [], selectHandler)
  )

  const coursesChildren = computed(() =>
    buildCoursesMenuChildren(allCourses.value || [], selectHandler)
  )

  const clubsChildren = computed(() =>
    buildSimpleMenuChildren(clubs.value || [], selectHandler)
  )

  const punishmentsChildren = computed(() =>
    buildSimpleMenuChildren(punishments.value || [], selectHandler)
  )

  const facultyChildren = computed(() =>
    buildFacultyMenuChildren(faculty.value || [], selectHandler)
  )

  const links = computed<NavigationMenuItem[][]>(() =>
    buildNavigationLinks(
      route, selectHandler,
      degreesChildren.value, coursesChildren.value,
      clubsChildren.value, punishmentsChildren.value, facultyChildren.value
    )
  )

  const groups = computed(() => [{
    id: 'navigation',
    label: 'Navigation',
    items: links.value[0] || []
  }])

  return { links, groups }
}
