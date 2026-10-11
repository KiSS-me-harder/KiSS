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
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Metrics
            </h1>
            <p class="text-white/60 mt-1">
              Track your progress through measurable training milestones.
            </p>
          </div>
          <div class="flex items-center gap-2 text-sm text-white/40">
            <UIcon name="i-lucide-target" class="w-4 h-4" />
            <span>{{ totalAchieved }} of {{ totalMilestones }} milestones</span>
          </div>
        </div>

        <!-- Overall Progress -->
        <div v-if="metrics.length > 0" class="rounded-xl bg-white/5 border border-white/10 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-white/60">Overall Progress</span>
            <span class="text-sm font-semibold text-purple-400">{{ overallValue }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              :style="{ width: `${overallValue}%` }"
            />
          </div>
        </div>

        <div v-if="metrics.length === 0" class="text-center py-12 text-white/50">
          <UIcon name="i-lucide-bar-chart-2" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-lg">
            No metrics defined yet.
          </p>
          <p class="text-sm mt-1">
            Add metric content files to content/metrics/ to get started.
          </p>
        </div>

        <!-- Metric Cards Grid -->
        <div v-else class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="metric in metrics"
            :key="metric.slug"
            :to="`/metrics/${metric.slug}`"
            class="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            :class="metricValue(metric) > 0
              ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/20 border-purple-500/30 hover:border-purple-400/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            "
          >
            <!-- Background Glow -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              :style="`background: radial-gradient(circle at top left, rgba(168, 85, 247, 0.1), transparent 60%)`"
            />

            <div class="relative p-5">
              <!-- Top Row: Icon + Title + Score -->
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  :class="metricValue(metric) > 0
                    ? 'bg-purple-500/20'
                    : 'bg-white/5 group-hover:bg-white/10'
                  "
                >
                  <UIcon
                    :name="metric.icon || 'i-lucide-target'"
                    class="w-6 h-6"
                    :class="metricValue(metric) > 0 ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <h2 class="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {{ metric.title }}
                  </h2>
                  <p class="text-sm text-white/50 mt-0.5 line-clamp-2">{{ metric.description }}</p>
                </div>

                <!-- Score Badge -->
                <div class="shrink-0 text-right">
                  <div class="text-3xl font-bold leading-none" :class="metricValue(metric) >= 100 ? 'text-emerald-400' : 'text-purple-400'">
                    {{ metricValue(metric) }}
                  </div>
                  <div class="text-xs text-white/40 mt-0.5">/ 100</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mt-4 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="metricValue(metric) >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  "
                  :style="{ width: `${metricValue(metric)}%` }"
                />
              </div>

              <!-- Bottom Row: Milestones + CTA -->
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="metricValue(metric) >= 100 ? 'bg-emerald-400' : 'bg-purple-400'"
                  />
                  <span class="text-xs text-white/40">
                    {{ achievedCount(metric) }} of {{ metric.milestones.length }} milestones
                  </span>
                </div>
                <span class="text-xs font-medium text-purple-400/60 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  View milestones
                  <UIcon name="i-lucide-arrow-right" class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { MetricMilestone } from '~/stores/enrollment'

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Metrics',
    icon: 'i-lucide-target',
    to: '/metrics'
  }
])

const { data: allMetrics } = await useAsyncData('metrics-all', () => queryCollection('metrics').all())

const enrollmentStore = useEnrollmentStore()

// Group metrics by slug, combining _index.md (definition) and levels.md (milestones)
const metrics = computed(() => {
  if (!allMetrics.value) return []

  const metricMap = new Map<string, { slug: string, title: string, description: string, icon: string, milestones: MetricMilestone[] }>()

  for (const item of allMetrics.value) {
    const stem = (item as Record<string, unknown>).stem || ''
    const parts = stem.split('/')
    if (parts.length < 3) continue
    const metricSlug = parts[1]

    if (!metricMap.has(metricSlug)) {
      metricMap.set(metricSlug, {
        slug: metricSlug,
        title: '',
        description: '',
        icon: 'i-lucide-target',
        milestones: []
      })
    }

    const metric = metricMap.get(metricSlug)!

    const meta = (item as Record<string, unknown>).meta || {}
    // _index.md has the metric definition
    if (parts[2] === '_index') {
      metric.title = item.title || metricSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      metric.description = meta.description || ''
      metric.icon = meta.icon || 'i-lucide-target'
    }

    // levels.md has the milestones
    if (meta.milestones && Array.isArray(meta.milestones)) {
      metric.milestones = meta.milestones
    }
  }

  return Array.from(metricMap.values()).sort((a, b) => a.title.localeCompare(b.title))
})

function metricValue(metric: { slug: string, milestones: MetricMilestone[] }) {
  const achieved = enrollmentStore.getAchievedMilestoneCount(metric.slug, metric.milestones)
  if (metric.milestones.length === 0) return 0
  return Math.round((achieved / metric.milestones.length) * 100)
}

function achievedCount(metric: { slug: string, milestones: MetricMilestone[] }) {
  return enrollmentStore.getAchievedMilestoneCount(metric.slug, metric.milestones)
}

const totalAchieved = computed(() => metrics.value.reduce((sum, m) => sum + achievedCount(m), 0))
const totalMilestones = computed(() => metrics.value.reduce((sum, m) => sum + m.milestones.length, 0))
const overallValue = computed(() => totalMilestones.value > 0 ? Math.round((totalAchieved.value / totalMilestones.value) * 100) : 0)

useHead({
  title: 'Metrics - KiSS'
})
</script>
