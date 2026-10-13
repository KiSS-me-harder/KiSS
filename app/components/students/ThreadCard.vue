<script setup lang="ts">
/**
 * Displays a single forum thread card with author info, category badge, and metadata.
 */
const props = defineProps<{
  thread: {
    id: string
    title: string
    preview: string
    author: string
    avatar: string
    color: string
    category: string
    replies: number
    time: string
    pinned?: boolean
  }
  getAvatarBgClass: (color: string) => string
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
}>()

const emit = defineEmits<{
  (e: 'view', thread: Record<string, unknown>): void
}>()

const badgeColor = computed<'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'>(() =>
  props.getCategoryColor(props.thread.category) as 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
)
</script>

<template>
  <div
    data-testid="thread-card"
    class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
    @click="emit('view', thread)"
  >
    <div class="p-4">
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="getAvatarBgClass(thread.color)"
        >
          <UIcon :name="thread.avatar" class="w-5 h-5 text-white" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-white text-sm font-semibold truncate">
              {{ thread.title }}
            </p>
            <UBadge
              :label="getCategoryLabel(thread.category)"
              :color="badgeColor"
              variant="subtle"
              size="xs"
            />
            <span v-if="thread.pinned" class="text-yellow-500/80 text-xs" title="Pinned">
              <UIcon name="i-lucide-pin" class="w-3.5 h-3.5" />
            </span>
          </div>
          <p class="text-white/50 text-xs mt-0.5 line-clamp-2">
            {{ thread.preview }}
          </p>
          <div class="flex items-center gap-3 mt-2 text-white/30 text-xs">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-user" class="w-3 h-3" />{{ thread.author }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-message-circle" class="w-3 h-3" />{{ thread.replies }} replies
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />{{ thread.time }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
