<script setup lang="ts">
type ExamTask = string | { type: string, text: string, metric: string, field: string, target: number, label: string, unit: string }

defineProps<{
  exam: ExamTask[]
  getExamTaskType: (task: ExamTask) => string
  getExamTaskText: (task: ExamTask) => string
  getExamTaskMetric: (task: ExamTask) => { label: string, target: number, unit: string }
  isExamTaskDone: (taskIndex: number) => boolean
  toggleExamTaskDone: (taskIndex: number) => void
  getExamCompletedCount: number
  getMilestoneCurrentValue: (task: ExamTask) => number
  isMilestoneAchieved: (task: ExamTask) => boolean
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">
        Homework & Exams
      </h3>
      <span class="text-sm text-muted">
        {{ getExamCompletedCount }}/{{ exam.length }} done
      </span>
    </div>

    <div class="space-y-2">
      <div
        v-for="(task, taskIndex) in exam"
        :key="taskIndex"
        class="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5"
        :class="{ 'opacity-50': getExamTaskType(task) === 'checklist' && isExamTaskDone(taskIndex) }"
      >
        <!-- Checklist task -->
        <template v-if="getExamTaskType(task) === 'checklist'">
          <button
            class="mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
            :class="isExamTaskDone(taskIndex)
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-white/20 hover:border-white/40'"
            @click="toggleExamTaskDone(taskIndex)"
          >
            <UIcon v-if="isExamTaskDone(taskIndex)" name="i-lucide-check" class="w-3 h-3 text-white" />
          </button>
          <p class="text-sm text-white" :class="{ 'line-through': isExamTaskDone(taskIndex) }">
            {{ getExamTaskText(task) }}
          </p>
        </template>

        <!-- Milestone task -->
        <template v-else>
          <UIcon name="i-lucide-target" class="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white">
              {{ getExamTaskText(task) }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <div class="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  :style="{ width: `${Math.min(100, (getMilestoneCurrentValue(task) / getExamTaskMetric(task).target) * 100)}%` }"
                />
              </div>
              <span class="text-xs text-muted shrink-0">
                {{ getMilestoneCurrentValue(task) }}/{{ getExamTaskMetric(task).target }} {{ getExamTaskMetric(task).unit }}
              </span>
            </div>
            <UBadge
              v-if="isMilestoneAchieved(task)"
              label="Achieved"
              color="success"
              variant="subtle"
              size="xs"
              class="mt-1"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
