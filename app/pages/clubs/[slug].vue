<script setup lang="ts">
import { useClubPage } from '~/composables/useClubPage'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { app } = useRuntimeConfig()

const {
  club, title, description, body, requiredDegree, hasPrerequisite,
  activities, clubActivities, isMember, joinFailed, toggleMembership,
  toggleActivity, isCompleted, completedCount, totalXP,
  activityTypes, activeFilter, filteredActivities, items
} = await useClubPage(slug)
</script>

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
      <div v-if="club" class="space-y-4">
        <ClubsClubHero
          :title="title"
          :description="description"
          :hero-image="`${app.baseURL}img/placeholder.webp`"
          :is-member="isMember"
          :required-degree="requiredDegree"
          :has-prerequisite="hasPrerequisite"
          :join-failed="joinFailed"
          @toggle-membership="toggleMembership"
        />

        <div v-if="body" class="prose prose-invert max-w-none">
          <ContentRenderer :value="club" />
        </div>

        <!-- Activities Section -->
        <div v-if="activities.length > 0" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-amber-400" />
                Club Activities
              </h2>
              <p class="text-sm text-muted-foreground mt-1">
                Complete challenges, games, and tasks to earn XP.
              </p>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-right">
                <div class="text-sm font-medium text-foreground">
                  {{ completedCount }} / {{ activities.length }} Completed
                </div>
                <div class="text-xs text-amber-400 font-medium">
                  {{ totalXP }} XP Earned
                </div>
              </div>
              <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(completedCount / activities.length) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap">
            <UButton
              variant="ghost"
              :color="activeFilter === 'all' ? 'primary' : 'neutral'"
              size="xs"
              class="text-xs"
              @click="activeFilter = 'all'"
            >
              <UIcon name="i-lucide-layers" class="w-3.5 h-3.5 mr-1" />
              All ({{ activities.length }})
            </UButton>
            <UButton
              v-for="(typeInfo, typeKey) in activityTypes"
              :key="typeKey"
              variant="ghost"
              :color="activeFilter === typeKey ? (typeInfo.color as 'neutral' | 'success' | 'primary' | 'secondary') : 'neutral'"
              size="xs"
              class="text-xs"
              @click="activeFilter = typeKey"
            >
              <UIcon :name="typeInfo.icon" class="w-3.5 h-3.5 mr-1" />
              {{ typeInfo.label }}s ({{ activities.filter(a => a.type === typeKey).length }})
            </UButton>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ClubsClubActivityCard
              v-for="activity in filteredActivities"
              :key="activity.type + '-' + activity.title"
              :activity="activity"
              :activity-types="activityTypes"
              :is-completed="isCompleted"
              @toggle="toggleActivity"
            />
          </div>
        </div>

        <!-- Club Activities from Activities System -->
        <div v-if="clubActivities.length > 0" class="space-y-4">
          <div>
            <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
              <UIcon name="i-lucide-list-checks" class="w-5 h-5 text-emerald-400" />
              Club Activities
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              These activities are part of this club.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="activity in clubActivities"
              :key="activity.stem"
              class="group relative rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-all duration-200"
            >
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 shrink-0">
                  <UIcon :name="(activity as { icon?: string }).icon || 'i-lucide-circle-dot'" class="w-5 h-5 text-emerald-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-foreground">
                    {{ activity.title }}
                  </h3>
                  <p v-if="(activity as unknown as { description?: string }).description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {{ (activity as unknown as { description: string }).description }}
                  </p>
                  <div v-if="(activity as unknown as { category?: string }).category" class="mt-2">
                    <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {{ (activity as unknown as { category: string }).category }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>
