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
        <SettingsNotifications :settings="settings as any" @update:settings="(val: any) => (settings = val)" />
        <SettingsPrivacy :settings="settings as any" @update:settings="(val: any) => (settings = val)" />
        <SettingsAppearance
          :settings="settings as any"
          :theme-options="themeOptions"
          :font-size-options="fontSizeOptions"
          @update:settings="(val: any) => (settings = val)"
        />
        <SettingsMediaPlayer
          v-model:pattern-index="selectedPatternIndex"
          v-model:binaural-track-index="selectedBinauralTrackIndex"
          @pattern-change="onPatternChange"
          @binaural-track-change="onBinauralTrackChange"
        />
        <SettingsAccount :passwords="passwords" @update:passwords="passwords = $event" @save="saved = true" />

        <div
          v-if="saved"
          class="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <UIcon name="i-lucide-check-circle" class="size-4" />
          Settings saved successfully!
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const mediaPlayer = useMediaPlayerStore()
provide('mediaPlayerStore', mediaPlayer)

const selectedPatternIndex = ref(mediaPlayer.hapticsPatternIndex)

function onPatternChange() {
  mediaPlayer.setHapticsPatternIndex(selectedPatternIndex.value)
}

const selectedBinauralTrackIndex = ref(mediaPlayer.selectedTrackIndex)

function onBinauralTrackChange() {
  mediaPlayer.setSelectedTrackIndex(selectedBinauralTrackIndex.value)
}

useHead({ title: 'Settings' })

useSeoMeta({
  title: 'Settings',
  description: 'Manage your account settings at KiSS Academy.',
  ogTitle: 'Settings',
  ogDescription: 'Manage your account settings at KiSS Academy.',
  ogType: 'website'
})

const saved = ref(false)
const settings = ref({
  emailNotifications: true,
  pushNotifications: false,
  classReminders: true,
  detentionAlerts: true,
  profileVisibility: true,
  showProgress: false,
  readReceipts: true,
  theme: 'dark',
  fontSize: 'medium',
  compactMode: false
})

const passwords = ref({
  current: '',
  newPassword: '',
  confirm: ''
})

const themeOptions = ['Dark', 'Light', 'System']
const fontSizeOptions = ['Small', 'Medium', 'Large']

const items = ref<BreadcrumbItem[]>([
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
])

watch(saved, (val) => {
  if (val) {
    setTimeout(() => {
      saved.value = false
    }, 3000)
  }
})
</script>
