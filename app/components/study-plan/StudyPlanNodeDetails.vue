<template>
  <div v-if="node" class="w-full xl:w-60 xl:shrink-0 space-y-3 xl:max-h-none max-h-[200px] overflow-y-auto">
    <UCard class="border border-white/10">
      <template #header>
        <div class="flex items-center gap-2">
          <span
            class="w-4 h-4 rounded-full ring-2"
            :style="{
              'backgroundColor': getNodeFill(node),
              '--tw-ring-color': getNodeStroke(node)
            } as Record<string, unknown>"
          />
          <span class="font-bold text-sm text-white truncate">{{ node.label }}</span>
        </div>
      </template>
      <div class="space-y-2 text-xs">
        <div v-if="node.degreeLabel" class="flex justify-between">
          <span class="text-white/40">Degree</span>
          <span class="text-white/70">{{ node.degreeLabel }}</span>
        </div>
        <div v-if="node.level" class="flex justify-between">
          <span class="text-white/40">Level</span>
          <span class="text-white/70">{{ node.level }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/40">Status</span>
          <span :class="getNodeStatusColor(node)">
            {{ getNodeStatus(node) }}
          </span>
        </div>
        <div v-if="node.dependencies && node.dependencies.length > 0">
          <p class="text-white/40 mb-1">
            Requires
          </p>
          <div class="space-y-1">
            <div
              v-for="dep in node.dependencies"
              :key="dep.course + dep.level"
              class="flex items-center gap-1.5 text-[10px] text-white/50"
            >
              <UIcon name="i-lucide-arrow-right" class="size-3 shrink-0" />
              <span>{{ formatCourseSlug(dep.course) }} Lvl {{ dep.level }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <NuxtLink
          v-if="node.path && node.path !== '/courses/student'"
          :to="node.path"
        >
          <UButton
            size="xs"
            class="w-full"
            variant="subtle"
            color="neutral"
          >
            <template #leading>
              <UIcon name="i-lucide-external-link" class="size-3" />
            </template>
            View Class
          </UButton>
        </NuxtLink>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { GraphNode } from '~/utils/studyPlanGraph'

defineProps<{
  node: GraphNode | null
  getNodeFill: (node: GraphNode) => string
  getNodeStroke: (node: GraphNode) => string
  getNodeStatus: (node: GraphNode) => string
  getNodeStatusColor: (node: GraphNode) => string
}>()

/**
 * Formats a course slug for display (e.g. "bimbo-behavior" → "Bimbo Behavior").
 * @param slug - The course slug.
 * @returns Formatted display name.
 */
function formatCourseSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>
