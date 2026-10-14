<script setup lang="ts">
defineProps<{
  homework: string[]
  isHomeworkDone: (index: number) => boolean
  toggleHomeworkDone: (index: number) => void
  homeworkCompletedCount: number
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">
        Homework
      </h3>
      <span class="text-sm text-muted">
        {{ homeworkCompletedCount }}/{{ homework.length }} done
      </span>
    </div>

    <div class="space-y-2">
      <div
        v-for="(item, index) in homework"
        :key="index"
        class="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5"
        :class="{ 'opacity-50': isHomeworkDone(index) }"
      >
        <button
          class="mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
          :class="isHomeworkDone(index)
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/20 hover:border-white/40'"
          @click="toggleHomeworkDone(index)"
        >
          <UIcon v-if="isHomeworkDone(index)" name="i-lucide-check" class="w-3 h-3 text-white" />
        </button>
        <p class="text-sm text-white" :class="{ 'line-through': isHomeworkDone(index) }">
          {{ item }}
        </p>
      </div>
    </div>
  </div>
</template>
