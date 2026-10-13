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
      <div v-if="thread" class="flex flex-col h-full" style="height: calc(100vh - 180px);">
        <ThreadHeader :thread="thread" :reply-count="replies.length" />

        <!-- Replies Area -->
        <div class="flex-1 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4 mb-2">
          <div v-if="replies.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <UIcon name="i-lucide-message-circle" class="w-12 h-12 text-white/20 mb-3" />
            <p class="text-white/40 text-sm mb-1">
              No replies yet
            </p>
            <p class="text-white/30 text-xs">
              Be the first to respond to this thread
            </p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="(reply, index) in replies" :key="index" class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getAvatarBgClass(reply.color)">
                <UIcon :name="reply.avatar" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-white text-sm font-semibold">
                    {{ reply.author }}
                  </p>
                  <span class="text-white/30 text-xs">{{ reply.time }}</span>
                </div>
                <div class="mt-1 p-3 rounded-lg bg-white/5 border border-white/5">
                  <p class="text-white/80 text-sm whitespace-pre-wrap">
                    {{ reply.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reply Input -->
        <div class="flex gap-2">
          <UInput
            v-model="inputMessage"
            placeholder="Write a reply..."
            class="flex-1"
            variant="outline"
            @keydown.enter="postReply"
          />
          <UButton
            icon="i-lucide-send"
            label="Reply"
            color="primary"
            variant="solid"
            class="rounded-xl"
            :disabled="!inputMessage.trim() || posting"
            @click="postReply"
          />
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()
const threadId = route.params.slug as string

interface Thread {
  id: string
  title: string
  message: string
  author: string
  avatar: string
  color: string
  category: string
  replies: number
  time: string
  pinned: boolean
}

const allThreads: Record<string, Thread> = {
  1: {
    id: '1', title: 'Welcome to the new semester!',
    message: 'Hey everyone! Excited to see so many new faces this semester. Let\'s make it a great one!\n\nRemember to check out the updated class schedules and don\'t forget to sign up for clubs if you haven\'t already.\n\nLooking forward to meeting all of you!',
    author: 'Professor Velvet', avatar: 'i-lucide-heart', color: 'pink', category: 'general', replies: 24, time: '2 hours ago', pinned: true
  },
  2: {
    id: '2', title: 'Study group for Anal Fundamentals 100',
    message: 'Looking for classmates to form a study group for next week\'s exam. Who\'s interested?\n\nI was thinking we could meet twice a week in the library. Let me know your availability!',
    author: 'Student_A', avatar: 'i-lucide-users', color: 'blue', category: 'classes', replies: 8, time: '5 hours ago', pinned: false
  },
  3: {
    id: '3', title: 'Fitness Club - New Schedule',
    message: 'Updated workout schedule for this month:\n\n- Monday: 6 PM - Cardio & Core\n- Wednesday: 6 PM - Strength Training\n- Friday: 5 PM - Flexibility & Recovery\n\nAll sessions are held in the main gym. New members are always welcome!',
    author: 'Coach Flex', avatar: 'i-lucide-dumbbell', color: 'green', category: 'clubs', replies: 12, time: '1 day ago', pinned: false
  },
  4: {
    id: '4', title: 'New here - Introduction!',
    message: 'Hi everyone, I just joined the school. Currently working on my first degree. Looking forward to learning!\n\nA bit about me: I\'m new to all this but very eager to learn. Any tips for beginners would be greatly appreciated!',
    author: 'NewStudent_42', avatar: 'i-lucide-sparkles', color: 'purple', category: 'introductions', replies: 15, time: '2 days ago', pinned: false
  },
  5: {
    id: '5', title: 'Question about degree prerequisites',
    message: 'Can someone explain the difference between the Sissy and Obedient degree paths? Trying to decide which to pursue.\n\nI\'m particularly interested in understanding the class requirements and how they differ.',
    author: 'ConfusedStudent', avatar: 'i-lucide-circle-help', color: 'yellow', category: 'questions', replies: 6, time: '3 days ago', pinned: false
  }
}

const thread = computed(() => allThreads[threadId] || null)

const items = computed<BreadcrumbItem[]>(() => [
  { label: 'Students', icon: 'i-lucide-users', to: '/students' },
  { label: thread.value?.title || threadId }
])

useHead({
  title: computed(() => `${thread.value?.title || 'Thread'} | Students`)
})

interface Reply {
  author: string
  avatar: string
  color: string
  message: string
  time: string
}

const sampleReplies: Record<string, Reply[]> = {
  1: [
    { author: 'Student_A', avatar: 'i-lucide-user', color: 'blue', message: 'Welcome Professor! Excited for this semester!', time: '1 hour ago' },
    { author: 'NewStudent_42', avatar: 'i-lucide-sparkles', color: 'purple', message: 'Thanks for the warm welcome! Looking forward to it.', time: '1 hour ago' },
    { author: 'Coach Flex', avatar: 'i-lucide-dumbbell', color: 'green', message: 'Let\'s make it the best one yet! 💪', time: '45 min ago' }
  ],
  2: [
    { author: 'Student_B', avatar: 'i-lucide-user', color: 'green', message: 'I\'m in! Tuesday and Thursday work best for me.', time: '4 hours ago' },
    { author: 'Student_C', avatar: 'i-lucide-user', color: 'yellow', message: 'Count me in too. The library sounds good.', time: '3 hours ago' }
  ],
  4: [
    { author: 'Professor Velvet', avatar: 'i-lucide-heart', color: 'pink', message: 'Welcome to the school! Don\'t hesitate to ask questions.', time: '1 day ago' },
    { author: 'Student_A', avatar: 'i-lucide-user', color: 'blue', message: 'Hey! Start with the beginner classes, they really set a good foundation.', time: '1 day ago' }
  ]
}

const replies = ref<Reply[]>(sampleReplies[threadId] || [])
const inputMessage = ref('')
const posting = ref(false)

function getAvatarBgClass(color: string) {
  const bgColors: Record<string, string> = {
    pink: 'bg-pink-500/90', red: 'bg-red-500/90', purple: 'bg-purple-500/90',
    green: 'bg-green-500/90', blue: 'bg-blue-500/90', yellow: 'bg-yellow-500/90'
  }
  return bgColors[color.toLowerCase()] || 'bg-gray-500/90'
}

function postReply() {
  const content = inputMessage.value.trim()
  if (!content) return
  posting.value = true
  replies.value.push({
    author: 'You', avatar: 'i-lucide-user', color: 'purple',
    message: content, time: 'Just now'
  })
  inputMessage.value = ''
  posting.value = false
}
</script>
