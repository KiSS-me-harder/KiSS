<script setup lang="ts">
/**
 * Displays a single activity card with fields, form, and recent sessions.
 */
type ActivityField = { id: string, label: string, unit: string, required?: boolean }
type ActivityContribution = { metric: string, map: Record<string, string> }

defineProps<{
  activity: {
    slug: string
    title: string
    description: string
    icon: string
    fields: ActivityField[]
    contributions: ActivityContribution[]
  }
  highlighted: boolean
  getFieldValue: (slug: string, fieldId: string) => number
  getFieldUnit: (activity: Record<string, unknown>, fieldId: string) => string
  getRecentSessions: (activity: Record<string, unknown>) => Array<{ timestamp: number, values: Record<string, number> }>
  onFieldChange: (slug: string, fieldId: string, event: Event) => void
  submitSession: (activity: Record<string, unknown>) => void
  deleteSession: (activity: Record<string, unknown>, index: number) => void
  formatDate: (timestamp: number) => string
  todayFormatted: string
}>()

const emit = defineEmits<{
  (e: 'help', activity: Record<string, unknown>): void
}>()
</script>

<template>
  <div
    class="rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-200"
    :class="{ 'ring-2 ring-purple-500': highlighted }"
  >
    <div class="flex items-start gap-4 mb-4">
      <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
        <UIcon :name="activity.icon || 'i-lucide-dumbbell'" class="w-5 h-5 text-purple-400" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-base font-semibold text-white">
            {{ activity.title }}
          </h3>
          <button
            class="shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            title="What is this activity?"
            @click="emit('help', activity)"
          >
            <UIcon name="i-lucide-circle-help" class="w-4 h-4" />
          </button>
        </div>
        <p class="text-sm text-white/50 mt-0.5">
          {{ activity.description }}
        </p>
        <div v-if="activity.contributions.length > 0" class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="contribution in activity.contributions"
            :key="contribution.metric"
            class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400"
          >
            <UIcon name="i-lucide-arrow-right" class="w-3 h-3" />{{ contribution.metric }}
          </span>
        </div>
      </div>
    </div>

    <form class="space-y-3" @submit.prevent="submitSession(activity)">
      <div class="flex flex-wrap gap-3">
        <div v-for="field in activity.fields" :key="field.id" class="flex-1 min-w-[140px]">
          <label :for="`${activity.slug}-${field.id}`" class="block text-xs font-medium text-white/60 mb-1.5">
            {{ field.label }}
            <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
            <span class="text-white/30 ml-1">({{ field.unit }})</span>
          </label>
          <input
            :id="`${activity.slug}-${field.id}`"
            type="number"
            step="0.1"
            min="0"
            :required="field.required"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors"
            :value="getFieldValue(activity.slug, field.id)"
            @input="onFieldChange(activity.slug, field.id, $event)"
          >
        </div>
      </div>
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-1.5 text-xs text-white/30">
          <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
          <span>{{ todayFormatted }}</span>
        </div>
        <button
          type="submit"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-500/80 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-md shadow-purple-500/10"
        >
          <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />Log
        </button>
      </div>
    </form>

    <div v-if="getRecentSessions(activity).length > 0" class="mt-4 pt-4 border-t border-white/5">
      <p class="text-xs font-medium text-white/40 mb-2">
        Recent sessions
      </p>
      <div class="space-y-1.5 max-h-32 overflow-y-auto">
        <div
          v-for="(session, sIdx) in getRecentSessions(activity).slice(0, 5)"
          :key="sIdx"
          class="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white/5"
        >
          <span class="text-white/50">{{ formatDate(session.timestamp) }}</span>
          <div class="flex items-center gap-2">
            <span v-for="(val, fId) in session.values" :key="fId" class="text-white/70">
              {{ val }}{{ getFieldUnit(activity, fId) }}
            </span>
            <button
              class="text-white/20 hover:text-red-400 transition-colors"
              @click="deleteSession(activity, sIdx)"
            >
              <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
