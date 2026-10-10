<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
        </template>
        <template #trailing>
          <div class="flex items-center gap-2">
            <UButton
              v-if="selectedNode"
              size="xs"
              :color="isPlanned(selectedNode) ? 'error' : 'primary'"
              @click="togglePlanForNode(selectedNode)"
            >
              <template #leading>
                <UIcon :name="isPlanned(selectedNode) ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'" class="size-3" />
              </template>
              {{ isPlanned(selectedNode) ? 'Remove from Plan' : 'Add to Plan' }}
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="subtle"
              @click="resetView"
              title="Clear study plan"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-3" />
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col xl:flex-row gap-4 h-[calc(100vh-12rem)] min-h-[500px]">
        <!-- Left sidebar: Legend + Filters + Plan list -->
        <div class="w-full xl:w-56 shrink-0 space-y-4 overflow-y-auto pr-1">
          <!-- Legend -->
          <div class="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
            <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">Legend</p>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-purple-500 shadow shadow-purple-500/50" />
              <span>Student</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
              <span>Enrolled</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-gray-500 shadow shadow-gray-500/50" />
              <span>Locked (enrolled)</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-amber-500 shadow shadow-amber-500/50" />
              <span>In Progress</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
              <span>Planned</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/60">
              <span class="w-3 h-3 rounded-full bg-white/10 ring-1 ring-white/10" />
              <span>Available</span>
            </div>
          </div>

          <!-- Degree Filters -->
          <div class="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">Filter Degrees</p>
              <button
                class="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                @click="toggleAllDegrees"
              >
                {{ selectedDegrees.size === allDegreesList.length ? 'Deselect All' : 'Select All' }}
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="degree in allDegreesList"
                :key="degree.slug"
                class="space-y-1.5"
              >
                <div class="flex items-center gap-2">
                  <UCheckbox
                    :model-value="selectedDegrees.has(degree.slug)"
                    @change="onDegreeToggle(degree.slug)"
                    size="xs"
                  />
                  <label class="text-xs text-white/70 cursor-pointer select-none" @click="onDegreeToggle(degree.slug)">
                    {{ degree.label }}
                  </label>
                </div>

                <!-- Target title dropdown for this degree -->
                <div
                  v-if="selectedDegrees.has(degree.slug)"
                  class="ml-6"
                >
                  <USelect
                    :model-value="degreeTargetTitle[degree.slug]"
                    @update:model-value="onTitleChange(degree.slug, $event as string)"
                    :items="getDegreeTitles(degree.slug)"
                    size="xs"
                    class="text-[10px]"
                  />
                </div>
              </div>
            </div>

            <!-- Bulk Enroll Button -->
            <UButton
              size="xs"
              color="primary"
              block
              :disabled="selectedDegrees.size === 0 || enrollableClassesCount === 0"
              :loading="enrolling"
              @click="enrollAllSelected"
            >
              <template #leading>
                <UIcon name="i-lucide-user-plus" class="size-3" />
              </template>
              Enroll All ({{ enrollableClassesCount }})
            </UButton>
          </div>

          <!-- Plan list -->
          <div v-if="studyPlanArray.length" class="rounded-xl border border-white/10 bg-black/20 p-3">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">Study Plan</p>
              <UBadge size="xs" variant="subtle" color="info">{{ studyPlanArray.length }}</UBadge>
            </div>
            <div class="space-y-1.5">
              <div
                v-for="planId in studyPlanArray"
                :key="planId"
                class="flex items-center justify-between group/plan"
              >
                <button
                  class="text-xs text-white/70 hover:text-white text-left flex-1"
                  @click="selectPlannedNode(planId)"
                >
                  {{ getPlanLabel(planId) }}
                </button>
                <button
                  class="opacity-0 group-hover/plan:opacity-100 text-white/30 hover:text-red-400 transition-opacity"
                  @click="removeFromPlan(planId)"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </div>
            </div>
          </div>

          <p class="text-[10px] text-white/25 italic leading-relaxed">
            Click any node to select it, then add it to your plan. The path from you to that course and all dependencies will be highlighted.
          </p>
        </div>

        <!-- Graph Container -->
        <div
          class="flex-1 relative overflow-hidden rounded-xl border border-white/10 bg-black/30 select-none"
          ref="graphContainer"
          @mousedown="onMouseDown"
          @mousemove="onGraphMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseLeaveGraph"
          @wheel.prevent="onWheel"
        >
          <svg
            ref="svgElement"
            class="w-full h-full"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.15)" />
              </marker>
              <marker id="arrow-planned" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(59,130,246,0.5)" />
              </marker>
              <!-- Clip paths for circular node images -->
              <clipPath v-for="node in nodes" :key="'clip-' + node.id" :id="'clip-' + node.id">
                <circle
                  :cx="0"
                  :cy="0"
                  :r="node.id === 'student' ? 20 : 14"
                />
              </clipPath>
            </defs>

            <!-- Pan/Zoom transform group -->
            <g :transform="`translate(${panX},${panY}) scale(${zoom})`">

            <!-- Edges -->
            <g pointer-events="none">
              <path
                v-for="edge in edges"
                :key="edge.key"
                :d="edge.path"
                fill="none"
                :stroke="edge.planned ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'"
                :stroke-width="edge.planned ? 2 : 1"
                :opacity="edge.planned ? 0.9 : 0.4"
                :marker-end="edge.planned ? 'url(#arrow-planned)' : 'url(#arrow)'"
                class="transition-all duration-300"
              />
            </g>

            <!-- Nodes -->
            <g>
              <g
                v-for="node in nodes"
                :key="node.id"
                @click="selectNode(node)"
                @mouseenter="onNodeHover(node, $event)"
                @mouseleave="tooltipNode = null"
                class="cursor-pointer"
              >
                <!-- Hit area (larger invisible circle for easier clicking) -->
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  r="24"
                  fill="transparent"
                />
                <!-- Node circle with image -->
                <g :transform="`translate(${node.x}, ${node.y})`">
                  <!-- Background fill circle -->
                  <circle
                    :cx="0"
                    :cy="0"
                    :r="node.id === 'student' ? 20 : 14"
                    :fill="getNodeFill(node)"
                    class="transition-all duration-200"
                  />
                  <!-- Clipped image overlay -->
                  <g v-if="node.image" :clip-path="`url(#clip-${node.id})`">
                    <image
                      :href="node.image"
                      :x="node.id === 'student' ? -20 : -14"
                      :y="node.id === 'student' ? -20 : -14"
                      :width="node.id === 'student' ? 40 : 28"
                      :height="node.id === 'student' ? 40 : 28"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                  <!-- Stroke ring -->
                  <circle
                    :cx="0"
                    :cy="0"
                    :r="node.id === 'student' ? 20 : 14"
                    fill="none"
                    :stroke="getNodeStroke(node)"
                    stroke-width="2.5"
                    :filter="(isSelected(node) || isPlanned(node)) && node.id !== 'student' ? 'url(#glow)' : undefined"
                    class="transition-all duration-200"
                  />
                </g>
                <!-- Node label -->
                <text
                  :x="node.x"
                  :y="node.y + (node.id === 'student' ? 34 : 26)"
                  text-anchor="middle"
                  :fill="getNodeLabelColor(node)"
                  :font-size="node.id === 'student' ? 11 : 9"
                  font-weight="600"
                  class="select-none pointer-events-none"
                >
                  {{ node.label }}
                </text>
                <!-- Level badge -->
                <text
                  v-if="node.level"
                  :x="node.x"
                  :y="node.y + (node.id === 'student' ? 46 : 36)"
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
          </svg>

          <!-- Zoom controls -->
          <div class="absolute bottom-3 right-3 flex flex-col gap-1">
            <UButton size="xs" color="neutral" variant="outline" @click="zoomIn" title="Zoom in">
              <UIcon name="i-lucide-zoom-in" class="size-3" />
            </UButton>
            <UButton size="xs" color="neutral" variant="outline" @click="zoomOut" title="Zoom out">
              <UIcon name="i-lucide-zoom-out" class="size-3" />
            </UButton>
            <UButton size="xs" color="neutral" variant="outline" @click="resetPanZoom" title="Reset view">
              <UIcon name="i-lucide-maximize" class="size-3" />
            </UButton>
          </div>

          <!-- Tooltip -->
          <div
            v-if="tooltipNode"
            class="absolute pointer-events-none z-50 bg-black/95 border border-white/20 rounded-lg px-3 py-2 text-xs shadow-2xl backdrop-blur-sm"
            :style="{ left: tooltipX + 'px', top: (tooltipY - 10) + 'px', transform: 'translate(-50%, -100%)' }"
          >
            <p class="font-bold text-white">{{ tooltipNode.label }}</p>
            <p v-if="tooltipNode.degreeLabel" class="text-white/50 text-[10px]">{{ tooltipNode.degreeLabel }}</p>
            <p v-if="tooltipNode.level" class="text-white/40 text-[10px]">Level {{ tooltipNode.level }}</p>
            <div class="flex gap-2 mt-1">
              <span v-if="isEnrolledNode(tooltipNode) && !arePrerequisitesMet(tooltipNode)" class="text-gray-400 text-[10px]">Locked (enrolled)</span>
              <span v-if="isEnrolledNode(tooltipNode) && arePrerequisitesMet(tooltipNode)" class="text-emerald-400 text-[10px]">Enrolled</span>
              <span v-if="isInProgress(tooltipNode)" class="text-amber-400 text-[10px]">In Progress</span>
              <span v-if="isPlanned(tooltipNode)" class="text-blue-400 text-[10px]">Planned</span>
            </div>
          </div>
        </div>

        <!-- Right sidebar: Selected Node Details -->
        <div v-if="selectedNode" class="w-full xl:w-60 shrink-0 space-y-3">
          <UCard class="border border-white/10">
            <template #header>
              <div class="flex items-center gap-2">
                <span
                  class="w-4 h-4 rounded-full ring-2"
                  :style="{
                    backgroundColor: getNodeFill(selectedNode),
                    '--tw-ring-color': getNodeStroke(selectedNode)
                  } as any"
                />
                <span class="font-bold text-sm text-white truncate">{{ selectedNode.label }}</span>
              </div>
            </template>
            <div class="space-y-2 text-xs">
              <div v-if="selectedNode.degreeLabel" class="flex justify-between">
                <span class="text-white/40">Degree</span>
                <span class="text-white/70">{{ selectedNode.degreeLabel }}</span>
              </div>
              <div v-if="selectedNode.level" class="flex justify-between">
                <span class="text-white/40">Level</span>
                <span class="text-white/70">{{ selectedNode.level }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/40">Status</span>
                <span :class="getNodeStatusColor(selectedNode)">
                  {{ getNodeStatus(selectedNode) }}
                </span>
              </div>
              <div v-if="selectedNode.dependencies && selectedNode.dependencies.length > 0">
                <p class="text-white/40 mb-1">Requires</p>
                <div class="space-y-1">
                  <div
                    v-for="dep in selectedNode.dependencies"
                    :key="dep.class + dep.level"
                    class="flex items-center gap-1.5 text-[10px] text-white/50"
                  >
                    <UIcon name="i-lucide-arrow-right" class="size-3 shrink-0" />
                    <span>{{ dep.class }} Lvl {{ dep.level }}</span>
                  </div>
                </div>
              </div>
            </div>
            <template #footer>
              <NuxtLink
                v-if="selectedNode.path && selectedNode.path !== '/classes/student'"
                :to="selectedNode.path"
              >
                <UButton size="xs" class="w-full" variant="subtle" color="neutral">
                  <template #leading>
                    <UIcon name="i-lucide-external-link" class="size-3" />
                  </template>
                  View Class
                </UButton>
              </NuxtLink>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

useHead({ title: 'Study Plan' })

useSeoMeta({
  title: 'Study Plan',
  description: 'Visualize your study path as a talent tree.',
  ogTitle: 'Study Plan',
  ogDescription: 'Visualize your study path as a talent tree.',
  ogType: 'website'
})

const store = useEnrollmentStore()
const graphContainer = ref<HTMLElement | null>(null)
const svgElement = ref<SVGSVGElement | null>(null)

/* ── Types ── */

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  level?: number
  degreeLabel?: string
  className?: string
  degree?: string
  dependencies?: { class: string; level: number }[]
  path?: string
  image?: string
}

