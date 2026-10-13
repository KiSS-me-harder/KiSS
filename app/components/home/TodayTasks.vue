<script setup lang="ts">
import { useTodayTasks } from '~/composables/useTodayTasks'

const {
  enrolledTaskGroups,
  singleShotTasks,
  subscribedActivities,
  subscribedActivityGroups,
  plannedCourses,
  hasTasks,
  getActivitySlug,
  toggleTaskCompleted
} = await useTodayTasks()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-clipboard-list" class="size-5 text-muted" />
        <h2 class="text-base font-semibold">
          Today's Tasks
        </h2>
      </div>
      <span v-if="hasTasks" class="text-xs text-muted">
        <template v-if="enrolledTaskGroups.length">{{ enrolledTaskGroups.length }} class{{ enrolledTaskGroups.length !== 1 ? 'es' : '' }}</template>
        <template v-if="enrolledTaskGroups.length && subscribedActivities.length"> · </template>
        <template v-if="subscribedActivities.length">{{ subscribedActivities.length }} activit{{ subscribedActivities.length !== 1 ? 'ies' : 'y' }}</template>
      </span>
    </div>

    <div v-if="!hasTasks" class="text-center py-8 text-muted">
      <UIcon name="i-lucide-clipboard-list" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">
        No tasks for today.
      </p>
      <p class="text-xs mt-1">
        Enroll in classes or join clubs to see tasks here.
      </p>
    </div>

    <div v-else class="space-y-4">
      <!-- Single-Shot Task Queue -->
      <template v-if="singleShotTasks.length">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-4 text-amber-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Action Items
          </h3>
          <span class="text-xs text-muted">({{ singleShotTasks.length }})</span>
        </div>
        <UCard v-for="task in singleShotTasks" :key="task.id">
          <div class="flex items-start gap-3 p-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <UIcon :name="task.icon" class="w-4 h-4 text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">
                {{ task.title }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ task.description }}
              </p>
            </div>
            <NuxtLink :to="task.to" class="text-xs text-primary hover:underline shrink-0 self-center">
              {{ task.linkText }}
            </NuxtLink>
          </div>
        </UCard>
      </template>

      <!-- Enrolled Class Tasks -->
      <template v-if="enrolledTaskGroups.length">
        <HomeTodayTaskGroup
          v-for="group in enrolledTaskGroups"
          :key="group.slug"
          :group="group"
          @toggle="toggleTaskCompleted"
        />
      </template>

      <!-- Club Activities -->
      <template v-if="Object.keys(subscribedActivityGroups).length > 0">
        <div class="flex items-center gap-2 pt-2">
          <UIcon name="i-lucide-users" class="size-4 text-purple-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Club Activities
          </h3>
          <span class="text-xs text-muted">({{ subscribedActivities.length }})</span>
        </div>
        <template v-for="(activities, category) in subscribedActivityGroups" :key="category">
          <UCard>
            <div class="p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                  {{ category }}
                </span>
              </div>
              <HomeTodayClubActivities :activities="activities" :get-activity-slug="getActivitySlug" />
            </div>
          </UCard>
        </template>
      </template>

      <!-- Planned Classes -->
      <template v-if="plannedCourses.length">
        <div class="flex items-center gap-2 pt-2">
          <UIcon name="i-lucide-git-branch" class="size-4 text-blue-400" />
          <h3 class="text-sm font-semibold text-white/80">
            Planned Classes
          </h3>
        </div>
        <UCard>
          <div class="p-4 space-y-2">
            <div
              v-for="planned in plannedCourses"
              :key="planned.slug"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
            >
              <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="w-4 h-4 text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">
                  {{ planned.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ planned.degreeLabel }}
                </p>
              </div>
              <NuxtLink :to="planned.to" class="text-xs text-primary hover:underline shrink-0">
                Enroll →
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>
