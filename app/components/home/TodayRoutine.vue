<script setup lang="ts">
import { useEnrollmentStore } from '~/stores/enrollment'
import { useScheduleStore } from '~/stores/schedule'

const store = useEnrollmentStore()
const scheduleStore = useScheduleStore()

// ── Fetch clubs and activities ──

const { data: allClubs } = await useAsyncData('routine-clubs', () => queryCollection('clubs').all())
const { data: allActivities } = await useAsyncData('routine-activities', () => queryCollection('activities').all())

// Build a map of club slug -> activity slugs
const clubActivitiesMap = computed(() => {
  const map: Record<string, string[]> = {}
  if (!allClubs.value) return map
  for (const club of allClubs.value) {
    const clubSlug = (club as Record<string, unknown>).stem.slice(6)
    const meta = (club as Record<string, unknown>)?.meta
    const clubActs = meta?.clubActivities
    if (clubSlug && clubActs.length > 0) {
      map[clubSlug] = clubActs
    }
  }
  return map
})

// Get activity slugs from joined clubs (these are "required" activities)
const subscribedActivitySlugs = computed(() => {
  return store.getClubActivitySlugs(clubActivitiesMap.value)
})

// All activities available to add to routine — extract short slugs matching the activities page format
const availableActivities = computed(() => {
  if (!allActivities.value) return []
  const activityMap = new Map<string, Record<string, unknown>>()
  for (const item of allActivities.value) {
    const stem = (item as Record<string, unknown>).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3 || parts[2] !== '_index') continue
    const activitySlug = parts[1]
    const meta = (item as Record<string, unknown>).meta || {}
    const fields = meta.fields || []
    const contribs = meta.contributions || []
    activityMap.set(activitySlug, {
      slug: activitySlug,
      title: item.title || activitySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: meta.description || '',
      icon: meta.icon || 'i-lucide-dumbbell',
      category: meta.category || 'General',
      fields: Array.isArray(fields) ? fields : [],
      contributions: Array.isArray(contribs) ? contribs : []
    })
  }
  return Array.from(activityMap.values()).sort((a: Record<string, unknown>, b: Record<string, unknown>) => a.title.localeCompare(b.title))
})

// ── Routine slot definitions ──

interface RoutineSlotDef {
  id: string
  title: string
  subtitle: string
  icon: string
}

const slotDefinitions: RoutineSlotDef[] = [
  { id: 'morning', title: 'Morning', subtitle: 'Are you ready for training, Girl?', icon: 'i-lucide-sunrise' },
  { id: 'lunch', title: 'Lunch', subtitle: 'Midday break', icon: 'i-lucide-sun' },
  { id: 'evening', title: 'Evening', subtitle: 'After work', icon: 'i-lucide-sunset' },
  { id: 'bedtime', title: 'Bedtime', subtitle: 'Wind down', icon: 'i-lucide-moon' }
]

// ── Routine assignments (from store) ──

// Get assignments for a specific slot
function getSlotAssignments(slotId: string) {
  return scheduleStore.getSlotAssignments(slotId)
}

// Remove an activity from a slot (by slug and slot, not index)
function removeFromSlot(activitySlug: string, slotId: string) {
  scheduleStore.removeRoutineAssignment(activitySlug, slotId)
}

// ── Drag and Drop ──

const draggedActivitySlug = ref<string | null>(null)
const dragOverSlot = ref<string | null>(null)

function onDragStart(activitySlug: string) {
  draggedActivitySlug.value = activitySlug
}

function onDragEnd() {
  draggedActivitySlug.value = null
  dragOverSlot.value = null
}

function onSlotDragOver(slotId: string, e: DragEvent) {
  e.preventDefault()
  dragOverSlot.value = slotId
}

function onSlotDragLeave() {
  dragOverSlot.value = null
}

function onSlotDrop(slotId: string) {
  const slug = draggedActivitySlug.value
  if (!slug) return
  // Don't add if already in this slot
  if (scheduleStore.isActivityInAnySlot(slug) && scheduleStore.getSlotAssignments(slotId).some(a => a.activitySlug === slug)) {
    dragOverSlot.value = null
    draggedActivitySlug.value = null
    return
  }
  scheduleStore.addRoutineAssignment(slug, slotId)
  dragOverSlot.value = null
  draggedActivitySlug.value = null
}

// ── Validation ──

// Check if all required activities are placed in at least one slot
const allRequiredPlaced = computed(() => {
  const placedSlugs = new Set(scheduleStore.routineAssignments.map(a => a.activitySlug))
  const requiredSlugs = subscribedActivitySlugs.value
  if (requiredSlugs.length === 0) return true
  return requiredSlugs.every(slug => placedSlugs.has(slug))
})

const missingRequiredActivities = computed(() => {
  const placedSlugs = new Set(scheduleStore.routineAssignments.map(a => a.activitySlug))
  return subscribedActivitySlugs.value.filter(slug => !placedSlugs.has(slug))
})

// Save routine
const saved = ref(false)
function saveRoutine() {
  if (!allRequiredPlaced.value) return
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}

const totalCount = computed(() => scheduleStore.routineAssignments.length)

// Check if an activity is already in any slot
const isInAnySlot = (slug: string) => scheduleStore.isActivityInAnySlot(slug)

// Check if an activity is required (from club membership)
const isRequiredActivity = (slug: string) => subscribedActivitySlugs.value.includes(slug)
</script>

