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

// Checked-in days for visual indicators
const checkedDays = [1, 2, 3, 8, 9, 10]

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

const todayDateString = now.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })

const todayEvents = [
  { title: 'Daily check-in', subtitle: 'Day 1 · +1%', status: 'checked-in' },
  { title: 'Chastity check-in', subtitle: 'Equip a device', status: 'pending' },
  { title: 'Log orgasm', subtitle: '', status: 'add' }
]

const statsCategories = [
  { label: 'Full', color: 'bg-success', dotColor: 'text-success' },
  { label: 'Ruined', color: 'bg-warning', dotColor: 'text-warning' },
  { label: 'Anal', color: 'bg-primary', dotColor: 'text-primary' },
  { label: 'Wet Dream', color: 'bg-info', dotColor: 'text-info' },
  { label: 'Plapgasm', color: 'bg-primary', dotColor: 'text-primary' },
  { label: 'Nipple', color: 'bg-primary', dotColor: 'text-primary' },
  { label: 'Throatgasm', color: 'bg-success', dotColor: 'text-success' },
  { label: 'Caged vibegasm', color: 'bg-info', dotColor: 'text-info' }
]

const statsBottom = [
  { label: 'Check-ins', icon: 'i-lucide-check', month: 1, allTime: 1 },
  { label: 'Chastity days', icon: 'i-lucide-lock', month: 0, allTime: 0 }
]
</script>

<template>
  <div class="space-y-4">
    <!-- Two-column layout: calendar + sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Calendar grid -->
      <div class="lg:col-span-2">
        <UCard>
          <!-- Calendar header -->
          <div class="flex items-center justify-between mb-4">
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
              class="aspect-square flex items-center justify-center rounded-lg text-sm relative cursor-pointer transition-colors"
              :class="{
                'text-muted/40 bg-elevated/30': !cell.current,
                'bg-elevated hover:bg-elevated/80': cell.current,
                'ring-2 ring-primary': cell.day === today && cell.current,
              }"
            >
              {{ cell.day }}
              <!-- Checkmark for checked-in days -->
              <UIcon
                v-if="checkedDays.includes(cell.day)"
                name="i-lucide-check"
                class="absolute top-1 right-1 size-2.5 text-success"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right: Today's events + Stats -->
      <div class="space-y-6">
        <!-- Today's events -->
        <UCard>
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">
              {{ todayDateString }} · Today
            </span>
          </div>

          <div class="space-y-0">
            <div
              v-for="(event, index) in todayEvents"
              :key="index"
              class="flex items-center gap-2 py-2 transition-colors"
              :class="{
                'border-b border-default/50': index < todayEvents.length - 1
              }"
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
                <div class="flex items-center gap-2">
                  <p class="text-sm" :class="{ 'text-primary': event.status === 'add' }">
                    {{ event.title }}
                  </p>
                  <span v-if="event.subtitle" class="text-xs text-muted">
                    {{ event.subtitle }}
                  </span>
                </div>
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
            <h3 class="text-base font-semibold">Stats</h3>
            <div class="flex gap-1">
              <button class="px-2 py-1 text-xs text-primary font-medium rounded-md bg-primary/10">
                Month
              </button>
              <button class="px-2 py-1 text-xs text-muted rounded-md hover:bg-elevated">
                All time
              </button>
            </div>
          </div>

          <!-- Total row -->
          <div class="flex items-center justify-between py-2 border-b border-default/50">
            <span class="text-sm font-medium">Total</span>
            <div class="flex gap-6">
              <span class="text-sm font-mono text-primary">0</span>
              <span class="text-sm font-mono text-muted">0</span>
            </div>
          </div>

          <!-- Category stats -->
          <div class="space-y-0">
            <div
              v-for="cat in statsCategories"
              :key="cat.label"
              class="flex items-center justify-between py-1.5"
            >
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :class="cat.color" />
                <span class="text-sm">{{ cat.label }}</span>
              </div>
              <div class="flex gap-6">
                <span class="text-sm font-mono text-highlighted">0</span>
                <span class="text-sm font-mono text-muted">0</span>
              </div>
            </div>
          </div>

          <!-- Bottom stats -->
          <div class="border-t border-default/50 mt-2 pt-2 space-y-0">
            <div
              v-for="s in statsBottom"
              :key="s.label"
              class="flex items-center justify-between py-1.5"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="s.icon" class="size-3.5 text-muted" />
                <span class="text-sm">{{ s.label }}</span>
              </div>
              <div class="flex gap-6">
                <span class="text-sm font-mono text-highlighted">{{ s.month }}</span>
                <span class="text-sm font-mono text-muted">{{ s.allTime }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
