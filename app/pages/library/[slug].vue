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
      <div v-if="item" class="space-y-6">
        <LibraryMediaPlayer
          :type="item.type"
          :url="item.url"
          :title="item.title"
          :author="item.author"
          :thumbnail="item.thumbnail"
          :audio-bg-class="getAudioBgClass()"
          @play="onPlay"
          @pause="onPause"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
        />

        <!-- Info Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-white/60" />
              <h3 class="text-white text-sm font-semibold">
                About
              </h3>
            </div>
            <h2 class="text-white text-xl font-bold">
              {{ item.title }}
            </h2>
            <p class="text-white/60 text-sm mt-2">
              {{ item.description }}
            </p>
            <div class="flex items-center gap-4 mt-4 text-white/40 text-xs">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-user" class="w-3 h-3" />{{ item.author }}
              </span>
              <span v-if="item.duration" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />{{ item.duration }}
              </span>
              <UBadge
                :label="getMediaTypeLabel(item.type)"
                :color="(safeColor(getMediaTypeColor(item.type)) as 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error')"
                variant="subtle"
                size="xs"
              />
            </div>
            <div v-if="item.tags && item.tags.length" class="flex gap-1.5 mt-4 flex-wrap">
              <UBadge
                v-for="tag in item.tags"
                :key="tag"
                :label="tag"
                color="neutral"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>

          <div class="space-y-4">
            <UCard class="rounded-xl border border-white/10 bg-white/5">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-share" class="w-4 h-4 text-white/60" />
                  <h3 class="text-white text-sm font-semibold">
                    Actions
                  </h3>
                </div>
              </template>
              <div class="space-y-2">
                <UButton
                  icon="i-lucide-download"
                  label="Download"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  class="rounded-xl w-full"
                  :to="item.url"
                  target="_blank"
                />
                <UButton
                  icon="i-lucide-heart"
                  label="Favorite"
                  :color="isFavorite ? 'primary' : 'neutral'"
                  variant="outline"
                  size="xs"
                  class="rounded-xl w-full"
                  @click="isFavorite = !isFavorite"
                />
              </div>
            </UCard>

            <UCard v-if="relatedItems.length > 0" class="rounded-xl border border-white/10 bg-white/5">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-list" class="w-4 h-4 text-white/60" />
                  <h3 class="text-white text-sm font-semibold">
                    Related Media
                  </h3>
                </div>
              </template>
              <div class="space-y-2">
                <NuxtLink
                  v-for="related in relatedItems.slice(0, 5)"
                  :key="related.path"
                  :to="`/library/${related.path.split('/').pop()}`"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <UIcon :name="getMediaTypeIcon(related.type)" class="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-xs font-medium truncate">{{ related.title }}</p>
                    <p class="text-white/30 text-[10px]">{{ getMediaTypeLabel(related.type) }}</p>
                  </div>
                </NuxtLink>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-12 rounded-xl border border-white/10 bg-white/5">
        <UIcon name="i-lucide-library" class="w-12 h-12 text-white/20 mb-3" />
        <p class="text-white/40 text-sm mb-1">
          Media not found
        </p>
        <UButton
          label="Back to Library"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          class="rounded-xl mt-2"
          to="/library"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useLibraryItem } from '~/composables/useLibraryItem'

const {
  item, relatedItems, isFavorite, breadcrumbs,
  onPlay, onPause, onTimeUpdate, onLoadedMetadata, onEnded,
  getMediaTypeIcon, getMediaTypeLabel, getMediaTypeColor, safeColor, getAudioBgClass
} = await useLibraryItem()
</script>
