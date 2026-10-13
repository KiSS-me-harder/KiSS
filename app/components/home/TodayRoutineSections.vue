<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div v-for="slotDef in slotDefinitions" :key="slotDef.id" class="space-y-3">
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
        <div
          class="space-y-1.5 min-h-[60px] rounded-lg transition-colors"
          :class="dragOverSlot === slotDef.id ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed p-2' : 'p-1'"
          @dragover="onDragOver(slotDef.id, $event)"
          @dragleave="onDragLeave()"
          @drop="onDrop(slotDef.id)"
        >
          <div
            v-for="assignment in getSlotAssignments(slotDef.id)"
            :key="assignment.activitySlug"
            class="flex items-center gap-2 p-3 rounded-lg border border-dashed border-default/50 hover:border-primary/50 transition-colors group"
          >
            <div class="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
              <UIcon :name="availableActivities.find((a: any) => a.slug === assignment.activitySlug)?.icon || 'i-lucide-circle-dot'" class="size-3 text-purple-400" />
            </div>
            <span class="text-sm flex-1 truncate">
              {{ availableActivities.find((a: any) => a.slug === assignment.activitySlug)?.title || assignment.activitySlug }}
            </span>
            <UIcon v-if="isRequiredActivity(assignment.activitySlug)" name="i-lucide-star" class="size-3 text-amber-400 shrink-0" />
            <button class="text-xs text-muted hover:text-error shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1" @click.stop="onRemove(assignment.activitySlug, slotDef.id)">
              <UIcon name="i-lucide-x" class="size-3" />
            </button>
          </div>
          <div v-if="getSlotAssignments(slotDef.id).length === 0" class="text-center py-4 text-muted">
            <p class="text-xs">
              Drop activities here
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActivityItem {
  slug: string
  title: string
  icon?: string
}

interface AssignmentItem {
  activitySlug: string
}

defineProps<{
  slotDefinitions: { id: string, title: string, subtitle: string, icon: string }[]
  dragOverSlot: string | null
  availableActivities: ActivityItem[]
  getSlotAssignments: (slotId: string) => AssignmentItem[]
  isRequiredActivity: (slug: string) => boolean
}>()

const emit = defineEmits<{
  dragOver: [slotId: string, event: DragEvent]
  dragLeave: []
  drop: [slotId: string]
  remove: [activitySlug: string, slotId: string]
}>()

function onDragOver(slotId: string, event: DragEvent) {
  emit('dragOver', slotId, event)
}
function onDragLeave() {
  emit('dragLeave')
}
function onDrop(slotId: string) {
  emit('drop', slotId)
}
function onRemove(activitySlug: string, slotId: string) {
  emit('remove', activitySlug, slotId)
}
</script>
