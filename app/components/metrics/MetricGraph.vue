<script setup lang="ts">
/**
 * Renders an SVG line graph showing metric data points over time.
 */
import type { MetricDataPoint } from '~/types/enrollment'

const props = defineProps<{
  fieldLabel: string
  dataPoints: MetricDataPoint[]
  maxValue: number
  graphWidth: number
  getPointX: (index: number) => number
  getPointY: (value: number) => number
  getGraphPoints: () => string
  formatDate: (timestamp: number) => string
}>()

const hasData = computed(() => props.dataPoints.length >= 2)
</script>

<template>
  <div class="rounded-xl border bg-white/5 border-white/10 p-5">
    <h3 class="text-sm font-semibold text-white mb-1">
      {{ fieldLabel }} Over Time
    </h3>
    <p class="text-xs text-white/40 mb-4">
      Tracking progress across all logged activities
    </p>

    <div v-if="!hasData" class="text-center py-8 text-white/30 text-sm">
      <UIcon name="i-lucide-bar-chart-2" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      Log more activities to see a progress graph.
    </div>
    <div v-else class="w-full overflow-x-auto">
      <svg
        :width="graphWidth"
        :height="120"
        class="w-full"
        :viewBox="`0 0 ${graphWidth} 120`"
      >
        <line
          x1="40"
          y1="10"
          x2="40"
          y2="100"
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
        />
        <line
          x1="40"
          y1="100"
          x2="40"
          y2="100"
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
        />
        <text
          x="35"
          y="105"
          fill="rgba(255,255,255,0.3)"
          font-size="10"
          text-anchor="end"
        >0</text>
        <text
          x="35"
          y="15"
          fill="rgba(255,255,255,0.3)"
          font-size="10"
          text-anchor="end"
        >{{ maxValue }}</text>
        <polyline
          :points="getGraphPoints()"
          fill="none"
          stroke="rgb(168, 85, 247)"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <circle
          v-for="(point, i) in dataPoints"
          :key="i"
          :cx="getPointX(i)"
          :cy="getPointY(point.value)"
          r="4"
          fill="rgb(168, 85, 247)"
          stroke="rgb(168, 85, 247)"
          stroke-width="2"
        />
        <text
          v-for="(point, i) in dataPoints"
          :key="`label-${i}`"
          :x="getPointX(i)"
          y="115"
          fill="rgba(255,255,255,0.3)"
          font-size="9"
          text-anchor="middle"
        >
          {{ formatDate(point.timestamp) }}
        </text>
      </svg>
    </div>
  </div>
</template>
