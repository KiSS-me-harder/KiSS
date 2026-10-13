<template>
  <div v-if="enrolledCount > 0" class="grid grid-cols-7 gap-3">
    <div v-for="(day, dayIndex) in days" :key="dayIndex" class="space-y-2">
      <div class="text-center py-2 rounded-lg bg-elevated">
        <p class="text-sm font-semibold">
          {{ day }}
        </p>
      </div>
      <div
        v-for="section in timeSections"
        :key="section.id"
        class="rounded-lg border border-default/50 p-2 min-h-[60px] transition-colors"
        :class="{
          'border-primary/50 bg-primary/5': isEditMode && dragOverDay === dayIndex && dragOverSection === section.id
        }"
        @dragover="onDragOver($event, dayIndex, section.id)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, dayIndex, section.id)"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <UIcon :name="section.icon" class="size-3 text-muted" />
          <span class="text-xs font-medium text-muted">{{ section.title }}</span>
        </div>
        <div class="space-y-1">
          <div
            v-for="entry in getEntries(dayIndex, section.id)"
            :key="entry.id"
            draggable="true"
            class="px-2 py-1.5 rounded-md bg-default/50 text-xs font-medium cursor-grab active:cursor-grabbing hover:bg-primary/10 transition-colors group relative"
            @dragstart="onDragStart(entry.classSlug, entry.id)"
            @dragend="onDragEnd"
          >
            <span>{{ getClassBySlug(entry.classSlug)?.title }}</span>
            <UButton
              v-if="isEditMode"
              variant="ghost"
              size="xs"
              color="error"
              icon="i-lucide-x"
              square
              class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75"
              @click.stop="onRemoveEntry(entry.id)"
            />
          </div>
        </div>
        <div
          v-if="getEntries(dayIndex, section.id).length === 0 && isEditMode"
          class="text-xs text-muted/50 text-center py-2"
        >
          Drop here
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  enrolledCount: number
  isEditMode: boolean
  dragOverDay: number | null
  dragOverSection: string | null
}>()

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeSections = [
  { id: 'morning', title: 'Morning', icon: 'i-lucide-sunrise' },
  { id: 'lunch', title: 'Lunch', icon: 'i-lucide-sun' },
  { id: 'evening', title: 'Evening', icon: 'i-lucide-sunset' },
  { id: 'bedtime', title: 'Bedtime', icon: 'i-lucide-moon' }
]

const emit = defineEmits<{
  dragOver: [event: DragEvent, day: number, section: string]
  dragLeave: []
  drop: [event: DragEvent, day: number, section: string]
  dragStart: [classSlug: string, entryId?: number]
  dragEnd: []
  removeEntry: [entryId: number]
}>()

function onDragOver(event: DragEvent, day: number, section: string) {
  emit('dragOver', event, day, section)
}
function onDragLeave() {
  emit('dragLeave')
}
function onDrop(event: DragEvent, day: number, section: string) {
  emit('drop', event, day, section)
}
function onDragStart(classSlug: string, entryId?: number) {
  emit('dragStart', classSlug, entryId)
}
function onDragEnd() {
  emit('dragEnd')
}
function onRemoveEntry(entryId: number) {
  emit('removeEntry', entryId)
}

const scheduleEntries = inject('scheduleEntries') as { value: Array<{ id: number, classSlug: string, day: number, section: string }> }
const getClassBySlug = inject('getClassBySlug') as (slug: string) => { title: string } | undefined

function getEntries(day: number, section: string) {
  return scheduleEntries.value.filter(e => e.day === day && e.section === section)
}
</script>