interface GraphEdge {
  key: string
  from: string
  to: string
  path: string
  planned: boolean
}

/* ── Data loading ── */

const { data: allClasses } = await useAsyncData('study-plan-classes', () => {
  return queryCollection('classes').all()
}, { server: false })

const { data: allDegrees } = await useAsyncData('study-plan-degrees', () => {
  return queryCollection('degrees').all()
}, { server: false })

/* ── Degree titles map: degree slug → list of titles with their class requirements ── */

interface DegreeTitle {
  name: string
  description: string
  classes: { slug: string; maxLevel: number }[]
}

const degreeTitlesMap = computed(() => {
  const map = new Map<string, DegreeTitle[]>()
  if (!allDegrees.value) return map
  for (const degree of allDegrees.value) {
    const stem = (degree as any).stem || ''
    const slug = stem.split('/').pop() || ''
    const levels = (degree as any).meta?.levels || []
    const titles: DegreeTitle[] = levels.map((l: any) => ({
      name: l.name || '',
      description: l.description || '',
      classes: (l.classes || []).map((c: any) => ({
        slug: c.slug || '',
        maxLevel: c.maxLevel || 100
      }))
    }))
    map.set(slug, titles)
  }
  return map
})

function getDegreeTitles(degreeSlug: string): string[] {
  const titles = degreeTitlesMap.value.get(degreeSlug)
  if (!titles || titles.length === 0) return []
  return titles.map(t => t.name)
}

