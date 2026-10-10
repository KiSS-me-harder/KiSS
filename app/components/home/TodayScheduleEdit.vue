<script setup lang="ts">
interface ScheduledClass {
  id: number
  title: string
  frequency: string
}

interface ScheduledEntry {
  id: number
  classId: number
  day: number
  section: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const timeSections = [
  { id: 'morning', title: 'Morning', icon: 'i-lucide-sunrise', timeRange: '06:00 - 12:00' },
  { id: 'lunch', title: 'Lunch', icon: 'i-lucide-sun', timeRange: '12:00 - 14:00' },
  { id: 'evening', title: 'Evening', icon: 'i-lucide-sunset', timeRange: '14:00 - 20:00' },
  { id: 'bedtime', title: 'Bedtime', icon: 'i-lucide-moon', timeRange: '20:00 - 23:00' }
]

// Classes that need to be scheduled
const unscheduledClasses = ref<ScheduledClass[]>([
  { id: 1, title: 'Chastity Basics', frequency: '1 per week' },
  { id: 2, title: 'Prostate Play Basics', frequency: '1 per week' },
  { id: 3, title: 'Girly Underwear', frequency: '1 per week' },
  { id: 4, title: 'Hypno Basics', frequency: '1 per week' }
])

// Already scheduled entries
const scheduledEntries = ref<ScheduledEntry[]>([
  { id: 101, classId: 5, day: 0, section: 'morning' },
  { id: 102, classId: 6, day: 0, section: 'evening' },
  { id: 103, classId: 7, day: 1, section: 'morning' },
  { id: 104, classId: 8, day: 2, section: 'lunch' },
  { id: 105, classId: 5, day: 3, section: 'morning' },
  { id: 106, classId: 6, day: 4, section: 'evening' },
])

const allClasses = ref<ScheduledClass[]>([
  { id: 1, title: 'Chastity Basics', frequency: '1 per week' },
  { id: 2, title: 'Prostate Play Basics', frequency: '1 per week' },
  { id: 3, title: 'Girly Underwear', frequency: '1 per week' },
  { id: 4, title: 'Hypno Basics', frequency: '1 per week' },
  { id: 5, title: 'Physical Play Basics', frequency: '2 per week' },
  { id: 6, title: 'Chastity Training', frequency: '2 per week' },
  { id: 7, title: 'Maid Service', frequency: '1 per week' },
  { id: 8, title: 'Daily Affirmation', frequency: '1 per week' }
])

const editMode = ref(false)

// Drag and drop state
const draggedClassId = ref<number | null>(null)
const draggedFromEntryId = ref<number | null>(null)
const dragOverDay = ref<number | null>(null)
const dragOverSection = ref<string | null>(null)

const getClassById = (id: number) => allClasses.value.find(c => c.id === id)

const getEntriesForDaySection = (day: number, section: string) => {
  return scheduledEntries.value.filter(e => e.day === day && e.section === section)
}

const handleDragStart = (classId: number, fromEntryId?: number) => {
  draggedClassId.value = classId
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

  if (draggedClassId.value === null) return

  // If dragging from an existing entry, remove it first
  if (draggedFromEntryId.value !== null) {
    scheduledEntries.value = scheduledEntries.value.filter(e => e.id !== draggedFromEntryId.value)
  }

  // If dragging an unscheduled class, remove it from unscheduled
  if (draggedFromEntryId.value === null) {
    unscheduledClasses.value = unscheduledClasses.value.filter(c => c.id !== draggedClassId.value)
  }

  // Add to the target day/section
  const newId = scheduledEntries.value.length ? Math.max(...scheduledEntries.value.map(e => e.id)) + 1 : 1
  scheduledEntries.value.push({
    id: newId,
    classId: draggedClassId.value,
    day,
    section
  })

  draggedClassId.value = null
  draggedFromEntryId.value = null
}

const handleDragEnd = () => {
  draggedClassId.value = null
  draggedFromEntryId.value = null
  dragOverDay.value = null
  dragOverSection.value = null
}

const removeEntry = (entryId: number) => {
  const entry = scheduledEntries.value.find(e => e.id === entryId)
  if (entry) {
    // If it was an unscheduled class, add it back
    const cls = getClassById(entry.classId)
    if (cls && !unscheduledClasses.value.find(c => c.id === cls.id)) {
      unscheduledClasses.value.push(cls)
    }
  }
  scheduledEntries.value = scheduledEntries.value.filter(e => e.id !== entryId)
}

const saveChanges = () => {
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
          <p class="text-sm text-muted mt-1">Drag classes onto days and time slots to schedule them.</p>
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

    <!-- Unscheduled classes warning -->
    <UCard v-if="unscheduledClasses.length > 0" class="bg-warning/10 border-warning/30">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-triangle" class="size-5 text-warning mt-0.5 shrink-0" />
        <div>
          <p class="text-sm font-medium text-warning">
            {{ unscheduledClasses.length }} classes need schedule days
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
          :key="cls.id"
          draggable="true"
          class="px-3 py-2 rounded-lg border border-default bg-elevated cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
          @dragstart="handleDragStart(cls.id)"
          @dragend="handleDragEnd"
        >
          <p class="text-sm font-medium">{{ cls.title }}</p>
          <p class="text-xs text-muted">{{ cls.frequency }}</p>
        </div>
      </div>
    </div>

    <!-- Days grid -->
    <div class="grid grid-cols-7 gap-3">
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
              @dragstart="handleDragStart(entry.classId, entry.id)"
              @dragend="handleDragEnd"
            >
              <span>{{ getClassById(entry.classId)?.title }}</span>
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
    <UCard>
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted">
          {{ scheduledEntries.length }} activities scheduled across the week
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
