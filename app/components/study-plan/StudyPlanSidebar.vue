<template>
  <div class="xl:w-56 xl:shrink-0 space-y-4 overflow-y-auto pr-1 xl:max-h-none max-h-[400px] xl:order-none order-first w-full">
    <!-- Legend -->
    <div class="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
      <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">
        Legend
      </p>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-purple-500 shadow shadow-purple-500/50" />
        <span>Student</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
        <span>Enrolled</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-gray-500 shadow shadow-gray-500/50" />
        <span>Locked (enrolled)</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-amber-500 shadow shadow-amber-500/50" />
        <span>In Progress</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
        <span>Planned</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-white/60">
        <span class="w-3 h-3 rounded-full bg-white/10 ring-1 ring-white/10" />
        <span>Available</span>
      </div>
    </div>

    <!-- Degree Filters -->
    <div class="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">
          Filter Degrees
        </p>
        <button
          class="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
          @click="$emit('toggle-all-degrees')"
        >
          {{ selectedDegrees.size === allDegrees.length ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="degree in allDegrees"
          :key="degree.slug"
          class="space-y-1.5"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectedDegrees.has(degree.slug)"
              class="w-3 h-3 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              @change="$emit('degree-toggle', degree.slug)"
            >
            <label class="text-xs text-white/70 cursor-pointer select-none" @click="$emit('degree-toggle', degree.slug)">
              {{ degree.label }}
            </label>
          </div>

          <div
            v-if="selectedDegrees.has(degree.slug)"
            class="ml-6"
          >
            <USelect
              :model-value="degreeTargetTitle[degree.slug]"
              :items="getDegreeTitles(degree.slug)"
              size="xs"
              class="text-[10px]"
              @update:model-value="$emit('title-change', degree.slug, $event as string)"
            />
          </div>
        </div>
      </div>

      <UButton
        size="xs"
        color="primary"
        block
        :disabled="selectedDegrees.size === 0 || enrollableCount === 0"
        :loading="enrolling"
        @click="$emit('enroll-all')"
      >
        <template #leading>
          <UIcon name="i-lucide-user-plus" class="size-3" />
        </template>
        Enroll All ({{ enrollableCount }})
      </UButton>
    </div>

    <!-- Plan list -->
    <div v-if="studyPlan.length" class="rounded-xl border border-white/10 bg-black/20 p-3">
      <div class="flex items-center justify-between mb-2">
        <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">
          Study Plan
        </p>
        <UBadge size="xs" variant="subtle" color="info">
          {{ studyPlan.length }}
        </UBadge>
      </div>
      <div class="space-y-1.5">
        <div
          v-for="planId in studyPlan"
          :key="planId"
          class="flex items-center justify-between group/plan-item"
        >
          <button
            class="text-xs text-white/70 hover:text-white text-left flex-1"
            @click="$emit('select-planned-node', planId)"
          >
            {{ getPlanLabel(planId) }}
          </button>
          <button
            class="opacity-0 group-hover/plan-item:opacity-100 text-white/30 hover:text-red-400 transition-opacity"
            @click="$emit('remove-from-plan', planId)"
          >
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </div>
      </div>
    </div>

    <p class="text-[10px] text-white/25 italic leading-relaxed">
      Click any node to select it, then add it to your plan. The path from you to that course and all dependencies will be highlighted.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  allDegrees: { slug: string, label: string }[]
  selectedDegrees: Set<string>
  degreeTargetTitle: Record<string, string>
  getDegreeTitles: (slug: string) => string[]
  studyPlan: string[]
  getPlanLabel: (id: string) => string
  enrollableCount: number
  enrolling: boolean
}>()

defineEmits<{
  'degree-toggle': [slug: string]
  'toggle-all-degrees': []
  'title-change': [slug: string, title: string]
  'enroll-all': []
  'select-planned-node': [id: string]
  'remove-from-plan': [id: string]
}>()
</script>
