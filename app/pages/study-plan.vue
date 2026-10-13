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
              v-if="graph.selectedNode.value"
              size="xs"
              :color="graph.isPlanned(graph.selectedNode.value!) ? 'error' : 'primary'"
              @click="graph.togglePlanForNode(graph.selectedNode.value!)"
            >
              <template #leading>
                <UIcon :name="graph.isPlanned(graph.selectedNode.value!) ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'" class="size-3" />
              </template>
              {{ graph.isPlanned(graph.selectedNode.value!) ? 'Remove from Plan' : 'Add to Plan' }}
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="subtle"
              title="Clear study plan"
              @click="resetView"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-3" />
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col xl:flex-row gap-4 h-[calc(100vh-12rem)] min-h-[500px]">
        <!-- Left sidebar -->
        <StudyPlanSidebar
          :all-degrees="graph.allDegreesList.value"
          :selected-degrees="graph.selectedDegrees.value"
          :degree-target-title="graph.degreeTargetTitle.value"
          :get-degree-titles="graph.getDegreeTitles"
          :study-plan="studyPlanArray"
          :get-plan-label="graph.getPlanLabel"
          :enrollable-count="graph.enrollableCoursesCount.value"
          :enrolling="enrolling"
          @degree-toggle="graph.onDegreeToggle"
          @toggle-all-degrees="graph.toggleAllDegrees"
          @title-change="graph.onTitleChange"
          @enroll-all="onEnrollAll"
          @select-planned-node="graph.selectPlannedNode"
          @remove-from-plan="graph.removeFromPlan"
        />

        <!-- Graph (desktop) -->
        <StudyPlanGraph
          ref="graphDesktop"
          :nodes="graph.nodes.value"
          :edges="graph.edges.value"
          :selected-node="graph.selectedNode.value"
          :is-planned="graph.isPlanned"
          :is-enrolled-node="graph.isEnrolledNode"
          :are-prerequisites-met="graph.arePrerequisitesMet"
          :is-in-progress="graph.isInProgress"
          :is-selected="graph.isSelected"
          :get-node-fill="graph.getNodeFill"
          :get-node-stroke="graph.getNodeStroke"
          :get-node-label-color="graph.getNodeLabelColor"
          :on-center="centerGraphDesktop"
          @select-node="graph.selectNode"
        />

        <!-- Mobile graph button -->
        <div class="md:hidden">
          <UButton
            size="xs"
            color="primary"
            block
            @click="showGraphPopup = true"
          >
            <template #leading>
              <UIcon name="i-lucide-share-2" class="size-3" />
            </template>
            View Graph
          </UButton>
        </div>

        <!-- Right sidebar: Node details -->
        <StudyPlanNodeDetails
          :node="graph.selectedNode.value"
          :get-node-fill="graph.getNodeFill"
          :get-node-stroke="graph.getNodeStroke"
          :get-node-status="graph.getNodeStatus"
          :get-node-status-color="graph.getNodeStatusColor"
        />
      </div>
    </template>
  </UDashboardPanel>

  <!-- Mobile Graph Popup -->
  <div
    v-if="showGraphPopup"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="showGraphPopup = false"
  >
    <div class="relative w-full h-full flex flex-col">
      <div class="flex items-center justify-between p-3 border-b border-white/10">
        <h2 class="text-sm font-bold text-white">
          Study Plan Graph
        </h2>
        <UButton
          size="xs"
          color="neutral"
          variant="subtle"
          @click="showGraphPopup = false"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </UButton>
      </div>
      <StudyPlanGraph
        ref="graphMobile"
        prefix="m"
        :nodes="graph.nodes.value"
        :edges="graph.edges.value"
        :selected-node="graph.selectedNode.value"
        :is-planned="graph.isPlanned"
        :is-enrolled-node="graph.isEnrolledNode"
        :are-prerequisites-met="graph.arePrerequisitesMet"
        :is-in-progress="graph.isInProgress"
        :is-selected="graph.isSelected"
        :get-node-fill="graph.getNodeFill"
        :get-node-stroke="graph.getNodeStroke"
        :get-node-label-color="graph.getNodeLabelColor"
        :on-center="centerGraphMobile"
        @select-node="onSelectNodeFromPopup"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'
import { useStudyPlanStore } from '~/stores/studyPlan'
import type { GraphNode } from '~/utils/studyPlanGraph'
import { useStudyPlanGraph } from '~/composables/useStudyPlanGraph'
import StudyPlanGraph from '~/components/study-plan/StudyPlanGraph.vue'
import StudyPlanSidebar from '~/components/study-plan/StudyPlanSidebar.vue'
import StudyPlanNodeDetails from '~/components/study-plan/StudyPlanNodeDetails.vue'

useHead({ title: 'Study Plan Graph' })

useSeoMeta({
  title: 'Study Plan Graph',
  description: 'Visualize your study path as a talent tree.',
  ogTitle: 'Study Plan Graph',
  ogDescription: 'Visualize your study path as a talent tree.',
  ogType: 'website'
})

const store = useEnrollmentStore()
const planStore = useStudyPlanStore()

const { data: allCourses } = await useAsyncData('study-plan-classes', () => {
  return queryCollection('courses').all()
})

const { data: allDegrees } = await useAsyncData('study-plan-degrees', () => {
  return queryCollection('degrees').all()
})

const graph = useStudyPlanGraph(allCourses, allDegrees, planStore, store)

const enrolling = ref(false)
const showGraphPopup = ref(false)
const graphDesktop = ref<InstanceType<typeof StudyPlanGraph> | null>(null)
const graphMobile = ref<InstanceType<typeof StudyPlanGraph> | null>(null)

const studyPlanArray = computed(() => Array.from(planStore.studyPlan))

function centerGraphDesktop() {
  graphDesktop.value?.centerGraph()
}

function centerGraphMobile() {
  graphMobile.value?.centerGraph()
}

function onSelectNodeFromPopup(node: GraphNode) {
  graph.selectNode(node)
  showGraphPopup.value = false
}

async function onEnrollAll() {
  await graph.enrollAllSelected(enrolling)
}

function resetView() {
  graph.resetSelectedNode()
  planStore.studyPlan.clear()
  graph.buildGraph()
}

// Watch for changes
watch(graph.studyPlan, () => graph.buildGraph(), { deep: true })
watch(graph.selectedDegrees, () => graph.buildGraph(), { deep: true })
watch(() => graph.degreeTargetTitle, () => {
  graph.autoAddTargetCourses()
  graph.buildGraph()
}, { deep: true })

// Initialize after store loads from localStorage
// Use onMounted to ensure we run after both stores have loaded their data
onMounted(() => {
  graph.loadFilterState()
})

const items = ref<BreadcrumbItem[]>([
  { label: 'Study Plan Graph', icon: 'i-lucide-git-branch', to: '/study-plan' }
])
</script>
