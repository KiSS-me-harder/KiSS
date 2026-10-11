<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'

const store = useEnrollmentStore()
const { app } = useRuntimeConfig()

// Fetch all classes from content to get titles and metadata
const { data: allClassesContent } = await useAsyncData('schedule-edit-classes', () => queryCollection('classes').all())

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const timeSections = [
  { id: 'morning', title: 'Morning', icon: 'i-lucide-sunrise', timeRange: '06:00 - 12:00' },
  { id: 'lunch', title: 'Lunch', icon: 'i-lucide-sun', timeRange: '12:00 - 14:00' },
  { id: 'evening', title: 'Evening', icon: 'i-lucide-sunset', timeRange: '14:00 - 20:00' },
  { id: 'bedtime', title: 'Bedtime', icon: 'i-lucide-moon', timeRange: '20:00 - 23:00' }
]

// Build enrolled classes list with metadata from content
interface EnrolledClassInfo {
  slug: string
  title: string
  degree: string
  degreeLabel: string
  image: string
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

    classes.push({
      slug,
      title,
      degree,
      degreeLabel,
      image: `${app.baseURL}img/degrees/${degree}.webp`
    })
  }

  return classes.sort((a, b) => a.title.localeCompare(b.title))
})

// Schedule entry stored in localStorage
interface ScheduleEntry {
  id: number
  classSlug: string
  day: number // 0=Monday ... 6=Sunday
  section: string
}

const scheduleEntries = ref<ScheduleEntry[]>([])
const editMode = ref(false)

// Load schedule from localStorage
function loadSchedule() {
  if (!process.client) return
  try {
    const raw = localStorage.getItem('kiss-class-schedule')
    if (raw) scheduleEntries.value = JSON.parse(raw) as ScheduleEntry[]
  } catch { /* ignore */ }
}
loadSchedule()

// Save schedule to localStorage
function saveSchedule() {
  if (!process.client) return
  try {
    localStorage.setItem('kiss-class-schedule', JSON.stringify(scheduleEntries.value))
  } catch { /* ignore */ }
}

// Auto-save on changes
watch(scheduleEntries, () => saveSchedule(), { deep: true })

// Also poll for same-tab changes
if (process.client) {
  const pollInterval = setInterval(() => loadSchedule(), 2000)
  onUnmounted(() => clearInterval(pollInterval))
}

// Classes that are not yet scheduled
const unscheduledClasses = computed(() => {
  const scheduledSlugs = new Set(scheduleEntries.value.map(e => e.classSlug))
  return enrolledClasses.value.filter(c => !scheduledSlugs.has(c.slug))
})

// Drag and drop state
const draggedClassSlug = ref<string | null>(null)
const draggedFromEntryId = ref<number | null>(null)
const dragOverDay = ref<number | null>(null)
const dragOverSection = ref<string | null>(null)

const getClassBySlug = (slug: string) => enrolledClasses.value.find(c => c.slug === slug)

const getEntriesForDaySection = (day: number, section: string) => {
  return scheduleEntries.value.filter(e => e.day === day && e.section === section)
}

const handleDragStart = (classSlug: string, fromEntryId?: number) => {
  draggedClassSlug.value = classSlug
  draggedFromEntryId.value = fromEntryId ?? null
}

const handleDragOver = (event: DragEvent, day: number, section: string) => {
  event.preventDefault()
  dragOverDay.value = day
  dragOverSection.value = section
}

const handleDragLeave = () => {
  dragOverDay.value = null
  dragOverSection.value = null
}

const handleDrop = (event: DragEvent, day: number, section: string) => {
  event.preventDefault()
  dragOverDay.value = null
  dragOverSection.value = null

  if (draggedClassSlug.value === null) return

  // If dragging from an existing entry, remove it first
  if (draggedFromEntryId.value !== null) {
    scheduleEntries.value = scheduleEntries.value.filter(e => e.id !== draggedFromEntryId.value)
  }

  // Add to the target day/section
  const newId = scheduleEntries.value.length ? Math.max(...scheduleEntries.value.map(e => e.id)) + 1 : 1
  scheduleEntries.value.push({
    id: newId,
    classSlug: draggedClassSlug.value,
    day,
    section
  })

  draggedClassSlug.value = null
  draggedFromEntryId.value = null
}

const handleDragEnd = () => {
  draggedClassSlug.value = null
  draggedFromEntryId.value = null
  dragOverDay.value = null
  dragOverSection.value = null
}

const removeEntry = (entryId: number) => {
  scheduleEntries.value = scheduleEntries.value.filter(e => e.id !== entryId)
}

