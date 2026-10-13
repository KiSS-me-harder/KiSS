<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'
import { useScheduleStore } from '~/stores/schedule'

const store = useEnrollmentStore()
const scheduleStore = useScheduleStore()
const { app } = useRuntimeConfig()

// Fetch all classes from content to get titles and metadata
const { data: allClassesContent } = await useAsyncData('schedule-edit-classes', () => queryCollection('courses').all())

// Build enrolled classes list with metadata from content
interface EnrolledClassInfo {
  slug: string
  title: string
  degree: string
  degreeLabel: string
  image: string
}

const enrolledClasses = computed<EnrolledClassInfo[]>(() => {
  const enrollments = store.enrollments
  if (!allClassesContent.value || !enrollments || enrollments.length === 0) return []

  const classes: EnrolledClassInfo[] = []
  for (const enrollment of enrollments) {
    const { slug, courseName, degree } = enrollment

    // Find the class index file to get the title
    const prefix = `courses/${degree}/${courseName}/_index`
    const classIndex = allClassesContent.value.find(item => item.stem === prefix)

    const title = classIndex?.title || courseName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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

// Schedule entries from store
const scheduleEntries = computed(() => scheduleStore.scheduleEntries)
const editMode = ref(false)

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
    scheduleStore.removeScheduleEntry(draggedFromEntryId.value)
  }

  // Add to the target day/section
  scheduleStore.addScheduleEntry(draggedClassSlug.value, day, section)

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
  scheduleStore.removeScheduleEntry(entryId)
}

const saveChanges = () => {
  editMode.value = false
}

provide('scheduleEntries', scheduleEntries)
provide('getClassBySlug', getClassBySlug)
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold">
            Weekly Schedule
          </h2>
          <p class="text-sm text-muted mt-1">
            Drag enrolled classes onto days to schedule them.
          </p>
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

    <UCard v-if="enrolledClasses.length === 0">
      <div class="text-center py-8 text-muted">
        <UIcon name="i-lucide-book-open" class="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p class="text-sm font-medium mb-1">
          No classes enrolled yet
        </p>
        <p class="text-xs mb-4">
          Enroll in classes to start building your weekly schedule.
        </p>
        <UButton variant="outline" size="sm" to="/degrees">
          <template #leading>
            <UIcon name="i-lucide-graduation-cap" class="size-3" />
          </template>
          Browse Degrees
        </UButton>
      </div>
    </UCard>

    <UCard v-else-if="unscheduledClasses.length > 0" class="bg-warning/10 border-warning/30">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-triangle" class="size-5 text-warning mt-0.5 shrink-0" />
        <div>
          <p class="text-sm font-medium text-warning">
            {{ unscheduledClasses.length }} class{{ unscheduledClasses.length !== 1 ? 'es' : '' }} need schedule days
          </p>
          <p class="text-xs text-warning/80 mt-1">
            Having unassigned classes will lead to a punishment!
          </p>
          <p class="text-xs text-warning/80">
            Click Edit, then drag each class onto a day.
          </p>
        </div>
      </div>
    </UCard>

    <div v-if="editMode && unscheduledClasses.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted">
        Drag classes to schedule them
      </p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="cls in unscheduledClasses"
          :key="cls.slug"
          draggable="true"
          class="px-3 py-2 rounded-lg border border-default bg-elevated cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
          @dragstart="handleDragStart(cls.slug)"
          @dragend="handleDragEnd"
        >
          <p class="text-sm font-medium">
            {{ cls.title }}
          </p>
          <p class="text-xs text-muted">
            {{ cls.degreeLabel }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="editMode && enrolledClasses.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted">
        All enrolled classes (drag to reassign)
      </p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="cls in enrolledClasses"
          :key="cls.slug"
          draggable="true"
          class="px-3 py-2 rounded-lg border border-default bg-elevated cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
          @dragstart="handleDragStart(cls.slug)"
          @dragend="handleDragEnd"
        >
          <p class="text-sm font-medium">
            {{ cls.title }}
          </p>
          <p class="text-xs text-muted">
            {{ cls.degreeLabel }}
          </p>
        </div>
      </div>
    </div>

    <TodayScheduleGrid
      :enrolled-count="enrolledClasses.length"
      :is-edit-mode="editMode"
      :drag-over-day="dragOverDay"
      :drag-over-section="dragOverSection"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
      @remove-entry="removeEntry"
    />

    <UCard v-if="enrolledClasses.length > 0">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted">
          {{ scheduleEntries.length }} class{{ scheduleEntries.length !== 1 ? 'es' : '' }} scheduled
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