/* ── Class map: key → class info ── */

interface ClassInfo {
  degree: string
  degreeLabel: string
  className: string
  classSlug: string
  levels: number[]
  dependencies: Map<number, { class: string; level: number }[]>
}

const classMap = computed(() => {
  const map = new Map<string, ClassInfo>()

  if (!allClasses.value) return map

  for (const item of allClasses.value) {
    const parts = (item as any).stem?.split('/') || []
    if (parts.length < 4) continue

    const degree = parts[1]
    const classSlug = parts[2]
    const key = `${degree}/${classSlug}`
    const level = parseInt((item as any).meta?.level, 10)
    const classTitle = (item as any).meta?.class || classSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const degreeLabel = degree.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const deps = (item as any).meta?.dependencies || []

    if (!map.has(key)) {
      map.set(key, { degree, degreeLabel, className: classTitle, classSlug, levels: [], dependencies: new Map() })
    }

    const entry = map.get(key)!
    if (!entry.levels.includes(level)) entry.levels.push(level)
    if (deps.length > 0) entry.dependencies.set(level, deps)
  }

  for (const [, entry] of map) entry.levels.sort((a, b) => a - b)
  return map
})

/* ── Study plan state ── */

const studyPlan = ref<Set<string>>(new Set())

function loadStudyPlan() {
  try {
    const raw = localStorage.getItem('kiss-study-plan')
    if (raw) studyPlan.value = new Set(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
}
loadStudyPlan()

watch(studyPlan, (val) => {
  try { localStorage.setItem('kiss-study-plan', JSON.stringify([...val])) } catch { /* ignore */ }
}, { deep: true })

const studyPlanArray = computed(() => Array.from(studyPlan.value))

/* ── Degree filter state ── */

interface DegreeEntry {
  slug: string
  label: string
}

const allDegreesList = computed(() => {
  const degreeSet = new Map<string, string>()
  for (const [, info] of classMap.value) {
    if (!degreeSet.has(info.degree)) {
      degreeSet.set(info.degree, info.degreeLabel)
    }
  }
  return Array.from(degreeSet.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

// Persist selected degrees to localStorage
const selectedDegrees = ref<Set<string>>(new Set())
const degreeTargetTitle = ref<Record<string, string>>({})

function loadFilterState() {
  try {
    const rawDeg = localStorage.getItem('kiss-study-plan-degrees')
    if (rawDeg) selectedDegrees.value = new Set(JSON.parse(rawDeg) as string[])
    const rawTitle = localStorage.getItem('kiss-study-plan-titles')
    if (rawTitle) degreeTargetTitle.value = JSON.parse(rawTitle) as Record<string, string>
  } catch { /* ignore */ }
  // Default: select all degrees at first title (Junior)
  if (selectedDegrees.value.size === 0) {
    for (const d of allDegreesList.value) {
      selectedDegrees.value.add(d.slug)
      const titles = getDegreeTitles(d.slug)
      degreeTargetTitle.value[d.slug] = titles[0] || 'Junior'
    }
  }
  // Ensure all degrees have a target title
  for (const d of allDegreesList.value) {
    if (!(d.slug in degreeTargetTitle.value)) {
      const titles = getDegreeTitles(d.slug)
      degreeTargetTitle.value[d.slug] = titles[0] || 'Junior'
    }
  }
}
loadFilterState()

watch(selectedDegrees, (val) => {
  try { localStorage.setItem('kiss-study-plan-degrees', JSON.stringify([...val])) } catch { /* ignore */ }
}, { deep: true })

watch(degreeTargetTitle, (val) => {
  try { localStorage.setItem('kiss-study-plan-titles', JSON.stringify(val)) } catch { /* ignore */ }
}, { deep: true })

function onDegreeToggle(degreeSlug: string) {
  if (selectedDegrees.value.has(degreeSlug)) {
    selectedDegrees.value.delete(degreeSlug)
  } else {
    selectedDegrees.value.add(degreeSlug)
    if (!(degreeSlug in degreeTargetTitle.value)) {
      const titles = getDegreeTitles(degreeSlug)
      degreeTargetTitle.value[degreeSlug] = titles[0] || 'Junior'
    }
  }
  buildGraph()
}

function toggleAllDegrees() {
  if (selectedDegrees.value.size === allDegreesList.value.length) {
    selectedDegrees.value.clear()
  } else {
    for (const d of allDegreesList.value) {
      selectedDegrees.value.add(d.slug)
      if (!(d.slug in degreeTargetTitle.value)) {
        const titles = getDegreeTitles(d.slug)
        degreeTargetTitle.value[d.slug] = titles[0] || 'Junior'
      }
    }
  }
  buildGraph()
}

function onTitleChange(degreeSlug: string, titleName: string) {
  degreeTargetTitle.value[degreeSlug] = titleName
  buildGraph()
}

/* ── Get classes required by selected titles ── */

// Returns a set of class keys (degree/classSlug) required by all selected degree titles
const titleClassSet = computed(() => {
  const classKeys = new Set<string>()
  for (const degreeSlug of selectedDegrees.value) {
    const targetTitle = degreeTargetTitle.value[degreeSlug]
    if (!targetTitle) continue
    const titles = degreeTitlesMap.value.get(degreeSlug)
    if (!titles) continue
    const title = titles.find(t => t.name === targetTitle)
    if (!title) continue
    for (const cls of title.classes) {
      classKeys.add(cls.slug)
    }
  }
  return classKeys
})

/* ── Filtered class map: only classes required by selected titles ── */

const filteredClassMap = computed(() => {
  const map = new Map<string, ClassInfo>()
  for (const [key, info] of classMap.value) {
    if (!selectedDegrees.value.has(info.degree)) continue
    // Check if this class is required by the selected title
    if (!titleClassSet.value.has(key)) continue
    // Filter levels to only include those required by the title
    const targetTitle = degreeTargetTitle.value[info.degree]
    const titles = degreeTitlesMap.value.get(info.degree)
    const title = titles?.find(t => t.name === targetTitle)
    const titleClass = title?.classes.find(c => c.slug === key)
    const maxLevel = titleClass?.maxLevel ?? 100
    const filteredLevels = info.levels.filter(l => l <= maxLevel)
    if (filteredLevels.length === 0) continue
    // Filter dependencies to only reference visible levels
    const filteredDeps = new Map<number, { class: string; level: number }[]>()
    for (const [lvl, deps] of info.dependencies) {
      if (lvl <= maxLevel) {
        filteredDeps.set(lvl, deps)
      }
    }
    map.set(key, { ...info, levels: filteredLevels, dependencies: filteredDeps })
  }
  return map
})

/* ── Enrollable classes: classes required by selected titles, not yet enrolled ── */

const enrolling = ref(false)

// Count all non-enrolled classes required by selected titles
const enrollableClassesCount = computed(() => {
  let count = 0
  for (const [key, info] of classMap.value) {
    if (!selectedDegrees.value.has(info.degree)) continue
    if (!titleClassSet.value.has(key)) continue
    if (!store.isEnrolled(key)) {
      count++
    }
  }
  return count
})

// Enroll in all classes required by selected titles
async function enrollAllSelected() {
  enrolling.value = true
  // Small delay so the loading state is visible
  await new Promise(r => setTimeout(r, 300))
  for (const [key, info] of classMap.value) {
    if (!selectedDegrees.value.has(info.degree)) continue
    if (!titleClassSet.value.has(key)) continue
    if (!store.isEnrolled(key)) {
      // Enroll with levels up to the title's maxLevel
      const targetTitle = degreeTargetTitle.value[info.degree]
      const titles = degreeTitlesMap.value.get(info.degree)
      const title = titles?.find(t => t.name === targetTitle)
      const titleClass = title?.classes.find(c => c.slug === key)
      const maxLevel = titleClass?.maxLevel ?? 100
      const levelsToEnroll = info.levels.filter(l => l <= maxLevel)
      store.enrollInClass(key, info.className, info.degree, levelsToEnroll)
    }
  }
  enrolling.value = false
  buildGraph()
}

/* ── Node / Edge state ── */

const nodes = ref<GraphNode[]>([])
const edges = ref<GraphEdge[]>([])
const selectedNode = ref<GraphNode | null>(null)
const tooltipNode = ref<GraphNode | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

/* ── Pan & Zoom state ── */

const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const panStartOffset = ref({ x: 0, y: 0 })

/* ── Pan & Zoom handlers ── */

function onMouseDown(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.cursor-pointer')) return
  isPanning.value = true
  panStart.value = { x: event.clientX, y: event.clientY }
  panStartOffset.value = { x: panX.value, y: panY.value }
}

function onGraphMouseMove(event: MouseEvent) {
  if (isPanning.value) {
    panX.value = panStartOffset.value.x + (event.clientX - panStart.value.x)
    panY.value = panStartOffset.value.y + (event.clientY - panStart.value.y)
    return
  }
  // Tooltip logic
  if (!graphContainer.value || !svgElement.value) return
  const rect = graphContainer.value.getBoundingClientRect()
  const svgRect = svgElement.value.getBoundingClientRect()
  // Convert mouse to SVG coords accounting for pan/zoom
  const svgX = ((event.clientX - svgRect.left) - panX.value) / zoom.value
  const svgY = ((event.clientY - svgRect.top) - panY.value) / zoom.value
  let closest: GraphNode | null = null
  let closestDist = 30 / zoom.value
  for (const node of nodes.value) {
    const dx = svgX - node.x
    const dy = svgY - node.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < closestDist) {
      closestDist = dist
      closest = node
    }
  }
  tooltipNode.value = closest
  if (closest) {
    tooltipX.value = event.clientX - rect.left
    tooltipY.value = event.clientY - rect.top
  }
}

function onMouseUp() {
  isPanning.value = false
}

function onMouseLeaveGraph() {
  isPanning.value = false
  tooltipNode.value = null
}

function onWheel(event: MouseEvent) {
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.2, Math.min(5, zoom.value * delta))
  
  // Zoom towards mouse position
  const rect = graphContainer.value!.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  const scale = newZoom / zoom.value
  panX.value = mouseX - (mouseX - panX.value) * scale
  panY.value = mouseY - (mouseY - panY.value) * scale
  zoom.value = newZoom
}

function zoomIn() {
  const rect = graphContainer.value?.getBoundingClientRect()
  const cx = rect ? rect.width / 2 : 0
  const cy = rect ? rect.height / 2 : 0
  const newZoom = Math.min(5, zoom.value * 1.2)
  const scale = newZoom / zoom.value
  panX.value = cx - (cx - panX.value) * scale
  panY.value = cy - (cy - panY.value) * scale
  zoom.value = newZoom
}

function zoomOut() {
  const rect = graphContainer.value?.getBoundingClientRect()
  const cx = rect ? rect.width / 2 : 0
  const cy = rect ? rect.height / 2 : 0
  const newZoom = Math.max(0.2, zoom.value / 1.2)
  const scale = newZoom / zoom.value
  panX.value = cx - (cx - panX.value) * scale
  panY.value = cy - (cy - panY.value) * scale
  zoom.value = newZoom
}

function resetPanZoom() {
  centerGraph()
  zoom.value = 1
}

/* ── Helpers ── */

function isPlanned(node: GraphNode) {
  return node.id !== 'student' && studyPlan.value.has(node.id)
}

function isEnrolledNode(node: GraphNode) {
  if (node.id === 'student') return false
  const baseKey = node.id.split('@')[0] ?? node.id
  return store.isEnrolled(baseKey)
}

// Check if this node's prerequisites are met (so it's "active" rather than "locked")
function arePrerequisitesMet(node: GraphNode) {
  if (node.id === 'student') return true
  if (!node.dependencies || node.dependencies.length === 0) return true
  const baseKey = node.id.split('@')[0] ?? node.id
  return store.areDependenciesMet(baseKey, node.level ?? 100, node.dependencies)
}

function isInProgress(node: GraphNode) {
  if (node.id === 'student') return false
  const baseKey = node.id.split('@')[0] ?? node.id
  const enrollment = store.getEnrollment(baseKey)
  if (!enrollment) return false
  return enrollment.levels.some(l => l.completed) && enrollment.levels.some(l => !l.completed)
}

function isSelected(node: GraphNode) {
  return selectedNode.value?.id === node.id
}

function getNodeStatus(node: GraphNode) {
  if (node.id === 'student') return 'You'
  if (isInProgress(node)) return 'In Progress'
  if (isEnrolledNode(node)) {
    if (!arePrerequisitesMet(node)) return 'Locked (enrolled)'
    return 'Enrolled'
  }
  if (isPlanned(node)) return 'Planned'
  return 'Available'
}

function getNodeStatusColor(node: GraphNode) {
  if (node.id === 'student') return 'text-purple-400'
  if (isInProgress(node)) return 'text-amber-400'
  if (isEnrolledNode(node) && !arePrerequisitesMet(node)) return 'text-gray-400'
  if (isEnrolledNode(node)) return 'text-emerald-400'
  if (isPlanned(node)) return 'text-blue-400'
  return 'text-white/40'
}

function getNodeFill(node: GraphNode) {
  if (node.id === 'student') return '#a855f7'
  if (isInProgress(node)) return '#f59e0b'
  if (isEnrolledNode(node) && !arePrerequisitesMet(node)) return '#6b7280'
  if (isEnrolledNode(node)) return '#10b981'
  if (isPlanned(node)) return '#3b82f6'
  return 'rgba(255,255,255,0.1)'
}

function getNodeStroke(node: GraphNode) {
  if (node.id === 'student') return 'rgba(168,85,247,0.6)'
  if (isInProgress(node)) return 'rgba(245,158,11,0.6)'
  if (isEnrolledNode(node) && !arePrerequisitesMet(node)) return 'rgba(107,114,128,0.5)'
  if (isEnrolledNode(node)) return 'rgba(16,185,129,0.6)'
  if (isPlanned(node)) return 'rgba(59,130,246,0.6)'
  return 'rgba(255,255,255,0.08)'
}

function getNodeLabelColor(node: GraphNode) {
  if (node.id === 'student') return '#fff'
  if (isInProgress(node)) return '#fbbf24'
  if (isEnrolledNode(node) && !arePrerequisitesMet(node)) return '#9ca3af'
  if (isEnrolledNode(node)) return '#34d399'
  if (isPlanned(node)) return '#60a5fa'
  return 'rgba(255,255,255,0.65)'
}

/* ── Dependency path resolution ── */

// Given a node id (possibly with @tier suffix), return all ancestor node ids that need to be highlighted
function getDependencyPath(nodeId: string): Set<string> {
  const path = new Set<string>()
  const stack = [nodeId]

  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === 'student' || path.has(current)) continue
    path.add(current)

    // Find dependencies of this node
    const baseKey = current.split('@')[0] ?? current
    const tierSuffix = current.includes('@') ? (current.split('@')[1] ?? '100') : '100'
    const tierLevel = parseInt(tierSuffix, 10)

    const classInfo = filteredClassMap.value.get(baseKey)
    if (!classInfo) continue

    // Find the closest level <= tierLevel that has dependencies
    const sortedLevels = [...classInfo.levels].sort((a, b) => b - a).filter(l => l <= tierLevel)
    for (const lvl of sortedLevels) {
      const deps = classInfo.dependencies.get(lvl)
      if (deps && deps.length > 0) {
        for (const dep of deps) {
          // Find the class key matching this dependency
          for (const [dk, de] of filteredClassMap.value) {
            if (de.className === dep.class) {
              // Find the highest tier of this dep class that exists
              const depLevels = de.levels.filter(l => l < tierLevel).sort((a, b) => b - a)
              if (depLevels.length > 0) {
                const depTier = depLevels[0]!
                if (depTier >= 300) stack.push(`${dk}@300`)
                else if (depTier >= 200) stack.push(`${dk}@200`)
                else stack.push(dk)
              } else {
                stack.push(dk)
              }
            }
          }
        }
        break // only need the highest relevant tier's deps
      }
    }
  }

  return path
}

function isOnPlannedPath(nodeId: string): boolean {
  if (nodeId === 'student') return false
  if (studyPlan.value.has(nodeId)) return true

  for (const planId of studyPlan.value) {
    const path = getDependencyPath(planId)
    if (path.has(nodeId)) return true
  }
  return false
}

/* ── Graph building ── */

function centerGraph() {
  if (nodes.value.length === 0 || !graphContainer.value) return
  const containerRect = graphContainer.value.getBoundingClientRect()
  const pad = 80
  const minX = Math.min(...nodes.value.map(n => n.x)) - pad
  const maxX = Math.max(...nodes.value.map(n => n.x)) + pad
  const minY = Math.min(...nodes.value.map(n => n.y)) - pad
  const maxY = Math.max(...nodes.value.map(n => n.y)) + pad
  const graphW = maxX - minX
  const graphH = maxY - minY
  const containerW = containerRect.width
  const containerH = containerRect.height
  // Center the graph in the container
  panX.value = (containerW - graphW) / 2 - minX
  panY.value = (containerH - graphH) / 2 - minY
}

function buildGraph() {
  const nodeList: GraphNode[] = []
  const edgeList: GraphEdge[] = []
  const posMap = new Map<string, { x: number; y: number }>()

  const classes = Array.from(filteredClassMap.value.entries())

  // Layout constants
  const nodeSpacingX = 130
  const intraGroupSpacingX = 90
  const tierSpacingY = 180
  const studentY = 40
  const tier100Y = studentY + tierSpacingY
  const tier200Y = tier100Y + tierSpacingY
  const tier300Y = tier200Y + tierSpacingY

  // Student node (will be centered after all nodes are placed)
  const studentNode: GraphNode = { id: 'student', label: 'Student', x: 0, y: studentY, image: '/img/placeholder.webp' }
  nodeList.push(studentNode)

  // ── Collect all classes by tier ──
  const tier100Classes: { key: string; info: ClassInfo }[] = []
  const tier200Classes: { key: string; info: ClassInfo }[] = []
  const tier300Classes: { key: string; info: ClassInfo }[] = []

  for (const [key, info] of classes) {
    if (info.levels.includes(100)) tier100Classes.push({ key, info })
    if (info.levels.includes(200) && info.dependencies.get(200)?.length) tier200Classes.push({ key, info })
    if (info.levels.includes(300) && info.dependencies.get(300)?.length) tier300Classes.push({ key, info })
  }

  // Sort each tier by degree then class name for consistent ordering
  const sortFn = (a: { key: string; info: ClassInfo }, b: { key: string; info: ClassInfo }) => {
    const dCmp = a.info.degreeLabel.localeCompare(b.info.degreeLabel)
    if (dCmp !== 0) return dCmp
    return a.info.className.localeCompare(b.info.className)
  }
  tier100Classes.sort(sortFn)
  tier200Classes.sort(sortFn)
  tier300Classes.sort(sortFn)

  // ── Assign columns based on degree grouping ──
  // Group tier 100 by degree, assign columns per degree group
  const degreeColumns = new Map<string, number>()
  let col = 0
  const degreeGroups = new Map<string, { key: string; info: ClassInfo }[]>()
  for (const { key, info } of tier100Classes) {
    if (!degreeGroups.has(info.degree)) degreeGroups.set(info.degree, [])
    degreeGroups.get(info.degree)!.push({ key, info })
  }
  // Sort degree groups
  const sortedDegrees = [...degreeGroups.keys()].sort((a, b) => {
    const aLabel = degreeGroups.get(a)![0]!.info.degreeLabel
    const bLabel = degreeGroups.get(b)![0]!.info.degreeLabel
    return aLabel.localeCompare(bLabel)
  })
  for (const deg of sortedDegrees) {
    degreeColumns.set(deg, col)
    col++
  }

  // ── Place Tier 100 nodes ──
  // Within each degree group, spread classes horizontally so they don't overlap
  const tier100Nodes: GraphNode[] = []
  for (const deg of sortedDegrees) {
    const group = degreeGroups.get(deg) || []
    const baseCol = degreeColumns.get(deg) ?? 0
    for (let i = 0; i < group.length; i++) {
      const { key, info } = group[i]!
      // Each class within a degree group gets offset from the base column
      const x = (baseCol * nodeSpacingX) + (i * intraGroupSpacingX)
      const node: GraphNode = {
        id: key,
        label: info.className,
        x, y: tier100Y,
        level: 100,
        degreeLabel: info.degreeLabel,
        className: info.className,
        degree: info.degree,
        dependencies: info.dependencies.get(100) || [],
        path: `/classes/${key}`,
        image: `/img/degrees/${info.degree}.webp`
      }
      tier100Nodes.push(node)
      posMap.set(key, { x, y: tier100Y })
    }
  }
  nodeList.push(...tier100Nodes)

  // ── Place Tier 200 nodes ──
  // For tier 200, position based on average of dependency X positions, then resolve overlaps
  const tier200Nodes: GraphNode[] = []
  for (const { key, info } of tier200Classes) {
    const deps = info.dependencies.get(200)!
    let depXSum = 0, depCount = 0
    const depKeys: string[] = []
    for (const dep of deps) {
      for (const [dk, de] of filteredClassMap.value) {
        if (de.className === dep.class) {
          const pos = posMap.get(dk)
          if (pos) {
            depXSum += pos.x
            depCount++
            depKeys.push(dk)
          }
        }
      }
    }
    if (depCount === 0) continue

    const x = depXSum / depCount
    const node: GraphNode = {
      id: `${key}@200`,
      label: `${info.className} II`,
      x, y: tier200Y,
      level: 200,
      degreeLabel: info.degreeLabel,
      className: info.className,
      degree: info.degree,
      dependencies: deps,
      path: `/classes/${key}/200`,
      image: `/img/degrees/${info.degree}.webp`
    }
    tier200Nodes.push(node)

    // Edges from deps
    for (const dk of depKeys) {
      const pos = posMap.get(dk)!
      edgeList.push({
        key: `${dk}->${key}@200`,
        from: dk, to: `${key}@200`,
        path: `M ${pos.x} ${pos.y} L ${x} ${tier200Y}`,
        planned: false
      })
    }
  }

  // Resolve horizontal overlaps for tier 200 using bucket-based approach
  spreadNodesHorizontally(tier200Nodes, nodeSpacingX)
  for (const node of tier200Nodes) {
    posMap.set(node.id, { x: node.x, y: node.y })
    nodeList.push(node)
  }
  // Update edge paths after spreading
  for (const node of tier200Nodes) {
    for (const edge of edgeList) {
      if (edge.to === node.id) {
        const fromPos = posMap.get(edge.from)
        if (fromPos) edge.path = `M ${fromPos.x} ${fromPos.y} L ${node.x} ${node.y}`
      }
    }
  }

  // ── Place Tier 300 nodes ──
  const tier300Nodes: GraphNode[] = []
  for (const { key, info } of tier300Classes) {
    const deps = info.dependencies.get(300)!
    let depXSum = 0, depCount = 0
    const depFromIds: { id: string; pos: { x: number; y: number } }[] = []
    for (const dep of deps) {
      for (const [dk, de] of filteredClassMap.value) {
        if (de.className === dep.class) {
          const pos200 = posMap.get(`${dk}@200`)
          const pos100 = posMap.get(dk)
          const pos = pos200 || pos100
          if (pos) {
            depXSum += pos.x
            depCount++
            const fromId = pos200 ? `${dk}@200` : dk
            depFromIds.push({ id: fromId, pos })
          }
        }
      }
    }
    if (depCount === 0) continue

    const x = depXSum / depCount
    const node: GraphNode = {
      id: `${key}@300`,
      label: `${info.className} III`,
      x, y: tier300Y,
      level: 300,
      degreeLabel: info.degreeLabel,
      className: info.className,
      degree: info.degree,
      dependencies: deps,
      path: `/classes/${key}/300`,
      image: `/img/degrees/${info.degree}.webp`
    }
    tier300Nodes.push(node)

    for (const { id: fromId, pos } of depFromIds) {
      edgeList.push({
        key: `${fromId}->${key}@300`,
        from: fromId, to: `${key}@300`,
        path: `M ${pos.x} ${pos.y} L ${x} ${tier300Y}`,
        planned: false
      })
    }
  }

  spreadNodesHorizontally(tier300Nodes, nodeSpacingX)
  for (const node of tier300Nodes) {
    posMap.set(node.id, { x: node.x, y: node.y })
    nodeList.push(node)
  }
  for (const node of tier300Nodes) {
    for (const edge of edgeList) {
      if (edge.to === node.id) {
        const fromPos = posMap.get(edge.from)
        if (fromPos) edge.path = `M ${fromPos.x} ${fromPos.y} L ${node.x} ${node.y}`
      }
    }
  }

  // ── Global centering: offset all nodes so the entire graph is centered around x=0 ──
  if (nodeList.length > 1) {
    const allX = nodeList.map(n => n.x)
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const graphCenterX = (minX + maxX) / 2

    // Shift all nodes so the graph is centered at x=0
    // (studentNode is already in nodeList, so it gets shifted in the loop)
    for (const node of nodeList) {
      node.x -= graphCenterX
    }

    // Rebuild posMap with updated positions
    posMap.clear()
    for (const node of nodeList) {
      posMap.set(node.id, { x: node.x, y: node.y })
    }

    // Edges from student to tier 100
    for (const node of tier100Nodes) {
      const fromY = studentNode.y
      const toY = node.y
      const midY = (fromY + toY) / 2
      edgeList.push({
        key: `student->${node.id}`,
        from: 'student', to: node.id,
        path: `M ${studentNode.x} ${fromY} C ${studentNode.x} ${midY}, ${node.x} ${midY}, ${node.x} ${toY}`,
        planned: false
      })
    }
  }

  // Update all edge paths to use smooth bezier curves
  for (const edge of edgeList) {
    const fromPos = posMap.get(edge.from)
    const toNode = nodeList.find(n => n.id === edge.to)
    if (fromPos && toNode) {
      const fromY = fromPos.y
      const toY = toNode.y
      const midY = (fromY + toY) / 2
      edge.path = `M ${fromPos.x} ${fromY} C ${fromPos.x} ${midY}, ${toNode.x} ${midY}, ${toNode.x} ${toY}`
    }
  }

  // Mark planned edges
  for (const edge of edgeList) {
    edge.planned = isOnPlannedPath(edge.to)
  }

  nodes.value = nodeList
  edges.value = edgeList

  // Center the view
  centerGraph()
}

// Spread nodes horizontally so no two nodes are closer than minSpacing
// Does NOT center the row – the caller is responsible for global centering
function spreadNodesHorizontally(nodes: GraphNode[], minSpacing: number) {
  if (nodes.length === 0) return

  // Sort by current X position
  nodes.sort((a, b) => a.x - b.x)

  // First pass: push right – ensure minimum spacing
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]!
    const curr = nodes[i]!
    if (curr.x - prev.x < minSpacing) {
      curr.x = prev.x + minSpacing
    }
  }

  // Second pass: pull left – compact the row so there are no excessive gaps
  // Only pull if the gap is more than 1.5x minSpacing (avoids jitter from near-equal spacing)
  for (let i = nodes.length - 2; i >= 0; i--) {
    const curr = nodes[i]!
    const next = nodes[i + 1]!
    const gap = next.x - curr.x
    if (gap > minSpacing * 1.5) {
      // Pull current node right toward the next node, but respect the previous node
      const desiredX = next.x - minSpacing
      if (i > 0) {
        const prev = nodes[i - 1]!
        if (desiredX - prev.x >= minSpacing) {
          curr.x = desiredX
        }
      } else {
        curr.x = desiredX
      }
    }
  }
}

