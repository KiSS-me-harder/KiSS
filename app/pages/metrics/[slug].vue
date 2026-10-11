<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div v-if="!metric" class="text-center py-12 text-white/50">
          <UIcon name="i-lucide-alert-circle" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-lg">Metric not found.</p>
        </div>

        <template v-else>
      <!-- Metric Header Card -->
      <div class="relative rounded-2xl overflow-hidden border border-purple-500/30">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/20" />
        <div class="absolute inset-0 opacity-50" style="background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 60%)" />

        <div class="relative p-6 sm:p-8">
          <div class="flex items-start gap-5">
            <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <UIcon :name="metric.icon || 'i-lucide-target'" class="w-7 h-7 text-purple-400" />
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-white">{{ metric.title }}</h1>
              <p class="text-white/60 mt-1 leading-relaxed">{{ metric.description }}</p>
              <div class="flex items-center gap-3 mt-3">
                <NuxtLink
                  to="/activities"
                  class="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <UIcon name="i-lucide-dumbbell" class="w-4 h-4" />
                  Log activity to update
                </NuxtLink>
              </div>
            </div>
            <div class="text-right shrink-0 self-start">
              <div class="text-4xl font-bold leading-none" :class="metricValue >= 100 ? 'text-emerald-400' : 'text-purple-400'">
                {{ metricValue }}
              </div>
              <div class="text-xs text-white/40 mt-1">/ 100</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-white/60">Progress</span>
              <span class="text-sm font-semibold text-purple-400">
                {{ achievedCount }} of {{ totalMilestones }} milestones
              </span>
            </div>
            <div class="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="metricValue >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                "
                :style="{ width: `${metricValue}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Current Values -->
      <div v-if="fields.length > 0" class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="field in fields"
          :key="field.id"
          class="rounded-xl border bg-white/5 border-white/10 p-5"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <UIcon :name="field.icon || 'i-lucide-ruler'" class="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <label class="text-sm font-medium text-white">{{ field.label }}</label>
              <span class="text-xs text-white/40 ml-1">({{ field.unit }})</span>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-white">{{ getFieldValue(field.id) }}</span>
            <span class="text-sm text-white/40">{{ field.unit }}</span>
          </div>
        </div>
      </div>

      <!-- Data Point Graphs -->
      <div v-for="field in fields" :key="`graph-${field.id}`" class="rounded-xl border bg-white/5 border-white/10 p-5">
        <h3 class="text-sm font-semibold text-white mb-1">{{ field.label }} Over Time</h3>
        <p class="text-xs text-white/40 mb-4">Tracking progress across all logged activities</p>
        <div v-if="getDataPointsForField(field.id).length < 2" class="text-center py-8 text-white/30 text-sm">
          <UIcon name="i-lucide-bar-chart-2" class="w-8 h-8 mx-auto mb-2 opacity-50" />
          Log more activities to see a progress graph.
        </div>
        <div v-else class="w-full overflow-x-auto">
          <svg :width="graphWidth" :height="120" class="w-full" :viewBox="`0 0 ${graphWidth} 120`">
            <!-- Grid lines -->
            <line x1="40" y1="10" x2="40" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <line x1="40" y1="100" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <!-- Y-axis labels -->
            <text x="35" y="105" fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="end">0</text>
            <text x="35" y="15" fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="end">{{ getMaxValueForField(field.id) }}</text>
            <!-- Data line -->
            <polyline
              :points="getGraphPoints(field.id)"
              fill="none"
              stroke="rgb(168, 85, 247)"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <!-- Data points -->
            <circle
              v-for="(point, i) in getDataPointsForField(field.id)"
              :key="i"
              :cx="getPointX(i, field.id)"
              :cy="getPointY(point.value, field.id)"
              r="4"
              fill="rgb(168, 85, 247)"
              stroke="rgb(168, 85, 247)"
              stroke-width="2"
            />
            <!-- X-axis labels -->
            <text
              v-for="(point, i) in getDataPointsForField(field.id)"
              :key="`label-${i}`"
              :x="getPointX(i, field.id)"
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

      <!-- Milestone Levels -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Milestone Levels</h2>
          <span class="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
            Auto-unlocked by your values
          </span>
        </div>
        <p class="text-sm text-white/50 mb-5">
          Milestones unlock automatically when your reported values meet the requirements.
        </p>

        <!-- Timeline-style milestones -->
        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/10" />

          <div class="space-y-3">
            <div
              v-for="(milestone, index) in milestones"
              :key="milestone.id"
              class="group relative rounded-xl border overflow-hidden transition-all duration-200"
              :class="isMilestoneAchieved(milestone)
                ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
                : 'bg-white/5 border-white/10'
              "
            >
              <div class="flex items-center gap-4 p-4">
                <!-- Level Number with timeline dot -->
                <div class="relative flex items-center justify-center shrink-0">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 z-10"
                    :class="isMilestoneAchieved(milestone)
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/10 text-white/40'
                    "
                  >
                    <UIcon v-if="isMilestoneAchieved(milestone)" name="i-lucide-check" class="w-5 h-5" />
                    <template v-else>{{ index + 1 }}</template>
                  </div>
                </div>

                <!-- Milestone Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold transition-colors" :class="isMilestoneAchieved(milestone) ? 'text-white' : 'text-white/70'">
                    {{ milestone.title }}
                  </h3>
                  <p class="text-sm text-white/50 mt-0.5">{{ milestone.description }}</p>
                  <!-- Requirements -->
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span
                      v-for="(value, fieldId) in milestone.requires"
                      :key="fieldId"
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      :class="getFieldValue(fieldId) >= value
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/10 text-white/40'
                      "
                    >
                      <UIcon name="i-lucide-check" class="w-3 h-3" />
                      {{ getFieldLabel(fieldId) }}: {{ value }}{{ getFieldUnit(fieldId) }}
                      <span class="opacity-60">(current: {{ getFieldValue(fieldId) }}{{ getFieldUnit(fieldId) }})</span>
                    </span>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="shrink-0">
                  <span
                    v-if="isMilestoneAchieved(milestone)"
                    class="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full"
                  >
                    Achieved
                  </span>
                  <span
                    v-else
                    class="text-xs font-medium text-white/30 bg-white/5 px-2.5 py-1 rounded-full"
                  >
                    Not yet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import type { MetricField, MetricMilestone, MetricDataPoint } from '~/stores/enrollment'

