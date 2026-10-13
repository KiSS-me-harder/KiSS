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
      <div class="max-w-2xl mx-auto space-y-6 py-4">
        <!-- Profile Header -->
        <div class="flex items-center gap-6">
          <UAvatar
            :src="user.avatar.src"
            :alt="user.avatar.alt"
            size="xl"
            class="ring-2 ring-white/10"
          />
          <div>
            <h1 class="text-2xl font-bold text-white">
              {{ user.name }}
            </h1>
            <p class="text-white/50 text-sm mt-1">
              {{ user.email }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <UBadge variant="subtle" color="primary" size="sm">
                {{ user.degree }}
              </UBadge>
              <UBadge variant="subtle" color="secondary" size="sm">
                Level {{ user.level }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-white">
              Personal Information
            </h2>
          </template>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Full Name</label>
              <UInput v-model="user.name" class="mt-1" placeholder="Your full name" />
            </div>
            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Email</label>
              <UInput
                v-model="user.email"
                class="mt-1"
                placeholder="Your email"
                type="email"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-white/40 uppercase tracking-wider">Enrolled Degree</label>
                <UInput
                  v-model="user.degree"
                  class="mt-1"
                  placeholder="Your degree"
                  disabled
                />
              </div>
              <div>
                <label class="text-xs text-white/40 uppercase tracking-wider">Current Level</label>
                <UInput
                  v-model="user.level"
                  class="mt-1"
                  placeholder="Level"
                  type="number"
                  disabled
                />
              </div>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="subtle" color="neutral">
                Cancel
              </UButton>
              <UButton color="primary" @click="handleSave">
                Save Changes
              </UButton>
            </div>
          </template>
        </UCard>

        <ProfileEnrolledCourses :enrolled-classes="enrolledClasses" />
        <ProfileStats
          :classes-completed="user.classesCompleted"
          :flashcards-answered="user.flashcardsAnswered"
          :detention-count="user.detentionCount"
        />

        <div
          v-if="saved"
          class="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <UIcon name="i-lucide-check-circle" class="size-4" />
          Profile saved successfully!
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { useEnrollmentStore } from '~/stores/enrollment'

useHead({ title: 'Profile' })
useSeoMeta({
  title: 'Profile',
  description: 'View and edit your profile at KiSS Academy.',
  ogTitle: 'Profile',
  ogDescription: 'View and edit your profile at KiSS Academy.',
  ogType: 'website'
})

const store = useEnrollmentStore()
const saved = ref(false)

const user = computed(() => ({
  name: store.profile.name,
  email: store.profile.email,
  avatar: { src: store.profile.avatarSrc, alt: store.profile.name },
  degree: store.profile.degree,
  level: 100,
  classesCompleted: store.completedCoursesCount,
  flashcardsAnswered: store.flashcardsAnswered,
  detentionCount: store.detentionCount
}))

const enrolledClasses = computed(() => store.enrollments)

const handleSave = () => {
  saved.value = true
}

const items = ref<BreadcrumbItem[]>([
  { label: 'Profile', icon: 'i-lucide-user', to: '/profile' }
])

watch(saved, (val) => {
  if (val) {
    setTimeout(() => {
      saved.value = false
    }, 3000)
  }
})
</script>
