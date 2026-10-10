<script setup lang="ts">
interface ClassTask {
  id: number
  title: string
  type: 'timed' | 'instant'
  duration?: string
  status: 'not-started' | 'in-progress' | 'completed'
  locked?: boolean
  lockReason?: string
}

interface ClassGroup {
  name: string
  image: string
  grade: string
  tasks: ClassTask[]
}

const classes = ref<ClassGroup[]>([
  {
    name: 'Physical Play Basics',
    image: '/images/classes/physical-play-basics.png',
    grade: 'F',
    tasks: [
      { id: 1, title: 'Massage your g-spot for 5 min', type: 'timed', duration: '5m', status: 'not-started' },
      { id: 2, title: 'Perform kegel exercises (20 reps)', type: 'instant', status: 'not-started' },
      { id: 3, title: 'Press firmly for 10 seconds', type: 'instant', status: 'not-started', locked: true, lockReason: 'Attend class to unlock' },
    ]
  },
  {
    name: 'Grirty Underwear',
    image: '/images/classes/grirty-underwear.png',
    grade: 'F',
    tasks: [
      { id: 4, title: 'Wear high heels for 10 min', type: 'timed', duration: '10m', status: 'not-started' },
      { id: 5, title: 'Wear panties and a bra for 20 min', type: 'timed', duration: '20m', status: 'not-started', locked: true, lockReason: 'Attend class to unlock' },
      { id: 6, title: 'Practice walking in heels', type: 'instant', status: 'not-started', locked: true, lockReason: 'Attend class to unlock' },
    ]
  },
  {
    name: 'Chastity Training',
    image: '/images/classes/chastity-training.png',
    grade: 'D',
    tasks: [
      { id: 7, title: 'Wear chastity device for 1 hour', type: 'timed', duration: '1h', status: 'in-progress' },
      { id: 8, title: 'Submit daily affirmation', type: 'instant', status: 'completed' },
      { id: 9, title: 'Endurance test: 30 min', type: 'timed', duration: '30m', status: 'not-started', locked: true, lockReason: 'Attend class to unlock' },
    ]
  },
  {
    name: 'Maid Service',
    image: '/images/classes/maid-service.png',
    grade: 'C',
    tasks: [
      { id: 10, title: 'Clean the classroom', type: 'timed', duration: '15m', status: 'completed' },
      { id: 11, title: 'Serve tea to classmates', type: 'instant', status: 'not-started' },
      { id: 12, title: 'Polish shoes for 10 min', type: 'timed', duration: '10m', status: 'not-started' },
    ]
  },
])

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'not-started': return 'i-lucide-clock'
    case 'in-progress': return 'i-lucide-play'
    case 'completed': return 'i-lucide-check-circle'
    default: return 'i-lucide-clock'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'not-started': return 'neutral'
    case 'in-progress': return 'warning'
    case 'completed': return 'success'
    default: return 'neutral'
  }
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'S': return 'success'
    case 'A': return 'success'
    case 'B': return 'primary'
    case 'C': return 'warning'
    case 'D': return 'error'
    case 'F': return 'error'
    default: return 'neutral'
  }
}
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
    </div>

    <div class="space-y-4">
      <UCard
        v-for="classGroup in classes"
        :key="classGroup.name"
        :ui="{
          root: 'overflow-hidden',
          body: 'p-0'
        }"
      >
        <div class="flex flex-col sm:flex-row gap-4 p-4">
          <div class="shrink-0">
            <div class="w-24 h-32 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-12 text-muted" />
            </div>
            <p class="text-xs text-muted mt-1 text-center truncate" :title="classGroup.name">
              {{ classGroup.name }}
            </p>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" :class="`bg-${getGradeColor(classGroup.grade)}/20 text-${getGradeColor(classGroup.grade)}`">
                  GRADE: {{ classGroup.grade }}
                </span>
              </div>
              <UButton variant="ghost" size="xs" class="text-xs">
                TEXT
              </UButton>
            </div>

            <div class="space-y-3">
              <div>
                <p class="text-xs font-semibold text-warning mb-2 uppercase">
                  Daily Tasks
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="task in classGroup.tasks.filter(t => !t.locked)"
                    :key="task.id"
                    class="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
                    :class="{ 'opacity-50': task.locked }"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate">
                        {{ task.title }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <UIcon :name="task.type === 'timed' ? 'i-lucide-clock' : 'i-lucide-zap'" class="size-3 text-muted" />
                        <span class="text-xs text-muted">
                          {{ task.type === 'timed' ? 'Timed' : 'Instant' }}
                          {{ task.duration ? `· ${task.duration}` : '' }}
                        </span>
                        <span class="text-xs" :class="`text-${getStatusColor(task.status)}`">
                          {{ task.status === 'not-started' ? 'Not started' : task.status === 'in-progress' ? 'In progress' : 'Completed' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="classGroup.tasks.some(t => t.locked)">
                <p class="text-xs font-semibold text-muted mb-2 uppercase">
                  Exams
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="task in classGroup.tasks.filter(t => t.locked)"
                    :key="task.id"
                    class="flex items-center gap-2 p-2 rounded-lg opacity-50"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate">
                        {{ task.title }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <UIcon :name="task.type === 'timed' ? 'i-lucide-clock' : 'i-lucide-zap'" class="size-3 text-muted" />
                        <span class="text-xs text-muted">
                          {{ task.type === 'timed' ? 'Timed' : 'Instant' }}
                          {{ task.duration ? `· ${task.duration}` : '' }}
                        </span>
                        <span class="text-xs text-muted">
                          {{ task.lockReason }}
                        </span>
                      </div>
                    </div>
                    <UIcon name="i-lucide-lock" class="size-4 text-muted shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