const route = useRoute()
const store = useEnrollmentStore()

const slug = computed(() => route.params.slug as string)

// Query all metrics and find the ones matching this slug
const { data: allMetrics } = await useAsyncData(
  () => `metric-all-${slug.value}`,
  () => queryCollection('metrics').where('stem', 'like', `metrics/${slug.value}/%`).all(),
  { watch: [slug] }
)

const metricData = computed(() => {
  if (!allMetrics.value) return null
  return allMetrics.value.find(item => (item as any).stem?.endsWith('/_index')) || null
})

const levelsData = computed(() => {
  if (!allMetrics.value) return null
  return allMetrics.value.find(item => (item as any).stem?.endsWith('/levels')) || null
})

const metric = computed(() => {
  if (!metricData.value) return null
  const item = metricData.value as any
  const meta = item.meta || {}
  return {
    slug: slug.value,
    title: item.title || slug.value.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: meta.description || '',
    icon: meta.icon || 'i-lucide-target'
  }
})

const fields = computed<MetricField[]>(() => {
  if (!metricData.value) return []
  const item = metricData.value as any
  const meta = item.meta || {}
  return meta.fields || []
})

const milestones = computed<MetricMilestone[]>(() => {
  if (!levelsData.value) return []
  const item = levelsData.value as any
  const meta = item.meta || {}
  return meta.milestones || []
})

const totalMilestones = computed(() => milestones.value.length)

const achievedCount = computed(() => {
  return store.getAchievedMilestoneCount(slug.value, milestones.value)
})

const metricValue = computed(() => {
  if (totalMilestones.value === 0) return 0
  return Math.round((achievedCount.value / totalMilestones.value) * 100)
})

const items = computed(() => [
  {
    label: 'Metrics',
    icon: 'i-lucide-target',
    to: '/metrics'
  },
  {
    label: metric.value?.title || slug.value,
    to: `/metrics/${slug.value}`
  }
] satisfies BreadcrumbItem[])

function isMilestoneAchieved(milestone: MetricMilestone): boolean {
  return store.isMilestoneAchieved(slug.value, milestone)
}

function getFieldValue(fieldId: string): number {
  return store.getMetricValueField(slug.value, fieldId)
}

function getFieldLabel(fieldId: string): string {
  const field = fields.value.find(f => f.id === fieldId)
  return field?.label || fieldId
}

function getFieldUnit(fieldId: string): string {
  const field = fields.value.find(f => f.id === fieldId)
  return field?.unit || ''
}

// Graph functions
const graphWidth = 500

function getDataPointsForField(fieldId: string): MetricDataPoint[] {
  return store.getMetricDataPoints(slug.value, fieldId)
}

function getMaxValueForField(fieldId: string): number {
  const points = getDataPointsForField(fieldId)
  if (points.length === 0) return 10
  const max = Math.max(...points.map(p => p.value))
  // Round up to nice number
  return Math.ceil(max * 1.2)
}

function getPointX(index: number, fieldId: string): number {
  const points = getDataPointsForField(fieldId)
  const count = points.length
  if (count <= 1) return 60
  const padding = 60
  const width = graphWidth - padding * 2
  return padding + (index / (count - 1)) * width
}

function getPointY(value: number, fieldId: string): number {
  const maxVal = getMaxValueForField(fieldId)
  const minH = 10
  const maxH = 100
  if (maxVal === 0) return minH
  const ratio = value / maxVal
  return maxH - ratio * (maxH - minH)
}

function getGraphPoints(fieldId: string): string {
  const points = getDataPointsForField(fieldId)
  if (points.length === 0) return ''
  const count = points.length
  const padding = 60
  const width = graphWidth - padding * 2
  return points.map((p, i) => {
    const x = count <= 1 ? 60 : padding + (i / (count - 1)) * width
    const y = getPointY(p.value, fieldId)
    return `${x},${y}`
  }).join(' ')
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

useHead({
  title: computed(() => `${metric.value?.title || 'Metric'} - Metrics - KiSS`)
})
</script>
