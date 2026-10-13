<template>
  <UCard v-if="enrolledCourses.length">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">
          Enrolled Classes
        </h2>
        <UBadge variant="subtle" color="primary" size="sm">
          {{ enrolledCourses.length }} enrolled
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-for="enrollment in enrolledCourses"
        :key="enrollment.slug"
        class="p-3 rounded-lg bg-white/5 border border-white/5"
      >
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm font-medium text-white">
              {{ enrollment.courseName }}
            </p>
            <p class="text-xs text-white/40">
              {{ enrollment.degree }}
            </p>
          </div>
          <UBadge
            variant="subtle"
            size="xs"
            :color="enrollment.levels.every((l: { completed: boolean }) => l.completed) ? 'success' : 'primary'"
          >
            {{ enrollment.levels.filter((l: { completed: boolean }) => l.completed).length }}/{{ enrollment.levels.length }}
          </UBadge>
        </div>
        <div class="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            :style="{ width: (enrollment.levels.filter((l: { completed: boolean }) => l.completed).length / enrollment.levels.length * 100) + '%' }"
          />
        </div>
      </div>
    </div>
  </UCard>

  <UCard v-else>
    <template #header>
      <h2 class="text-lg font-semibold text-white">
        Enrolled Classes
      </h2>
    </template>
    <div class="text-center py-6">
      <UIcon name="i-lucide-book-open" class="size-8 mx-auto text-white/20 mb-2" />
      <p class="text-sm text-white/40">
        You are not enrolled in any classes yet.
      </p>
      <NuxtLink to="/courses">
        <UButton class="mt-3" size="sm" color="primary">
          Browse Classes
        </UButton>
      </NuxtLink>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  enrolledCourses: { slug: string, courseName: string, degree: string, levels: { completed: boolean }[] }[]
}>()
</script>
