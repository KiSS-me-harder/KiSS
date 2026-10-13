<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbs" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Activities
            </h1>
            <p class="text-white/60 mt-1">
              Log your training sessions below. Each activity contributes data to your metrics.
            </p>
          </div>
        </div>

        <div v-if="activities.length === 0" class="text-center py-12 text-white/50">
          <UIcon name="i-lucide-dumbbell" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-lg">
            No activities defined yet.
          </p>
          <p class="text-sm mt-1">
            Add activity content files to content/activities/ to get started.
          </p>
        </div>

        <!-- Collapsible categories -->
        <div v-for="category in categories" :key="category.name" class="space-y-3">
          <!-- Category header (clickable to toggle) -->
          <button
            class="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 transition-all duration-200 hover:bg-white/10 hover:border-white/20"
            @click="toggleCategory(category.name)"
          >
            <div class="flex items-center gap-3">
              <UIcon :name="category.icon" class="w-5 h-5 text-purple-400" />
              <span class="text-base font-semibold text-white">{{ category.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{{ category.activities.length }}</span>
            </div>
            <UIcon
              :name="isCategoryOpen(category.name) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-5 h-5 text-white/40 transition-transform duration-200"
            />
          </button>

          <!-- Category activities -->
          <div v-if="isCategoryOpen(category.name)" class="space-y-3 pl-0 sm:pl-3">
            <ActivityCard
              v-for="activity in category.activities"
              :id="`activity-${activity.slug}`"
              :key="activity.slug"
              :activity="activity"
              :highlighted="highlightedActivity === activity.slug"
              :get-field-value="getFieldValue"
              :get-field-unit="getFieldUnit"
              :get-recent-sessions="getRecentSessions"
              :on-field-change="onFieldChange"
              :submit-session="submitSession"
              :delete-session="deleteSession"
              :format-date="formatDate"
              :today-formatted="todayFormatted"
              @help="onHelp"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Activity Help Dialog -->
  <UModal v-model:open="showHelp" class="max-w-lg">
    <template #header>
      <div class="text-lg font-semibold text-white">
        {{ selectedActivity?.title || '' }}
      </div>
    </template>
    <template #body>
      <div v-if="selectedActivity" class="py-2">
        <p class="text-white/70 leading-relaxed">
          {{ selectedActivity.longDescription || selectedActivity.description }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton
          label="Close"
          color="neutral"
          variant="outline"
          @click="showHelp = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useActivitiesIndex } from '~/composables/useActivitiesIndex'

const {
  showHelp, selectedActivity,
  toggleCategory, isCategoryOpen,
  highlightedActivity,
  getFieldValue, onFieldChange,
  activities, categories, breadcrumbs, todayFormatted,
  submitSession, getFieldUnit, getRecentSessions, deleteSession, formatDate
} = await useActivitiesIndex()

function onHelp(a: Record<string, unknown>) {
  if (selectedActivity.value) {
    Object.assign(selectedActivity.value, a)
    showHelp.value = true
  }
}
</script>
