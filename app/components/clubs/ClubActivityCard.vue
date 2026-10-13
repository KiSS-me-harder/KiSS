<script setup lang="ts">
import type { Activity } from '~/utils/clubPageHelpers'

/**
 * Displays a single club activity card with type badge, XP, and completion status.
 */
const props = defineProps<{
  activity: Activity
  activityTypes: Record<string, { label: string, icon: string, bg: string, border: string, text: string, color: string }>
  isCompleted: (activity: Activity) => boolean
}>()

const activityType = computed(() => {
  const type = props.activityTypes[props.activity.type]
  return type || { label: props.activity.type, icon: 'i-lucide-circle', bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/40', color: 'white' }
})

const emit = defineEmits<{
  (e: 'toggle', activity: Activity): void
}>()
</script>

<template>
  <div
    class="group relative rounded-xl border transition-all duration-200 cursor-pointer"
    :class="[
      isCompleted(activity)
        ? 'bg-white/5 border-white/10'
        : [activityType.bg, activityType.border, 'hover:border-white/20']
    ]"
    @click="emit('toggle', activity)"
  >
    <div class="p-4">
      <div class="flex items-start gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
          :class="activityType.bg"
        >
          <UIcon
            :name="activity.icon || activityType.icon"
            :class="activityType.text"
            class="w-5 h-5"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              :class="[activityType.bg, activityType.text, 'border', activityType.border]"
            >
              {{ activityType.label }}
            </span>
            <span class="text-[10px] text-amber-400 font-medium ml-auto">+{{ activity.xp }} XP</span>
          </div>
          <h3 class="text-sm font-semibold text-foreground truncate">
            {{ activity.title }}
          </h3>
        </div>

        <div
          class="flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all"
          :class="isCompleted(activity)
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/20 group-hover:border-white/40'"
        >
          <UIcon
            v-if="isCompleted(activity)"
            name="i-lucide-check"
            class="w-3.5 h-3.5 text-white"
          />
        </div>
      </div>

      <p class="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
        {{ activity.description }}
      </p>
    </div>

    <div
      v-if="isCompleted(activity)"
      class="absolute inset-0 rounded-xl bg-emerald-500/5 pointer-events-none"
    />
  </div>
</template>
