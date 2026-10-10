<script setup lang="ts">
interface ScheduleItem {
  time: string
  title: string
  type: 'class' | 'detention' | 'event' | 'deadline'
  description?: string
}

const scheduleItems = ref<ScheduleItem[]>([
  { time: '09:00', title: 'Physical Play Basics', type: 'class', description: 'Room 101 - Massage techniques' },
  { time: '10:30', title: 'Chastity Training', type: 'class', description: 'Room 205 - Device endurance' },
  { time: '12:00', title: 'Break', type: 'event', description: 'Common area' },
  { time: '13:00', title: 'Grirty Underwear', type: 'class', description: 'Room 303 - Heel walking practice' },
  { time: '14:30', title: 'Daily affirmation due', type: 'deadline', description: 'Submit to instructor' },
  { time: '15:00', title: 'Maid Service', type: 'class', description: 'Classroom - Cleaning rotation' },
  { time: '16:30', title: 'Detention', type: 'detention', description: 'Room 204 - Polish shoes' },
])

const typeConfig = (type: string) => {
  switch (type) {
    case 'class': return { icon: 'i-lucide-book-open', color: 'primary' as const }
    case 'detention': return { icon: 'i-lucide-octagon-alert', color: 'error' as const }
    case 'event': return { icon: 'i-lucide-calendar', color: 'success' as const }
    case 'deadline': return { icon: 'i-lucide-clock-alert', color: 'warning' as const }
    default: return { icon: 'i-lucide-circle', color: 'neutral' as const }
  }
}

const now = new Date()
const currentHour = now.getHours()
const currentMinute = now.getMinutes()
const currentTime = currentHour * 60 + currentMinute

const isPast = (time: string) => {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes < currentTime
}

const isNow = (time: string) => {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const diff = Math.abs(hours * 60 + minutes - currentTime)
  return diff < 60
}

const getColorClass = (color: string) => `text-${color}`
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-calendar-clock" class="size-5 text-muted" />
        <h2 class="text-base font-semibold">
          Today's Schedule
        </h2>
      </div>
    </template>

    <div class="space-y-0">
      <div
        v-for="(item, index) in scheduleItems"
        :key="index"
        class="flex gap-4 relative"
        :class="{ 'opacity-50': isPast(item.time) }"
      >
        <div class="flex flex-col items-center">
          <div
            class="size-3 rounded-full ring-2 ring-offset-2 ring-offset-transparent shrink-0"
            :class="{
              'bg-primary ring-primary': isNow(item.time),
              'bg-muted ring-muted': !isNow(item.time)
            }"
          />
          <div
            v-if="index < scheduleItems.length - 1"
            class="w-px flex-1 bg-default mt-1"
          />
        </div>

        <div class="flex-1 pb-4">
          <div class="flex items-center gap-2 mb-0.5">
            <UIcon :name="typeConfig(item.type).icon" class="size-4" :class="getColorClass(typeConfig(item.type).color)" />
            <span class="text-sm font-medium text-highlighted">
              {{ item.title }}
            </span>
            <UBadge
              v-if="isNow(item.time)"
              label="Now"
              color="primary"
              variant="subtle"
              class="text-xs"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted font-mono">
              {{ item.time }}
            </span>
            <span v-if="item.description" class="text-xs text-muted">
              {{ item.description }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
