<template>
  <div class="p-4 mb-2 rounded-xl bg-white/5 border border-white/10">
    <div class="flex items-start gap-3">
      <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" :class="getAvatarBgClass(thread.color)">
        <UIcon :name="thread.avatar" class="w-6 h-6 text-white" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="text-white text-lg font-bold truncate">
            {{ thread.title }}
          </h2>
          <UBadge
            :label="getCategoryLabel(thread.category)"
            :color="(getCategoryColor(thread.category) as 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error')"
            variant="subtle"
            size="xs"
          />
          <span v-if="thread.pinned" class="text-yellow-500/80 text-xs" title="Pinned">
            <UIcon name="i-lucide-pin" class="w-4 h-4" />
          </span>
        </div>
        <div class="flex items-center gap-3 mt-1 text-white/40 text-xs">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-user" class="w-3 h-3" />{{ thread.author }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="w-3 h-3" />{{ thread.time }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-message-circle" class="w-3 h-3" />{{ replyCount }} replies
          </span>
        </div>
      </div>
      <NuxtLink to="/students" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors">
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
      </NuxtLink>
    </div>
    <div class="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
      <p class="text-white/80 text-sm whitespace-pre-wrap">
        {{ thread.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Thread {
  title: string
  message: string
  author: string
  avatar: string
  color: string
  category: string
  pinned: boolean
  time: string
}

defineProps<{
  thread: Thread
  replyCount: number
}>()

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'classes', label: 'Classes' },
  { id: 'clubs', label: 'Clubs' },
  { id: 'introductions', label: 'Introductions' },
  { id: 'questions', label: 'Questions' }
]

function getAvatarBgClass(color: string) {
  const bgColors: Record<string, string> = {
    pink: 'bg-pink-500/90',
    red: 'bg-red-500/90',
    purple: 'bg-purple-500/90',
    green: 'bg-green-500/90',
    blue: 'bg-blue-500/90',
    yellow: 'bg-yellow-500/90'
  }
  return bgColors[color.toLowerCase()] || 'bg-gray-500/90'
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    general: 'neutral',
    classes: 'info',
    clubs: 'success',
    introductions: 'primary',
    questions: 'warning'
  }
  return colors[category] || 'neutral'
}

function getCategoryLabel(category: string) {
  return categories.find(c => c.id === category)?.label || category
}
</script>
