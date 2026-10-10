<script setup lang="ts">
interface ScheduleEntry {
  id: number
  day: string
  time: string
  title: string
  duration: string
  enabled: boolean
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const scheduleEntries = ref<ScheduleEntry[]>([
  { id: 1, day: 'Monday', time: '09:00', title: 'Physical Play Basics', duration: '1h', enabled: true },
  { id: 2, day: 'Monday', time: '10:30', title: 'Chastity Training', duration: '45min', enabled: true },
  { id: 3, day: 'Tuesday', time: '09:00', title: 'Grirty Underwear', duration: '30min', enabled: true },
  { id: 4, day: 'Tuesday', time: '14:00', title: 'Maid Service', duration: '2h', enabled: false },
  { id: 5, day: 'Wednesday', time: '09:00', title: 'Physical Play Basics', duration: '1h', enabled: true },
  { id: 6, day: 'Wednesday', time: '15:00', title: 'Chastity Check-in', duration: '30min', enabled: true },
  { id: 7, day: 'Thursday', time: '09:00', title: 'Chastity Training', duration: '45min', enabled: true },
  { id: 8, day: 'Friday', time: '10:00', title: 'Weekly Review', duration: '1h', enabled: false },
])

const selectedDay = ref('Monday')

const filteredEntries = computed(() => {
  return scheduleEntries.value.filter(e => e.day === selectedDay.value)
})

const addEntry = () => {
  const newId = scheduleEntries.value.length ? Math.max(...scheduleEntries.value.map(e => e.id)) + 1 : 1
  scheduleEntries.value.push({
    id: newId,
    day: selectedDay.value,
    time: '12:00',
    title: 'New activity',
    duration: '30min',
    enabled: true
  })
}

const removeEntry = (id: number) => {
  scheduleEntries.value = scheduleEntries.value.filter(e => e.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">Edit Schedule</h2>
        <p class="text-sm text-muted">Manage your weekly training schedule</p>
      </div>
      <UButton variant="solid" size="sm" @click="addEntry">
        <template #leading>
          <UIcon name="i-lucide-plus" class="size-4" />
        </template>
        Add activity
      </UButton>
    </div>

    <!-- Day selector -->
    <div class="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
      <button
        v-for="day in days"
        :key="day"
        class="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
        :class="selectedDay === day
          ? 'bg-primary text-primary-foreground'
          : 'text-muted hover:bg-elevated'"
        @click="selectedDay = day"
      >
        {{ day.slice(0, 3) }}
      </button>
    </div>

    <!-- Schedule entries for selected day -->
    <div class="space-y-3">
      <div v-if="filteredEntries.length === 0" class="text-center py-8 text-muted">
        <UIcon name="i-lucide-calendar-clock" class="size-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm">No activities scheduled for {{ selectedDay }}</p>
        <UButton variant="outline" size="sm" class="mt-3" @click="addEntry">
          Add first activity
        </UButton>
      </div>

      <UCard
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="transition-colors"
        :class="{ 'opacity-50': !entry.enabled }"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="size-4 text-muted" />
            <span class="text-sm font-medium">{{ entry.time }}</span>
            <span class="text-xs text-muted">· {{ entry.duration }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium" :class="{ 'line-through': !entry.enabled }">
              {{ entry.title }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UToggle
              :model-value="entry.enabled"
              @update:model-value="entry.enabled = $event"
            />
            <UButton
              variant="ghost"
              size="xs"
              color="error"
              icon="i-lucide-trash-2"
              square
              @click="removeEntry(entry.id)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Summary -->
    <UCard>
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted">
          {{ scheduleEntries.filter(e => e.enabled).length }} of {{ scheduleEntries.length }} activities active
        </span>
        <UButton variant="solid" size="sm">
          <template #leading>
            <UIcon name="i-lucide-save" class="size-4" />
          </template>
          Save changes
        </UButton>
      </div>
    </UCard>
  </div>
</template>
