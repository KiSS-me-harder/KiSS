<script setup lang="ts">
import type { CourseTaskGroup } from '~/composables/useTodayTasks'

defineProps<{
  group: CourseTaskGroup
}>()

const emit = defineEmits<{
  (e: 'toggle', key: string): void
}>()
</script>

<template>
  <UCard
    :ui="{
      root: 'overflow-hidden',
      body: 'p-0'
    }"
  >
    <div class="flex flex-col sm:flex-row gap-4 p-4">
      <div class="shrink-0">
        <div class="w-24 h-32 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center relative">
          <img
            v-if="group.image"
            :src="group.image"
            :alt="group.name"
            class="w-full h-full object-cover"
          >
          <UIcon v-else name="i-lucide-image" class="size-12 text-muted" />
        </div>
        <p class="text-xs text-muted mt-1 text-center truncate" :title="group.name">
          {{ group.name }}
        </p>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
              {{ group.degreeLabel }}
            </span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
              Level {{ group.currentLevel }}
            </span>
          </div>
          <NuxtLink
            :to="`/courses/${group.slug}`"
            class="text-xs text-primary hover:underline"
          >
            Open class →
          </NuxtLink>
        </div>

        <div v-if="group.examTasks.length">
          <p class="text-xs font-semibold text-warning mb-2 uppercase">
            Homework & Exams
          </p>
          <div class="space-y-1.5">
            <div
              v-for="task in group.examTasks"
              :key="task.id"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated/50 transition-colors cursor-pointer"
              :class="{ 'opacity-50': task.completed }"
              @click="emit('toggle', task.completedKey)"
            >
              <UIcon
                :name="task.completed ? 'i-lucide-check-circle' : 'i-lucide-circle'"
                class="size-4 shrink-0"
                :class="task.completed ? 'text-success' : 'text-muted'"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate" :class="{ 'line-through': task.completed }">
                  {{ task.title }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="group.metrics.length" class="mt-3">
          <p class="text-xs font-semibold text-muted mb-2 uppercase">
            Lesson Metrics
          </p>
          <div class="space-y-1.5">
            <div
              v-for="metric in group.metrics"
              :key="metric.id"
              class="flex items-center gap-2 p-2 rounded-lg bg-white/5"
            >
              <UIcon name="i-lucide-target" class="size-4 text-purple-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">
                  {{ metric.label }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      :style="{ width: `${Math.min(100, (metric.currentValue / metric.target) * 100)}%` }"
                    />
                  </div>
                  <span class="text-xs text-muted shrink-0">
                    {{ metric.currentValue }}/{{ metric.target }} {{ metric.unit }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
