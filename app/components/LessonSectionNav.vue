<script setup lang="ts">
/**
 * Extracts section headings from the lesson content body at build time
 * and stores them in a shared composable state so the sidebar component
 * can access them. Also adds anchor IDs to the rendered content so
 * sidebar links work correctly.
 * This component only wraps the lesson content — the sidebar is rendered separately.
 */

import { extractLessonSections } from '~/utils/lessonLevelHelpers'

const props = defineProps<{
  levelParam: number
  body: unknown
}>()

const { setSections, trackActiveSection, resetState, scrollToSection } = useLessonSections()

// Extract sections when body becomes available (SSR:false = async data)
let observer: IntersectionObserver | null = null

function applySections() {
  const parsedSections = extractLessonSections(props.body, props.levelParam)
  setSections(parsedSections)
  // Add IDs to rendered elements matching the parsed sections
  nextTick(() => {
    const container = document.querySelector('.lesson-content')
    if (!container) return
    // Collect all candidate elements in DOM order
    const candidates: { el: Element, text: string }[] = []
    const headings = container.querySelectorAll('h2, h3, h4, h5, h6')
    for (const heading of headings) {
      const text = heading.textContent?.trim()
      if (text) candidates.push({ el: heading, text })
    }
    const paragraphs = container.querySelectorAll('p')
    for (const p of paragraphs) {
      const strong = p.querySelector('strong')
      if (strong && strong.textContent?.trim() && p.children.length === 1 && strong === p.firstChild) {
        candidates.push({ el: p, text: strong.textContent.trim() })
      }
    }
    // Sort by DOM position (source order)
    candidates.sort((a, b) => a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
    // Match each candidate to a parsed section by text
    for (const candidate of candidates) {
      const sectionIndex = parsedSections.findIndex(s => s.text === candidate.text)
      if (sectionIndex !== -1) {
        candidate.el.id = parsedSections[sectionIndex]!.id
        parsedSections.splice(sectionIndex, 1)
      }
    }
    if (observer) observer.disconnect()
    observer = trackActiveSection()
    // If URL has a hash fragment, scroll to and flash that section
    if (import.meta.client && window.location.hash) {
      const hashId = window.location.hash.slice(1)
      scrollToSection(hashId)
    }
  })
}

watch(
  () => props.body,
  (newBody) => {
    if (newBody) {
      applySections()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  resetState()
})
</script>

<template>
  <!-- Section container wrapper — wraps the lesson content -->
  <div class="lesson-content">
    <slot />
  </div>
</template>
