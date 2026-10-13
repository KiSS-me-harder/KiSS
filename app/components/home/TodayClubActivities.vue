<script setup lang="ts">
interface ActivityItem {
  stem: string
  title: string
  icon?: string
  description?: string
}

defineProps<{
  activities: ActivityItem[]
  getActivitySlug: (activity: ActivityItem) => string
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="activity in activities"
      :key="activity.stem"
      class="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
    >
      <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
        <UIcon
          :name="activity.icon || 'i-lucide-circle-dot'"
          class="w-4 h-4 text-purple-400"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-white truncate">
          {{ activity.title }}
        </p>
        <p v-if="activity.description" class="text-xs text-muted line-clamp-1">
          {{ activity.description }}
        </p>
      </div>
      <NuxtLink
        :to="`/activities#${getActivitySlug(activity)}`"
        class="text-xs text-primary hover:underline shrink-0"
      >
        Log →
      </NuxtLink>
    </div>
  </div>
</template>
