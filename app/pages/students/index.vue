<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UBreadcrumb :items="items" />
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
        <!-- Thread List -->
        <div class="lg:col-span-2 space-y-2">
          <!-- Category Filters -->
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

          <!-- Thread Cards -->
          <div v-if="filteredThreads.length > 0" class="space-y-2">
            <div
              v-for="thread in filteredThreads"
              :key="thread.id"
              class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
              @click="viewThread(thread)"
            >
              <div class="p-4">
                <div class="flex items-start gap-3">
                  <!-- Avatar -->
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="getAvatarBgClass(thread.color)"
                  >
                    <UIcon :name="thread.avatar" class="w-5 h-5 text-white" />
                  </div>

                  <!-- Thread Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-white text-sm font-semibold truncate">
                        {{ thread.title }}
                      </p>
                      <UBadge
                        :label="getCategoryLabel(thread.category)"
                        :color="getCategoryColor(thread.category) as any"
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
                        <UIcon name="i-lucide-user" class="w-3 h-3" />
                        {{ thread.author }}
                      </span>
                      <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-message-circle" class="w-3 h-3" />
                        {{ thread.replies }} replies
                      </span>
                      <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-clock" class="w-3 h-3" />
                        {{ thread.time }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
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

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Active Students -->
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
                    :class="student.avatarBg"
                  >
                    <UIcon :name="student.avatar" class="w-4 h-4 text-white" />
                  </div>
                  <div
                    class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900"
                    :class="student.online ? 'bg-green-500' : 'bg-gray-500'"
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

          <!-- Board Rules -->
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

  <!-- New Thread Modal -->
  <UModal
    v-model="showNewThread"
    title="New Thread"
    description="Start a new discussion thread"
    class="max-w-lg"
  >
    <div class="space-y-4">
      <UFormField label="Title" required>
        <UInput v-model="newThread.title" placeholder="What's on your mind?" variant="outline" />
      </UFormField>

      <UFormField label="Category" required>
        <USelect v-model="newThread.category" :items="categories" variant="outline" />
      </UFormField>

      <UFormField label="Message" required>
        <UTextarea
          v-model="newThread.message"
          placeholder="Write your message..."
          :rows="4"
          variant="outline"
        />
      </UFormField>
    </div>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="showNewThread = false"
      />
      <UButton
        label="Post Thread"
        color="primary"
        variant="solid"
        :disabled="!newThread.title.trim() || !newThread.message.trim()"
        @click="postThread"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

useHead({
  title: 'Students'
})

useSeoMeta({
  title: 'Students',
  description: 'Student messaging board at KiSS Academy. Discuss classes, clubs, and connect with fellow students.',
  ogTitle: 'Students',
  ogDescription: 'Student messaging board at KiSS Academy. Discuss classes, clubs, and connect with fellow students.',
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': 'https://kiss-academy.github.io/KiSS/students/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/students/',
            'name': 'Students',
            'description': 'Student messaging board at KiSS Academy. Discuss classes, clubs, and connect with fellow students.',
            'inLanguage': 'en',
            'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
          },
          {
            '@type': 'WebSite',
            '@id': 'https://kiss-academy.github.io/KiSS/#website',
            'url': 'https://kiss-academy.github.io/KiSS/',
            'name': 'KiSS Academy',
            'description': 'KiSS Academy - A gamified learning platform for personal transformation and self-improvement.',
            'inLanguage': 'en'
          }
        ]
      })
    }
  ]
})

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Students',
    icon: 'i-lucide-users',
    to: '/students'
  }
])

const selectedCategory = ref('all')

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'classes', label: 'Classes' },
  { id: 'clubs', label: 'Clubs' },
  { id: 'introductions', label: 'Introductions' },
  { id: 'questions', label: 'Questions' }
]

interface Thread {
  id: string
  title: string
  preview: string
  author: string
  avatar: string
  color: string
  category: string
  replies: number
  time: string
  pinned: boolean
}

const threads = ref<Thread[]>([
  {
    id: '1',
    title: 'Welcome to the new semester!',
    preview: 'Hey everyone! Excited to see so many new faces this semester. Let\'s make it a great one!',
    author: 'Professor Velvet',
    avatar: 'i-lucide-heart',
    color: 'pink',
    category: 'general',
    replies: 24,
    time: '2 hours ago',
    pinned: true
  },
  {
    id: '2',
    title: 'Study group for Anal Fundamentals 100',
    preview: 'Looking for classmates to form a study group for next week\'s exam. Who\'s interested?',
    author: 'Student_A',
    avatar: 'i-lucide-users',
    color: 'blue',
    category: 'classes',
    replies: 8,
    time: '5 hours ago',
    pinned: false
  },
  {
    id: '3',
    title: 'Fitness Club - New Schedule',
    preview: 'Updated workout schedule for this month. Monday and Wednesday sessions moved to 6 PM.',
    author: 'Coach Flex',
    avatar: 'i-lucide-dumbbell',
    color: 'green',
    category: 'clubs',
    replies: 12,
    time: '1 day ago',
    pinned: false
  },
  {
    id: '4',
    title: 'New here - Introduction!',
    preview: 'Hi everyone, I just joined the school. Currently working on my first degree. Looking forward to learning!',
    author: 'NewStudent_42',
    avatar: 'i-lucide-sparkles',
    color: 'purple',
    category: 'introductions',
    replies: 15,
    time: '2 days ago',
    pinned: false
  },
  {
    id: '5',
    title: 'Question about degree prerequisites',
    preview: 'Can someone explain the difference between the Sissy and Obedient degree paths? Trying to decide which to pursue.',
    author: 'ConfusedStudent',
    avatar: 'i-lucide-circle-help',
    color: 'yellow',
    category: 'questions',
    replies: 6,
    time: '3 days ago',
    pinned: false
  }
])

const activeStudents = [
  { name: 'Professor Velvet', degree: 'Faculty', avatar: 'i-lucide-heart', avatarBg: 'bg-pink-500/90', online: true },
  { name: 'Student_A', degree: 'Anal Slut Lvl 2', avatar: 'i-lucide-user', avatarBg: 'bg-blue-500/90', online: true },
  { name: 'Coach Flex', degree: 'Fitness Club', avatar: 'i-lucide-dumbbell', avatarBg: 'bg-green-500/90', online: true },
  { name: 'NewStudent_42', degree: 'Beginner', avatar: 'i-lucide-sparkles', avatarBg: 'bg-purple-500/90', online: false },
  { name: 'ConfusedStudent', degree: 'Exploring', avatar: 'i-lucide-circle-help', avatarBg: 'bg-yellow-500/90', online: false }
]

const filteredThreads = computed(() => {
  let result = threads.value
  if (selectedCategory.value !== 'all') {
    result = result.filter(t => t.category === selectedCategory.value)
  }
  return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
})

const showNewThread = ref(false)
const newThread = ref({
  title: '',
  category: 'general',
  message: ''
})

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

function viewThread(thread: Thread) {
  navigateTo(`/students/${thread.id}`)
}

function postThread() {
  if (!newThread.value.title.trim() || !newThread.value.message.trim()) return

  threads.value.unshift({
    id: Date.now().toString(),
    title: newThread.value.title,
    preview: newThread.value.message.substring(0, 100),
    author: 'You',
    avatar: 'i-lucide-user',
    color: 'purple',
    category: newThread.value.category,
    replies: 0,
    time: 'Just now',
    pinned: false
  })

  showNewThread.value = false
  newThread.value = { title: '', category: 'general', message: '' }
}
</script>
