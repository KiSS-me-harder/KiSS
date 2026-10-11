<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'
import { useScheduleStore } from '~/stores/schedule'

const store = useEnrollmentStore()
const scheduleStore = useScheduleStore()
const { app } = useRuntimeConfig()

// Fetch all classes from content to get titles
const { data: allClassesContent } = await useAsyncData('today-schedule-classes', () => queryCollection('classes').all())

// Build enrolled classes list with metadata from content
interface EnrolledClassInfo {
  slug: string
  title: string
  degree: string
  degreeLabel: string
}

const enrolledClasses = computed<EnrolledClassInfo[]>(() => {
  const enrollments = store.enrollments.value
  if (!allClassesContent.value || !enrollments || enrollments.length === 0) return []

  const classes: EnrolledClassInfo[] = []
  for (const enrollment of enrollments) {
    const { slug, className, degree } = enrollment

    // Find the class index file to get the title
    const prefix = `classes/${degree}/${className}/_index`
    const classIndex = allClassesContent.value.find(item => (item as any).stem === prefix)

    const title = (classIndex as any)?.title || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    classes.push({ slug, title, degree, degreeLabel })
  }

  return classes
})

// Schedule entries from store (same source as TodayScheduleEdit)
interface ScheduleEntry {
  id: number
  classSlug: string
  day: number // 0=Monday ... 6=Sunday
  section: string
}

const scheduleEntries = computed(() => scheduleStore.scheduleEntries)

// Today's day index (0=Monday ... 6=Sunday)
const todayDayIndex = computed(() => {
  const day = new Date().getDay() // 0=Sunday
  return day === 0 ? 6 : day - 1 // Convert to 0=Monday
})

// Slot time ranges
const slotTimeRanges: Record<string, { label: string, timeStart: string, timeEnd: string, icon: string }> = {
  morning: { label: 'Morning', timeStart: '06:00', timeEnd: '12:00', icon: 'i-lucide-sunrise' },
  lunch: { label: 'Lunch', timeStart: '12:00', timeEnd: '14:00', icon: 'i-lucide-sun' },
  evening: { label: 'Evening', timeStart: '14:00', timeEnd: '20:00', icon: 'i-lucide-sunset' },
  bedtime: { label: 'Bedtime', timeStart: '20:00', timeEnd: '23:00', icon: 'i-lucide-moon' }
}

// Get today's scheduled classes
const todayScheduleEntries = computed(() => {
  return scheduleEntries.value.filter(e => e.day === todayDayIndex.value)
})

// Build schedule items grouped by time slot
const scheduleItems = computed(() => {
  const items: { slot: string, slotLabel: string, timeRange: string, icon: string, classes: { slug: string, title: string, degreeLabel: string }[] }[] = []

  for (const [slotId, slotInfo] of Object.entries(slotTimeRanges)) {
    const slotEntries = todayScheduleEntries.value.filter(e => e.section === slotId)
    if (slotEntries.length === 0) continue

    const classes = slotEntries.map((entry) => {
      const cls = enrolledClasses.value.find(c => c.slug === entry.classSlug)
      return {
        slug: entry.classSlug,
        title: cls?.title || entry.classSlug,
        degreeLabel: cls?.degreeLabel || ''
      }
    })

    items.push({
      slot: slotId,
      slotLabel: slotInfo.label,
      timeRange: `${slotInfo.timeStart} – ${slotInfo.timeEnd}`,
      icon: slotInfo.icon,
      classes
    })
  }

  return items
})

const totalCount = computed(() => todayScheduleEntries.value.length)

// Track which classes have been completed today (via store)
const todayKey = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
})

// Ensure today's daily completions are loaded
onMounted(() => {
  scheduleStore.loadDailyCompleted(todayKey.value)
})

const isClassCompletedToday = (classSlug: string) => {
  return scheduleStore.isDailyCompleted(todayKey.value, `${classSlug}-completed`)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-clock" class="size-5 text-muted" />
          <h2 class="text-base font-semibold">
            Today's Schedule
          </h2>
        </div>
        <span v-if="totalCount > 0" class="text-xs text-muted">
          {{ totalCount }} class{{ totalCount !== 1 ? 'es' : '' }} scheduled
        </span>
      </div>
    </template>

    <!-- No classes scheduled today -->
    <div v-if="scheduleItems.length === 0" class="text-center py-8 text-muted">
      <UIcon name="i-lucide-calendar-plus" class="w-10 h-10 mx-auto mb-3 opacity-50" />
      <p class="text-sm font-medium mb-1">
        No classes scheduled today
      </p>
      <p class="text-xs mb-4">
        Go to the Schedule tab to assign your enrolled classes to days and time slots.
      </p>
      <UButton variant="outline" size="sm" @click="$router.push('/today#Schedule')">
        <template #leading>
          <UIcon name="i-lucide-calendar-clock" class="size-3" />
        </template>
        Open Schedule
      </UButton>
    </div>

    <!-- Schedule groups by time slot -->
    <div v-else class="space-y-4">
      <div
        v-for="group in scheduleItems"
        :key="group.slot"
        class="space-y-2"
      >
        <!-- Slot header -->
        <div class="flex items-center gap-2 text-xs text-muted font-medium uppercase tracking-wider">
          <UIcon :name="group.icon" class="size-3" />
          <span>{{ group.slotLabel }}</span>
          <span class="font-mono">{{ group.timeRange }}</span>
        </div>

        <!-- Classes in this slot -->
        <div
          v-for="cls in group.classes"
          :key="cls.slug"
          class="flex items-center gap-3 p-3 rounded-lg border transition-colors group"
          :class="isClassCompletedToday(cls.slug) ? 'border-success/50 bg-success/5' : 'border-default/50 hover:border-primary/50'"
        >
          <!-- Status indicator -->
          <div
            class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
            :class="isClassCompletedToday(cls.slug) ? 'bg-success border-success' : 'border-muted'"
          >
            <UIcon v-if="isClassCompletedToday(cls.slug)" name="i-lucide-check" class="size-3 text-success-foreground" />
          </div>

          <!-- Class icon -->
          <div class="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-book-open" class="size-3 text-purple-400" />
          </div>

          <div class="flex-1 min-w-0">
            <span class="text-sm flex-1 truncate" :class="{ 'line-through text-muted': isClassCompletedToday(cls.slug) }">
              {{ cls.title }}
            </span>
            <span class="text-xs text-muted">{{ cls.degreeLabel }}</span>
          </div>

          <!-- Class link -->
          <NuxtLink
            :to="`/classes/${cls.slug}`"
            class="text-xs text-primary hover:underline shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Open
          </NuxtLink>
        </div>
      </div>
    </div>
  </UCard>
</template>
