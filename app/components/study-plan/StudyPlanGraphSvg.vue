<template>
  <g :transform="`translate(${panX},${panY}) scale(${zoom})`">
    <g pointer-events="none">
      <path
        v-for="edge in edges"
        :key="edge.key"
        :d="edge.path"
        fill="none"
        :stroke="edge.planned ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.15)'"
        :stroke-width="edge.planned ? 2.5 : 1.5"
        :opacity="edge.planned ? 0.9 : 0.7"
        :marker-end="edge.planned ? 'url(#' + arrowPlannedId + ')' : 'url(#' + arrowId + ')'"
        class="transition-all duration-300"
      />
    </g>
    <g>
      <g
        v-for="node in nodes"
        :key="node.id"
        class="cursor-pointer"
        @click="$emit('select-node', node)"
        @mouseenter="$emit('node-hover', node, $event)"
        @mouseleave="$emit('node-leave')"
      >
        <circle
          :cx="node.x"
          :cy="node.y"
          r="32"
          fill="transparent"
        />
        <g :transform="`translate(${node.x}, ${node.y})`">
          <circle
            :cx="0"
            :cy="0"
            :r="node.id === 'student' ? 28 : 20"
            :fill="getNodeFill(node)"
            class="transition-all duration-200"
          />
          <g v-if="node.image" :clip-path="`url(#clip-${prefix}${node.id})`">
            <image
              :href="node.image"
              :x="node.id === 'student' ? -28 : -20"
              :y="node.id === 'student' ? -28 : -20"
              :width="node.id === 'student' ? 56 : 40"
              :height="node.id === 'student' ? 56 : 40"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <circle
            :cx="0"
            :cy="0"
            :r="node.id === 'student' ? 28 : 20"
            fill="none"
            :stroke="getNodeStroke(node)"
            stroke-width="2.5"
            :filter="isSelected(node) && node.id !== 'student' ? 'url(#' + glowId + ')' : undefined"
            class="transition-all duration-200"
          />
        </g>
        <text
          :x="node.x"
          :y="node.y + (node.id === 'student' ? 44 : 34)"
          text-anchor="middle"
          :font-size="node.id === 'student' ? 12 : 10"
          :fill="getNodeLabelColor(node)"
          font-weight="600"
          class="select-none pointer-events-none"
        >
          {{ node.label }}
        </text>
        <text
          v-if="node.level"
          :x="node.x"
          :y="node.y + (node.id === 'student' ? 56 : 44)"
          text-anchor="middle"
          fill="rgba(255,255,255,0.3)"
          font-size="8"
          class="select-none pointer-events-none"
        >
          Lvl {{ node.level }}
        </text>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import type { GraphNode, GraphEdge } from '~/utils/studyPlanGraph'

defineProps<{
  nodes: GraphNode[]
  edges: GraphEdge[]
  panX: number
  panY: number
  zoom: number
  prefix: string
  glowId: string
  arrowId: string
  arrowPlannedId: string
  getNodeFill: (node: GraphNode) => string
  getNodeStroke: (node: GraphNode) => string
  getNodeLabelColor: (node: GraphNode) => string
  isSelected: (node: GraphNode) => boolean
}>()

defineEmits<{
  'select-node': [node: GraphNode]
  'node-hover': [node: GraphNode, event: MouseEvent]
  'node-leave': []
}>()
</script>