/* ── Interaction ── */

function selectNode(node: GraphNode) {
  selectedNode.value = node
}

function selectPlannedNode(planId: string) {
  const node = nodes.value.find(n => n.id === planId)
  if (node) selectedNode.value = node
}

function togglePlanForNode(node: GraphNode) {
  if (node.id === 'student') return
  if (studyPlan.value.has(node.id)) {
    studyPlan.value.delete(node.id)
  } else {
    studyPlan.value.add(node.id)
  }
  // Rebuild to update edge colors
  buildGraph()
}

function removeFromPlan(planId: string) {
  studyPlan.value.delete(planId)
  if (selectedNode.value?.id === planId) selectedNode.value = null
  buildGraph()
}

function getPlanLabel(planId: string) {
  const node = nodes.value.find(n => n.id === planId)
  return node?.label || planId
}

function resetView() {
  selectedNode.value = null
  studyPlan.value.clear()
  buildGraph()
}

function onNodeHover(node: GraphNode, event: MouseEvent) {
  tooltipNode.value = node
  if (graphContainer.value) {
    const rect = graphContainer.value.getBoundingClientRect()
    tooltipX.value = event.clientX - rect.left
    tooltipY.value = event.clientY - rect.top
  }
}

/* ── Rebuild on plan or filter changes ── */

watch(studyPlan, () => buildGraph(), { deep: true })
watch(selectedDegrees, () => buildGraph(), { deep: true })
buildGraph()

/* ── Breadcrumbs ── */

const items = ref<BreadcrumbItem[]>([
  { label: 'Study Plan', icon: 'i-lucide-git-branch', to: '/study-plan' }
])
</script>
