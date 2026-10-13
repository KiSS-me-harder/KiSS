/**
 * Helper functions for building the navigation menu.
 * Extracted from useNavigationMenu to keep the composable within line limits.
 */
import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Menu children builder function type.
 */
export type MenuChildrenBuilder = () => NavigationMenuItem[]

/**
 * Builds menu children items from a content collection.
 * @param items - Array of content items with title and stem.
 * @param selectHandler - Callback fired on item selection.
 * @returns Array of navigation menu items.
 */
export function buildSimpleMenuChildren(
  items: { title: string, stem: string }[],
  selectHandler: () => void
): NavigationMenuItem[] {
  return items.map(item => ({
    label: item.title,
    to: `/${item.stem}`,
    onSelect: selectHandler
  }))
}

/**
 * Builds faculty menu children with teacher path mapping.
 * @param items - Array of faculty content items.
 * @param selectHandler - Callback fired on item selection.
 * @returns Array of navigation menu items.
 */
export function buildFacultyMenuChildren(
  items: { title: string, path: string }[],
  selectHandler: () => void
): NavigationMenuItem[] {
  return items.map(item => ({
    label: item.title,
    to: `/teachers/${item.path.split('/').pop() || ''}`,
    onSelect: selectHandler
  }))
}

/**
 * Builds course menu children, deduplicating by course slug.
 * @param items - Array of course content items.
 * @param selectHandler - Callback fired on item selection.
 * @returns Sorted array of unique navigation menu items.
 */
export function buildCoursesMenuChildren(
  items: { stem: string, meta?: { course?: string } }[],
  selectHandler: () => void
): NavigationMenuItem[] {
  const courseMap = new Map<string, { label: string, to: string }>()
  for (const item of items) {
    const parts = item.stem?.split('/') || []
    if (parts.length < 3) continue
    const courseName = parts[1]
    if (!courseName) continue
    if (!courseMap.has(courseName)) {
      const courseTitle = courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      courseMap.set(courseName, { label: courseTitle, to: `/courses/${courseName}` })
    }
  }
  return Array.from(courseMap.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(item => ({ ...item, onSelect: selectHandler }))
}

/**
 * Builds the static library submenu items.
 * @param selectHandler - Callback fired on item selection.
 * @returns Array of library submenu items.
 */
export function buildLibraryMenuChildren(selectHandler: () => void): NavigationMenuItem[] {
  return [
    { label: 'All Media', to: '/library', onSelect: selectHandler },
    { label: 'Videos', to: '/library/videos', onSelect: selectHandler },
    { label: 'Images', to: '/library/images', onSelect: selectHandler },
    { label: 'Audio', to: '/library/audio', onSelect: selectHandler },
    { label: 'Books', to: '/library/books', onSelect: selectHandler }
  ]
}

/**
 * Builds the static tools submenu items.
 * @param selectHandler - Callback fired on item selection.
 * @returns Array of tools submenu items.
 */
export function buildToolsMenuChildren(selectHandler: () => void): NavigationMenuItem[] {
  return [
    { label: 'Binaural Beats Creator', to: '/tools/binaural-beats', onSelect: selectHandler },
    { label: 'Spiral Visuals Creator', to: '/tools/spiral-visuals', onSelect: selectHandler },
    { label: 'Video Censor', to: '/tools/video-censor', onSelect: selectHandler }
  ]
}

/**
 * Builds the simple navigation items without children (Today, Shorts, Study Plan, etc.).
 * @param route - Current route object with path.
 * @param selectHandler - Callback fired on item selection.
 * @returns Array of simple navigation menu items.
 */
export function buildSimpleNavItems(route: { path: string }, selectHandler: () => void): NavigationMenuItem[] {
  return [
    { label: 'Today', icon: 'i-lucide-calendar-days', to: '/', onSelect: selectHandler },
    { label: 'Shorts', icon: 'i-lucide-clapperboard', to: '/shorts', onSelect: selectHandler },
    { label: 'Study Plan', icon: 'i-lucide-git-branch', to: '/study-plan', active: route.path.startsWith('/study-plan'), onSelect: selectHandler },
    { label: 'Flashcards', icon: 'i-lucide-playing-cards-fan', to: '/flashcards', onSelect: selectHandler },
    { label: 'Activities', icon: 'i-lucide-dumbbell', to: '/activities', active: route.path.startsWith('/activities'), onSelect: selectHandler },
    { label: 'Metrics', icon: 'i-lucide-chart-no-axes-combined', to: '/metrics', active: route.path.startsWith('/metrics'), onSelect: selectHandler }
  ]
}

/**
 * Builds the main navigation links array.
 * @param route - Current route object with path.
 * @param selectHandler - Callback fired on item selection.
 * @param degreesChildren - Degrees submenu items.
 * @param coursesChildren - Courses submenu items.
 * @param clubsChildren - Clubs submenu items.
 * @param punishmentsChildren - Detention submenu items.
 * @param facultyChildren - Teachers submenu items.
 * @returns Array containing one group of navigation menu items.
 */
export function buildNavigationLinks(
  route: { path: string },
  selectHandler: () => void,
  degreesChildren: NavigationMenuItem[],
  coursesChildren: NavigationMenuItem[],
  clubsChildren: NavigationMenuItem[],
  punishmentsChildren: NavigationMenuItem[],
  facultyChildren: NavigationMenuItem[]
): NavigationMenuItem[][] {
  const simpleItems = buildSimpleNavItems(route, selectHandler)
  return [[
    ...simpleItems,
    {
      label: 'Degrees',
      icon: 'i-lucide-graduation-cap',
      to: '/degrees',
      active: route.path.startsWith('/degrees'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: degreesChildren
    },
    {
      label: 'Courses',
      icon: 'i-lucide-book-text',
      to: '/courses',
      active: route.path.startsWith('/courses'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: coursesChildren
    },
    {
      label: 'Clubs',
      icon: 'i-lucide-users',
      to: '/clubs',
      active: route.path.startsWith('/clubs'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: clubsChildren
    },
    {
      label: 'Detention',
      icon: 'i-lucide-angry',
      to: '/detention',
      active: route.path.startsWith('/detention'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: punishmentsChildren
    },
    {
      label: 'Teachers',
      icon: 'i-lucide-presentation',
      to: '/teachers',
      active: route.path.startsWith('/teachers'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: facultyChildren
    },
    {
      label: 'Students',
      icon: 'i-lucide-users',
      to: '/students',
      active: route.path.startsWith('/students'),
      defaultOpen: false,
      onSelect: selectHandler
    },
    {
      label: 'Library',
      icon: 'i-lucide-library',
      to: '/library',
      active: route.path.startsWith('/library'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: buildLibraryMenuChildren(selectHandler)
    },
    {
      label: 'Tools',
      icon: 'i-lucide-wrench',
      to: '/tools',
      active: route.path.startsWith('/tools'),
      defaultOpen: false,
      onSelect: selectHandler,
      children: buildToolsMenuChildren(selectHandler)
    }
  ]]
}
