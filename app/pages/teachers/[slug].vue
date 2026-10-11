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
      <div v-if="teacher" class="flex flex-col h-full" style="height: calc(100vh - 180px);">
        <!-- Teacher Info Header -->
        <div class="flex items-center gap-4 p-4 mb-2 rounded-xl bg-white/5 border border-white/10">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
            :class="getAvatarBgClass(teacher.color)"
          >
            <UIcon
              :name="teacher.avatar || 'i-lucide-user'"
              class="w-6 h-6 text-white"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-white text-lg font-bold truncate">
              {{ teacher.title }}
            </h2>
            <p class="text-white/60 text-sm">
              {{ teacher.role }} · {{ teacher.department }}
            </p>
          </div>
          <NuxtLink
            to="/teachers"
            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Chat Messages Area -->
        <div class="flex-1 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4 mb-2">
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <UIcon
              :name="teacher.avatar || 'i-lucide-user'"
              class="w-12 h-12 text-white/20 mb-3"
            />
            <p class="text-white/40 text-sm mb-1">
              Start a conversation with {{ teacher.title }}
            </p>
            <p class="text-white/30 text-xs">
              {{ teacher.description }}
            </p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[80%] rounded-2xl px-4 py-3"
                :class="message.role === 'user'
                  ? 'bg-purple-500/80 text-white rounded-br-sm'
                  : 'bg-white/10 text-white/90 rounded-bl-sm'"
              >
                <p class="text-sm whitespace-pre-wrap">
                  {{ message.content }}
                </p>
                <p class="text-[10px] mt-1 opacity-50">
                  {{ message.role === 'user' ? 'You' : teacher.title }} · {{ message.time }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="flex gap-2">
          <UInput
            v-model="inputMessage"
            placeholder="Type your message..."
            class="flex-1"
            variant="outline"
            @keydown.enter="sendMessage"
          />
          <UButton
            icon="i-lucide-send"
            label="Send"
            color="primary"
            variant="solid"
            class="rounded-xl"
            :disabled="!inputMessage.trim() || sending"
            @click="sendMessage"
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
const slug = route.params.slug as string

interface TeacherData {
  title: string
  role: string
  department: string
  avatar: string
  color: string
  description: string
  systemPrompt: string
  path: string
  id: string
}

const { data: facultyData } = await useAsyncData('faculty-all', () => {
  return queryCollection('faculty').all() as unknown as Promise<any[]>
})

const teacher = computed(() => {
  const item = facultyData.value?.find(t => t.path.includes(`/${slug}`))
  if (!item) return null
  return {
    title: item.title,
    role: item.role || '',
    department: item.department || '',
    avatar: item.avatar || 'i-lucide-user',
    color: item.color || 'purple',
    description: item.description || '',
    systemPrompt: item.systemPrompt || '',
    path: item.path,
    id: item.id
  }
})

const items = computed(() => [
  {
    label: 'Teachers',
    icon: 'i-lucide-users',
    to: '/teachers'
  },
  {
    label: teacher.value?.title || slug
  }
])

useHead({
  title: computed(() => `${teacher.value?.title || 'Teacher'} | Teachers`)
})

useSeoMeta({
  title: computed(() => `${teacher.value?.title || 'Teacher'} | Teachers`),
  description: computed(() => teacher.value?.description || 'Chat with a faculty member at KiSS Academy.'),
  ogTitle: computed(() => `${teacher.value?.title || 'Teacher'} | Teachers`),
  ogDescription: computed(() => teacher.value?.description || 'Chat with a faculty member at KiSS Academy.'),
  ogType: 'website'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person',
            '@id': `https://kiss-academy.github.io/KiSS/teachers/${slug}#person`,
            'url': `https://kiss-academy.github.io/KiSS/teachers/${slug}`,
            'name': teacher.value?.title,
            'jobTitle': teacher.value?.role,
            'description': teacher.value?.description,
            'worksFor': {
              '@type': 'Organization',
              'name': 'KiSS Academy',
              'url': 'https://kiss-academy.github.io/KiSS/'
            }
          },
          {
            '@type': 'WebPage',
            '@id': `https://kiss-academy.github.io/KiSS/teachers/${slug}#webpage`,
            'url': `https://kiss-academy.github.io/KiSS/teachers/${slug}`,
            'name': teacher.value?.title,
            'description': teacher.value?.description,
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
      }))
    }
  ]
})

const inputMessage = ref('')
const sending = ref(false)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const messages = ref<ChatMessage[]>([])

function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content || !teacher.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content,
    time: getTimeString()
  })
  inputMessage.value = ''
  sending.value = true

  try {
    // Call the API endpoint to get AI response
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message: content,
        systemPrompt: teacher.value.systemPrompt,
        teacherName: teacher.value.title
      }
    })

    messages.value.push({
      role: 'assistant',
      content: typeof response === 'string' ? response : (response as any).reply || 'Sorry, I could not process your request.',
      time: getTimeString()
    })
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({
      role: 'assistant',
      content: 'I\'m sorry, I\'m having trouble responding right now. Please try again later.',
      time: getTimeString()
    })
  } finally {
    sending.value = false
  }
}

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
</script>
