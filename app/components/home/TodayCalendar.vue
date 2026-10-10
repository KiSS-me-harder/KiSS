<script setup lang="ts">
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const today = now.getDate()

const monthName = now.toLocaleDateString('en-US', { month: 'long' })
const monthLabel = `${monthName} ${year}`.toLowerCase()

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const firstDay = new Date(year, month, 1).getDay()
const daysInMonth = new Date(year, month + 1, 0).getDate()
const daysInPrevMonth = new Date(year, month, 0).getDate()

const calendarDays = computed(() => {
  const days: { day: number; current: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, current: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false })
  }

  return days
})

const todayEvents = [
  { title: 'Daily check-in', subtitle: 'Day 1 · +1%', status: 'checked-in' },
  { title: 'Chastity check-in', subtitle: 'Equip a device', status: 'pending' },
  { title: 'Log orgasm', subtitle: '', status: 'add' }
]

const stats = {
  total: 0,
  month: 0,
  allTime: 0
}
</script>

<template>
  <div class="space-y-4">
    <!-- Calendar header -->
    <div class="flex items-center justify-between">
      <UButton variant="ghost" size="sm" square>
        <UIcon name="i-lucide-chevron-left" class="size-4" />
      </UButton>

      <div class="text-center">
        <h2 class="text-lg font-semibold">{{ monthLabel }}</h2>
        <button class="text-xs text-primary hover:underline">Today</button>
      </div>

      <UButton variant="ghost" size="sm" square>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
      </UButton>
    </div>

    <!-- Calendar grid -->
    <UCard>
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="text-center text-xs text-muted py-2 font-medium"
        >
          {{ day }}
        </div>

        <div
          v-for="(cell, index) in calendarDays"
          :key="index"
          class="aspect-square flex items-center justify-center rounded-lg text-sm relative"
          :class="{
            'text-muted/50': !cell.current,
            'ring-2 ring-primary': cell.day === today,
            'hover:bg-elevated cursor-pointer': cell.current
          }"
        >
          {{ cell.day }}
          <div
            v-if="cell.day === today"
            class="absolute top-1 right-1 w-2 h-2 rounded-full bg-success"
          />
        </div>
      </div>
    </UCard>

    <!-- Today's events -->
    <UCard>
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium">
          lör {{ today }} okt. · Today
        </span>
      </div>

      <div class="space-y-2">
        <div
          v-for="(event, index) in todayEvents"
          :key="index"
          class="flex items-center gap-2 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
        >
          <UIcon
            :name="event.status === 'checked-in' ? 'i-lucide-check' : event.status === 'pending' ? 'i-lucide-lock' : 'i-lucide-plus'"
            class="size-4 shrink-0"
            :class="{
              'text-success': event.status === 'checked-in',
              'text-muted': event.status === 'pending',
              'text-primary': event.status === 'add'
            }"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm" :class="{ 'text-primary': event.status === 'add' }">
              {{ event.title }}
            </p>
            <p v-if="event.subtitle" class="text-xs text-muted">
              {{ event.subtitle }}
            </p>
          </div>
          <UBadge
            v-if="event.status === 'checked-in'"
            label="Checked in"
            color="success"
            variant="subtle"
            class="text-xs shrink-0"
          />
          <UBadge
            v-else-if="event.status === 'pending'"
            label="Check in"
            color="primary"
            variant="subtle"
            class="text-xs shrink-0"
          />
        </div>
      </div>
    </UCard>

    <!-- Stats -->
    <UCard>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold">Stats</h3>
        <div class="flex gap-2">
          <button class="text-xs text-primary font-medium">Month</button>
          <button class="text-xs text-muted">All time</button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm">Total</span>
          <div class="flex gap-4">
            <span class="text-sm text-primary">{{ stats.month }}</span>
            <span class="text-sm text-muted">{{ stats.allTime }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <div class="w-2 h-2 rounded-full bg-success" />
          <span class="text-xs text-muted">Full</span>
          <div class="flex-1 h-1.5 rounded-full bg-elevated overflow-hidden">
            <div class="h-full rounded-full bg-success" style="width: 0%" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