<template>
  <div class="space-y-6">
    <!-- Header with save button -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-semibold">
          Build Your Routine
        </h2>
        <p class="text-xs text-muted">
          Drag activities to the time slots below. Activities highlighted in amber are required by your clubs.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          variant="solid"
          size="sm"
          :class="saved ? 'bg-success/90' : 'bg-primary/90'"
          :disabled="!allRequiredPlaced"
          @click="saveRoutine()"
        >
          <template #leading>
            <UIcon :name="saved ? 'i-lucide-check' : 'i-lucide-save'" class="size-3" />
          </template>
          {{ saved ? 'Saved!' : 'Save' }}
        </UButton>
      </div>
    </div>

    <!-- Validation warning -->
    <div v-if="!allRequiredPlaced && subscribedActivitySlugs.length > 0" class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-alert-triangle" class="size-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-amber-200">
            Required activities missing
          </p>
          <p class="text-xs text-amber-200/70 mt-0.5">
            Please place the following activities: {{ missingRequiredActivities.map(slug => availableActivities.find((a: any) => a.slug === slug)?.title || slug).join(', ') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Draggable activity pool -->
    <div class="rounded-lg border border-default/50 p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-grip-vertical" class="size-4 text-muted" />
        <h3 class="text-sm font-semibold">
          Activities
        </h3>
        <span v-if="totalCount > 0" class="ml-auto text-xs text-muted">
          {{ totalCount }} placed
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="activity in availableActivities"
          :key="activity.slug"
          draggable="true"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all"
          :class="isInAnySlot(activity.slug)
            ? 'border-default/30 bg-elevated/30 opacity-40'
            : isRequiredActivity(activity.slug)
              ? 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500/80 hover:bg-amber-500/20'
              : 'border-default/50 bg-elevated/50 hover:border-primary/50 hover:bg-elevated/80'
          "
          @dragstart="onDragStart(activity.slug)"
          @dragend="onDragEnd()"
        >
          <div class="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
            <UIcon :name="activity.icon || 'i-lucide-circle-dot'" class="size-3 text-purple-400" />
          </div>
          <span class="text-sm">{{ activity.title }}</span>
          <UIcon v-if="isRequiredActivity(activity.slug)" name="i-lucide-star" class="size-3 text-amber-400 shrink-0" />
          <UIcon v-if="isInAnySlot(activity.slug)" name="i-lucide-check" class="size-3 text-muted shrink-0" />
        </div>
      </div>
    </div>

    <!-- No activities assigned prompt -->
    <div v-if="totalCount === 0 && availableActivities.length > 0" class="text-center py-6 text-muted">
      <UIcon name="i-lucide-list-checks" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">
        Drag activities from above to the time slots below.
      </p>
      <p class="text-xs mt-1">
        Activities highlighted in amber are required by your club memberships.
      </p>
    </div>

    <!-- Routine sections in a grid on large screens -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="slotDef in slotDefinitions"
        :key="slotDef.id"
        class="space-y-3"
      >
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-elevated flex items-center justify-center ring-1 ring-default">
                <UIcon :name="slotDef.icon" class="size-4 text-primary" />
              </div>
              <div>
                <p class="text-sm font-semibold">
                  {{ slotDef.title }}
                </p>
                <p class="text-xs text-muted">
                  {{ slotDef.subtitle }}
                </p>
              </div>
              <span v-if="getSlotAssignments(slotDef.id).length > 0" class="ml-auto text-xs text-muted">
                {{ getSlotAssignments(slotDef.id).length }} task{{ getSlotAssignments(slotDef.id).length !== 1 ? 's' : '' }}
              </span>
            </div>
          </template>

          <!-- Drop zone -->
          <div
            class="space-y-1.5 min-h-[60px] rounded-lg transition-colors"
            :class="dragOverSlot === slotDef.id ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed p-2' : 'p-1'"
            @dragover="onSlotDragOver(slotDef.id, $event)"
            @dragleave="onSlotDragLeave()"
            @drop="onSlotDrop(slotDef.id)"
          >
            <!-- Assigned activities -->
            <div
              v-for="assignment in getSlotAssignments(slotDef.id)"
              :key="assignment.activitySlug"
              class="flex items-center gap-2 p-3 rounded-lg border border-dashed border-default/50 hover:border-primary/50 transition-colors group"
            >
              <!-- Activity icon -->
              <div class="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
                <UIcon
                  :name="availableActivities.find((a: any) => a.slug === assignment.activitySlug)?.icon || 'i-lucide-circle-dot'"
                  class="size-3 text-purple-400"
                />
              </div>

              <span class="text-sm flex-1 truncate">
                {{ availableActivities.find((a: any) => a.slug === assignment.activitySlug)?.title || assignment.activitySlug }}
              </span>

              <!-- Required indicator -->
              <UIcon v-if="isRequiredActivity(assignment.activitySlug)" name="i-lucide-star" class="size-3 text-amber-400 shrink-0" />

              <!-- Remove button -->
              <button
                class="text-xs text-muted hover:text-error shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                @click="removeFromSlot(assignment.activitySlug, slotDef.id)"
              >
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>

            <!-- Empty slot hint -->
            <div v-if="getSlotAssignments(slotDef.id).length === 0" class="text-center py-4 text-muted">
              <p class="text-xs">
                Drop activities here
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