const saveChanges = () => {
  saveSchedule()
  editMode.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold">Weekly Schedule</h2>
          <p class="text-sm text-muted mt-1">Drag your enrolled classes onto days and time slots to schedule them.</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="!editMode"
            variant="outline"
            size="sm"
            @click="editMode = true"
          >
            <template #leading>
              <UIcon name="i-lucide-pencil" class="size-4" />
            </template>
            Edit
          </UButton>
          <div v-else class="flex items-center gap-2">
            <UButton variant="solid" size="sm" @click="saveChanges">
              <template #leading>
                <UIcon name="i-lucide-save" class="size-4" />
              </template>
              Save
            </UButton>
            <UButton variant="ghost" size="sm" @click="editMode = false">
              Cancel
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- No enrolled classes -->
    <UCard v-if="enrolledClasses.length === 0">
      <div class="text-center py-8 text-muted">
        <UIcon name="i-lucide-book-open" class="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p class="text-sm font-medium mb-1">No classes enrolled yet</p>
        <p class="text-xs mb-4">Enroll in classes to start building your weekly schedule.</p>
        <UButton variant="outline" size="sm" to="/degrees">
          <template #leading>
            <UIcon name="i-lucide-graduation-cap" class="size-3" />
          </template>
          Browse Degrees
        </UButton>
      </div>
    </UCard>

    <!-- Unscheduled classes warning -->
    <UCard v-else-if="unscheduledClasses.length > 0" class="bg-warning/10 border-warning/30">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-triangle" class="size-5 text-warning mt-0.5 shrink-0" />
        <div>
          <p class="text-sm font-medium text-warning">
            {{ unscheduledClasses.length }} class{{ unscheduledClasses.length !== 1 ? 'es' : '' }} need schedule days
          </p>
          <p class="text-xs text-warning/80 mt-1">
            Having unassigned classes will lead to a punishment at the end of the day!
          </p>
          <p class="text-xs text-warning/80">
            Click Edit, then drag each class onto a day to schedule it.
          </p>
        </div>
      </div>
    </UCard>

    <!-- Draggable unscheduled classes -->
    <div v-if="editMode && unscheduledClasses.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted">Drag classes to schedule them</p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="cls in unscheduledClasses"
          :key="cls.slug"
          draggable="true"
          class="px-3 py-2 rounded-lg border border-default bg-elevated cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
          @dragstart="handleDragStart(cls.slug)"
          @dragend="handleDragEnd"
        >
          <p class="text-sm font-medium">{{ cls.title }}</p>
          <p class="text-xs text-muted">{{ cls.degreeLabel }}</p>
        </div>
      </div>
    </div>

    <!-- All enrolled classes (for re-scheduling in edit mode) -->
    <div v-if="editMode && enrolledClasses.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted">All enrolled classes (drag to reassign)</p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="cls in enrolledClasses"
          :key="cls.slug"
          draggable="true"
          class="px-3 py-2 rounded-lg border border-default bg-elevated cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
          @dragstart="handleDragStart(cls.slug)"
          @dragend="handleDragEnd"
        >
          <p class="text-sm font-medium">{{ cls.title }}</p>
          <p class="text-xs text-muted">{{ cls.degreeLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Days grid -->
    <div v-if="enrolledClasses.length > 0" class="grid grid-cols-7 gap-3">
      <div
        v-for="(day, dayIndex) in days"
        :key="dayIndex"
        class="space-y-2"
      >
        <!-- Day header -->
        <div class="text-center py-2 rounded-lg bg-elevated">
          <p class="text-sm font-semibold">{{ day }}</p>
        </div>

        <!-- Time sections -->
        <div
          v-for="section in timeSections"
          :key="section.id"
          class="rounded-lg border border-default/50 p-2 min-h-[60px] transition-colors"
          :class="{
            'border-primary/50 bg-primary/5': editMode && dragOverDay === dayIndex && dragOverSection === section.id
          }"
          @dragover="handleDragOver($event, dayIndex, section.id)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, dayIndex, section.id)"
        >
          <!-- Section header -->
          <div class="flex items-center gap-1.5 mb-2">
            <UIcon :name="section.icon" class="size-3 text-muted" />
            <span class="text-xs font-medium text-muted">{{ section.title }}</span>
          </div>

          <!-- Scheduled entries for this section -->
          <div class="space-y-1">
            <div
              v-for="entry in getEntriesForDaySection(dayIndex, section.id)"
              :key="entry.id"
              draggable="true"
              class="px-2 py-1.5 rounded-md bg-default/50 text-xs font-medium cursor-grab active:cursor-grabbing hover:bg-primary/10 transition-colors group relative"
              @dragstart="handleDragStart(entry.classSlug, entry.id)"
              @dragend="handleDragEnd"
            >
              <span>{{ getClassBySlug(entry.classSlug)?.title }}</span>
              <UButton
                v-if="editMode"
                variant="ghost"
                size="xs"
                color="error"
                icon="i-lucide-x"
                square
                class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75"
                @click.stop="removeEntry(entry.id)"
              />
            </div>
          </div>

          <!-- Empty slot hint -->
          <div
            v-if="getEntriesForDaySection(dayIndex, section.id).length === 0 && editMode"
            class="text-xs text-muted/50 text-center py-2"
          >
            Drop here
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <UCard v-if="enrolledClasses.length > 0">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted">
          {{ scheduleEntries.length }} class{{ scheduleEntries.length !== 1 ? 'es' : '' }} scheduled across the week
        </span>
        <UButton
          v-if="editMode"
          variant="solid"
          size="sm"
          @click="saveChanges"
        >
          <template #leading>
            <UIcon name="i-lucide-save" class="size-4" />
          </template>
          Save changes
        </UButton>
      </div>
    </UCard>
  </div>
</template>
