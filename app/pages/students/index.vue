<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="breadcrumbs" />
        </template>
        <template #trailing>
          <UButton
            icon="i-lucide-plus"
            label="New Thread"
            color="primary"
            variant="solid"
            class="rounded-xl"
            @click="showNewThread = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-2">
          <div class="flex gap-2 mb-4 flex-wrap">
            <UButton
              v-for="category in categories"
              :key="category.id"
              :label="category.label"
              :variant="selectedCategory === category.id ? 'solid' : 'outline'"
              :color="selectedCategory === category.id ? 'primary' : 'neutral'"
              class="rounded-xl text-xs"
              size="xs"
              @click="selectedCategory = category.id"
            />
          </div>

          <div v-if="filteredThreads.length > 0" class="space-y-2">
            <ThreadCard
              v-for="thread in filteredThreads"
              :key="thread.id"
              :thread="thread"
              :get-avatar-bg-class="getAvatarBgClass"
              :get-category-label="getCategoryLabel"
              :get-category-color="getCategoryColor"
              @view="viewThread"
            />
          </div>

          <div v-else class="flex flex-col items-center justify-center py-12 rounded-xl border border-white/10 bg-white/5">
            <UIcon name="i-lucide-message-circle" class="w-12 h-12 text-white/20 mb-3" />
            <p class="text-white/40 text-sm mb-1">
              No threads yet
            </p>
            <p class="text-white/30 text-xs">
              Be the first to start a conversation
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <UCard class="rounded-xl border border-white/10 bg-white/5">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-users" class="w-4 h-4 text-white/60" />
                <h3 class="text-white text-sm font-semibold">
                  Active Students
                </h3>
              </div>
            </template>
            <div class="space-y-2">
              <div
                v-for="student in activeStudents"
                :key="student.name"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div class="relative">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="(student as { avatarBg?: string }).avatarBg || 'bg-purple-500'"
                  >
                    <UIcon :name="(student as { avatar?: string }).avatar || 'i-lucide-user'" class="w-4 h-4 text-white" />
                  </div>
                  <div
                    class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900"
                    :class="(student as { online?: boolean }).online ? 'bg-green-500' : 'bg-gray-500'"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white text-xs font-medium truncate">
                    {{ student.name }}
                  </p>
                  <p class="text-white/40 text-[10px]">
                    {{ student.degree }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="rounded-xl border border-white/10 bg-white/5">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-scroll-text" class="w-4 h-4 text-white/60" />
                <h3 class="text-white text-sm font-semibold">
                  Board Rules
                </h3>
              </div>
            </template>
            <ul class="space-y-1.5 text-white/50 text-xs">
              <li class="flex items-start gap-1.5">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-green-500/60 mt-0.5 flex-shrink-0" />
                <span>Be respectful to all students</span>
              </li>
              <li class="flex items-start gap-1.5">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-green-500/60 mt-0.5 flex-shrink-0" />
                <span>Keep discussions on topic</span>
              </li>
              <li class="flex items-start gap-1.5">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-green-500/60 mt-0.5 flex-shrink-0" />
                <span>No spam or excessive posting</span>
              </li>
              <li class="flex items-start gap-1.5">
                <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-green-500/60 mt-0.5 flex-shrink-0" />
                <span>Report issues to faculty</span>
              </li>
            </ul>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <StudentsNewThreadModal
    :show="showNewThread"
    :title="newThread.title"
    :message="newThread.message"
    :category="newThread.category"
    :categories="categories"
    @update:show="showNewThread = $event"
    @update:title="newThread.title = $event"
    @update:message="newThread.message = $event"
    @update:category="newThread.category = $event"
    @post="postThread"
  />
</template>

<script setup lang="ts">
import { useStudentsIndex } from '~/composables/useStudentsIndex'

const {
  breadcrumbs, selectedCategory, categories,
  showNewThread, newThread, postThread, filteredThreads,
  activeStudents, getCategoryLabel, getCategoryColor,
  getAvatarBgClass, viewThread
} = useStudentsIndex()
</script>
