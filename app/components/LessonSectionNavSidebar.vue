<script setup lang="ts">
/**
 * Right-side section navigation sidebar for lesson pages.
 * On desktop (xl+), the sidebar is always visible.
 * On mobile, it opens as a slide-out overlay panel.
 * With scroll-based active section tracking.
 */

defineProps<{
  levelParam: number
}>()

const { sections, activeSection, scrollToSection } = useLessonSections()

const showMobileSidebar = ref(false)

/**
 * Opens the mobile sidebar overlay.
 */
function openSidebar() {
  showMobileSidebar.value = true
}

defineExpose({ openSidebar })
</script>

<template>
  <!-- Desktop: always-visible sidebar -->
  <aside class="hidden xl:block w-64 shrink-0">
    <div class="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div class="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-3">
        In this lesson
      </div>
      <nav class="space-y-1 border-l border-white/10">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="block px-3 py-1.5 text-sm border-l -ml-px transition-colors"
          :class="[
            section.level === 1 ? 'text-white font-medium' : 'text-white/60 pl-5',
            activeSection === section.id
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-white hover:border-white/30'
          ]"
          @click.prevent="scrollToSection(section.id)"
        >
          {{ section.text }}
        </a>
        <div v-if="sections.length === 0" class="px-3 py-2 text-sm text-white/40">
          No sections found
        </div>
      </nav>
    </div>
  </aside>

  <!-- Mobile: overlay sidebar -->
  <aside v-if="showMobileSidebar" class="fixed inset-0 z-50 xl:hidden">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showMobileSidebar = false" />
    <div class="absolute right-0 top-0 h-full w-72 bg-[#1a1a2e] border-l border-white/10 shadow-xl overflow-y-auto">
      <div class="sticky top-0 p-4 border-b border-white/10 bg-[#1a1a2e] flex items-center justify-between z-10">
        <span class="text-xs font-semibold text-muted uppercase tracking-wider">
          In this lesson
        </span>
        <UButton
          variant="ghost"
          color="default"
          size="xs"
          @click="showMobileSidebar = false"
        >
          <template #leading>
            <UIcon name="i-lucide-x" class="size-4" />
          </template>
        </UButton>
      </div>
      <nav class="p-3 space-y-1">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="block px-3 py-2 text-sm rounded-lg transition-colors"
          :class="[
            section.level === 1 ? 'text-white font-medium' : 'text-white/60 pl-5',
            activeSection === section.id
              ? 'bg-white/10 text-primary'
              : 'hover:bg-white/5 hover:text-white'
          ]"
          @click.prevent="scrollToSection(section.id)"
        >
          {{ section.text }}
        </a>
        <div v-if="sections.length === 0" class="px-3 py-4 text-sm text-white/40 text-center">
          No sections found
        </div>
      </nav>
    </div>
  </aside>
</template>
