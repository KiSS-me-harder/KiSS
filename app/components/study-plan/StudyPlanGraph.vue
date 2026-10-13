<template>
  <div
    ref="graphContainer"
    class="flex-1 relative overflow-hidden rounded-xl border border-white/10 bg-black/30 select-none min-h-[300px]"
    @mousedown="panZoom.onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="panZoom.onMouseUp"
    @mouseleave="onMouseLeave"
    @wheel.prevent="panZoom.onWheel"
    @touchstart="panZoom.onTouchStart"
    @touchmove.prevent="panZoom.onTouchMove"
    @touchend="panZoom.onTouchEnd"
  >
    <svg ref="svgElement" class="w-full h-full">
      <defs>
        <filter :id="glowId">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          :id="arrowId"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.15)" />
        </marker>
        <marker
          :id="arrowPlannedId"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="rgba(59,130,246,0.5)" />
        </marker>
        <clipPath v-for="node in nodes" :id="'clip-' + prefix + node.id" :key="'clip-' + prefix + node.id">
          <circle :cx="0" :cy="0" :r="node.id === 'student' ? 28 : 20" />
        </clipPath>
      </defs>

      <StudyPlanGraphSvg
        :nodes="nodes"
        :edges="edges"
        :pan-x="panZoom.panX.value"
        :pan-y="panZoom.panY.value"
        :zoom="panZoom.zoom.value"
        :prefix="prefix"
        :glow-id="glowId"
        :arrow-id="arrowId"
        :arrow-planned-id="arrowPlannedId"
        :get-node-fill="getNodeFill"
        :get-node-stroke="getNodeStroke"
        :get-node-label-color="getNodeLabelColor"
        :is-selected="isSelected"
        @select-node="$emit('select-node', $event)"
        @node-hover="onNodeHover"
        @node-leave="tooltipNode = null"
      />
    </svg>

    <!-- Zoom controls -->
    <div class="absolute bottom-3 right-3 flex flex-col gap-1">
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        title="Zoom in"
        @click="panZoom.zoomIn"
      >
        <UIcon name="i-lucide-zoom-in" class="size-3" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        title="Zoom out"
        @click="panZoom.zoomOut"
      >
        <UIcon name="i-lucide-zoom-out" class="size-3" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        title="Reset view"
        @click="onReset"
      >
        <UIcon name="i-lucide-maximize" class="size-3" />
      </UButton>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltipNode"
      class="absolute pointer-events-none z-50 bg-black/95 border border-white/20 rounded-lg px-3 py-2 text-xs shadow-2xl backdrop-blur-sm"
      :style="{ left: tooltipX + 'px', top: (tooltipY - 10) + 'px', transform: 'translate(-50%, -100%)' }"
    >
      <p class="font-bold text-white">
        {{ tooltipNode.label }}
      </p>
      <p v-if="tooltipNode.degreeLabel" class="text-white/50 text-[10px]">
        {{ tooltipNode.degreeLabel }}
      </p>
      <p v-if="tooltipNode.level" class="text-white/40 text-[10px]">
        Level {{ tooltipNode.level }}
      </p>
      <div class="flex gap-2 mt-1">
        <span v-if="isEnrolledNode(tooltipNode) && !arePrerequisitesMet(tooltipNode)" class="text-gray-400 text-[10px]">Locked (enrolled)</span>
        <span v-if="isEnrolledNode(tooltipNode) && arePrerequisitesMet(tooltipNode)" class="text-emerald-400 text-[10px]">Enrolled</span>
        <span v-if="isInProgress(tooltipNode)" class="text-amber-400 text-[10px]">In Progress</span>
        <span v-if="isPlanned(tooltipNode)" class="text-blue-400 text-[10px]">Planned</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GraphNode, GraphEdge } from '~/utils/studyPlanGraph'
import { useGraphPanZoom } from '~/composables/useGraphPanZoom'

const props = defineProps<{
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  isPlanned: (node: GraphNode) => boolean
  isEnrolledNode: (node: GraphNode) => boolean
  arePrerequisitesMet: (node: GraphNode) => boolean
  isInProgress: (node: GraphNode) => boolean
  isSelected: (node: GraphNode) => boolean
  getNodeFill: (node: GraphNode) => string
  getNodeStroke: (node: GraphNode) => string
  getNodeLabelColor: (node: GraphNode) => string
  prefix?: string
  onCenter?: () => void
}>()

defineEmits<{
  'select-node': [node: GraphNode]
}>()

const prefix = props.prefix || ''
const glowId = 'glow' + (prefix ? '-' + prefix : '')
const arrowId = 'arrow' + (prefix ? '-' + prefix : '')
const arrowPlannedId = 'arrow-planned' + (prefix ? '-' + prefix : '')

const graphContainer = ref<HTMLElement | null>(null)
const svgElement = ref<SVGSVGElement | null>(null)
const panZoom = useGraphPanZoom(graphContainer, svgElement, toRef(props, 'nodes'))

const tooltipNode = ref<GraphNode | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

function onMouseMove(event: MouseEvent) {
  panZoom.onGraphMouseMove(event, (x, y) => {
    tooltipX.value = x
    tooltipY.value = y
  })
}

function onMouseLeave() {
  panZoom.onMouseLeave()
  tooltipNode.value = null
}

function onNodeHover(node: GraphNode, event: MouseEvent) {
  tooltipNode.value = node
  const container = graphContainer.value
  if (container) {
    const rect = container.getBoundingClientRect()
    tooltipX.value = event.clientX - rect.left
    tooltipY.value = event.clientY - rect.top
  }
}

function onReset() {
  panZoom.resetZoom()
  if (props.onCenter) nextTick(() => props.onCenter!)
}

defineExpose({ centerGraph: panZoom.centerGraph })
</script>
