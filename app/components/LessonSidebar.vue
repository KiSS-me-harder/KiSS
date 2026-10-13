<script setup lang="ts">
defineProps<{
  degree: string
  slug: string
  levelParam: number
  classSlug: string
  sortedLevelsData: { level: number, title: string }[]
  isLevelCompleted: (level?: number) => boolean
  isLevelUnlockedByLevel: (level: number) => boolean
  levelBadgeColor: string
  isEnrolled: boolean
  handleEnroll: () => void
}>()
</script>

<template>
  <!-- Sidebar -->
  <aside class="hidden lg:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-sm">
    <div class="p-4 border-b border-white/10">
      <NuxtLink :to="`/courses/${slug}`" class="text-xs text-primary hover:underline">
        ← Back to class
      </NuxtLink>
    </div>
    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <NuxtLink
        v-for="level in sortedLevelsData"
        :key="level.level"
        :to="`/courses/${slug}/${level.level}`"
        data-testid="level-nav-link"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="level.level === levelParam
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:bg-white/5 hover:text-white/80'"
      >
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          :class="isLevelCompleted(level.level)
            ? 'bg-emerald-500/90 text-white'
            : isLevelUnlockedByLevel(level.level)
              ? levelBadgeColor + ' text-white'
              : 'bg-white/10 text-white/30'"
        >
          {{ isLevelCompleted(level.level) ? '✓' : level.level }}
        </span>
        <span class="truncate">{{ level.title }}</span>
      </NuxtLink>
    </nav>
    <div v-if="!isEnrolled" class="p-4 border-t border-white/10">
      <UButton block variant="solid" @click="handleEnroll">
        Enroll in class
      </UButton>
    </div>
  </aside>
</template>
