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
          <p class="text-lg">
            Metric not found.
          </p>
        </div>

        <template v-else>
          <MetricHeader
            :title="metric.title"
            :description="metric.description"
            :icon="metric.icon"
            :metric-value="metricValue"
            :achieved-count="achievedCount"
            :total-milestones="totalMilestones"
          />

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
          <template v-for="field in fields" :key="`graph-${field.id}`">
            <MetricGraph
              :field-label="field.label"
              :data-points="getDataPointsForField(field.id)"
              :max-value="getMaxValueForField(field.id)"
              :graph-width="graphWidth"
              :get-point-x="(i: number) => getPointX(i, field.id)"
              :get-point-y="(v: number) => getPointY(v, field.id)"
              :get-graph-points="() => getGraphPoints(field.id)"
              :format-date="formatDate"
            />
          </template>

          <MetricMilestones
            :milestones="milestones"
            :is-milestone-achieved="isMilestoneAchieved"
            :get-field-value="getFieldValue"
            :get-field-label="getFieldLabel"
            :get-field-unit="getFieldUnit"
          />
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import type { MetricField, MetricMilestone, MetricDataPoint } from '~/types/enrollment'

const route = useRoute()
const store = useEnrollmentStore()

const slug = computed(() => route.params.slug as string)

// Query all metrics and find the ones matching this slug
const { data: allMetrics } = await useAsyncData(
  () => `metric-all-${slug.value}`,
  () => queryCollection('metrics').where('stem', 'LIKE', `metrics/${slug.value}/%`).all(),
  { watch: [slug] }
)

const metricData = computed(() => {
  if (!allMetrics.value) return null
  return allMetrics.value.find(item => item.stem?.endsWith('/_index')) || null
})

const levelsData = computed(() => {
  if (!allMetrics.value) return null
  return allMetrics.value.find(item => item.stem?.endsWith('/levels')) || null
})

const metric = computed(() => {
  if (!metricData.value) return null
  const meta = metricData.value.meta || {}
  return {
    slug: slug.value,
    title: metricData.value.title || slug.value.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: (meta.description as string) || '',
    icon: (meta.icon as string) || 'i-lucide-target'
  }
})

const fields = computed<MetricField[]>(() => {
  if (!metricData.value) return []
  const meta = metricData.value.meta || {}
  return (meta.fields as MetricField[]) || []
})

const milestones = computed<MetricMilestone[]>(() => {
  if (!levelsData.value) return []
  const meta = levelsData.value.meta || {}
  return (meta.milestones as MetricMilestone[]) || []
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
