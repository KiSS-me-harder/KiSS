/**
 * Shared composable for lesson section navigation state.
 * Uses a singleton pattern so both the content wrapper and the sidebar
 * navigator components share the same reactive state.
 * Sections are extracted at build time from the markdown body,
 * while scroll tracking remains client-side.
 */

import type { LessonSection } from '~/utils/lessonLevelHelpers'

let singletonState: ReturnType<typeof createState> | null = null

function createState() {
  return {
    sections: ref<LessonSection[]>([]),
    activeSection: ref('')
  }
}

export function useLessonSections() {
  if (!singletonState) {
    singletonState = createState()
  }
  const { sections, activeSection } = singletonState

  /**
   * Sets the sections extracted from the lesson content at build time.
   * @param newSections - Array of section headings with IDs.
   */
  function setSections(newSections: LessonSection[]) {
    sections.value = newSections
  }

  /**
   * Scrolls to the specified section anchor smoothly and flashes it
   * in the theme's primary color to indicate navigation.
   * @param id - The section anchor ID.
   */
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeSection.value = id
      // Remove any existing flash class and re-add to restart animation
      el.classList.remove('section-flash')
      // Force reflow so the animation restarts if called again on the same element
      void el.offsetWidth
      el.classList.add('section-flash')
    }
  }

  /**
   * Updates the active section based on scroll position using IntersectionObserver.
   * @returns The IntersectionObserver instance for cleanup.
   */
  function trackActiveSection() {
    if (sections.value.length === 0) return null

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    }, { rootMargin: '-80px 0px -80% 0px', threshold: 0 })

    sections.value.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return observer
  }

  /**
   * Resets the singleton state. Should be called when navigating away
   * from a lesson page to clear stale section data.
   */
  function resetState() {
    singletonState = null
  }

  return {
    sections,
    activeSection,
    setSections,
    scrollToSection,
    trackActiveSection,
    resetState
  }
}
