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
        <!-- Notifications -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bell" class="size-5 text-white/40" />
              <h2 class="text-lg font-semibold text-white">Notifications</h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Email Notifications</p>
                <p class="text-xs text-white/40 mt-0.5">Receive course updates via email</p>
              </div>
              <USwitch v-model="settings.emailNotifications" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Push Notifications</p>
                <p class="text-xs text-white/40 mt-0.5">Browser push notifications for alerts</p>
              </div>
              <USwitch v-model="settings.pushNotifications" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Class Reminders</p>
                <p class="text-xs text-white/40 mt-0.5">Reminders for upcoming classes</p>
              </div>
              <USwitch v-model="settings.classReminders" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Detention Alerts</p>
                <p class="text-xs text-white/40 mt-0.5">Notifications when assigned detention</p>
              </div>
              <USwitch v-model="settings.detentionAlerts" />
            </div>
          </div>
        </UCard>

        <!-- Privacy -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield" class="size-5 text-white/40" />
              <h2 class="text-lg font-semibold text-white">Privacy</h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Profile Visibility</p>
                <p class="text-xs text-white/40 mt-0.5">Allow other students to view your profile</p>
              </div>
              <USwitch v-model="settings.profileVisibility" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Show Progress</p>
                <p class="text-xs text-white/40 mt-0.5">Display your progress to peers</p>
              </div>
              <USwitch v-model="settings.showProgress" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Read Receipts</p>
                <p class="text-xs text-white/40 mt-0.5">Show when you've read messages</p>
              </div>
              <USwitch v-model="settings.readReceipts" />
            </div>
          </div>
        </UCard>

        <!-- Appearance -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-white/40" />
              <h2 class="text-lg font-semibold text-white">Appearance</h2>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Theme</label>
              <USelect v-model="settings.theme" :items="themeOptions" class="mt-1" />
            </div>

            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Font Size</label>
              <USelect v-model="settings.fontSize" :items="fontSizeOptions" class="mt-1" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Compact Mode</p>
                <p class="text-xs text-white/40 mt-0.5">Reduce spacing for more content</p>
              </div>
              <USwitch v-model="settings.compactMode" />
            </div>
          </div>
        </UCard>

        <!-- Media Player -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-headphones" class="size-5 text-white/40" />
              <h2 class="text-lg font-semibold text-white">Media Player</h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Haptics</p>
                <p class="text-xs text-white/40 mt-0.5">Vibrate in sync with media playback</p>
              </div>
              <USwitch v-model="mediaPlayer.hapticsEnabled" />
            </div>

            <div v-if="mediaPlayer.hapticsEnabled">
              <label class="text-xs text-white/40 uppercase tracking-wider">Intensity</label>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-white/40">Low</span>
                <USlider
                  v-model="mediaPlayer.hapticsIntensity"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  :thumb-size="'sm'"
                  class="flex-1"
                />
                <span class="text-xs text-white/40">High</span>
              </div>
            </div>

            <div v-if="mediaPlayer.hapticsEnabled">
              <label class="text-xs text-white/40 uppercase tracking-wider">Mode</label>
              <USelect
                v-model="mediaPlayer.hapticsMode"
                :items="hapticsModeOptions"
                class="mt-1"
              />
            </div>

            <div v-if="mediaPlayer.hapticsEnabled && mediaPlayer.hapticsMode === 'manual'">
              <label class="text-xs text-white/40 uppercase tracking-wider">Pattern</label>
              <USelect
                v-model="selectedPatternIndex"
                :items="patternOptions"
                class="mt-1"
                @change="onPatternChange"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Binaural Beats</p>
                <p class="text-xs text-white/40 mt-0.5">Layer binaural audio tones</p>
              </div>
              <USwitch v-model="mediaPlayer.binauralEnabled" />
            </div>

            <div v-if="mediaPlayer.binauralEnabled">
              <label class="text-xs text-white/40 uppercase tracking-wider">Mode</label>
              <USelect
                v-model="mediaPlayer.binauralMode"
                :items="binauralModeOptions"
                class="mt-1"
              />
            </div>

            <div v-if="mediaPlayer.binauralEnabled && mediaPlayer.binauralMode === 'track'">
              <label class="text-xs text-white/40 uppercase tracking-wider">Track</label>
              <USelect
                v-model="selectedBinauralTrackIndex"
                :items="binauralTrackOptions"
                class="mt-1"
                @change="onBinauralTrackChange"
              />
            </div>

            <div v-if="mediaPlayer.binauralEnabled && mediaPlayer.binauralMode === 'auto'">
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <p class="text-xs text-white/60">
                  <UIcon name="i-lucide-info" class="size-3 inline mr-1" />
                  Auto mode detects the tempo of the currently playing media and generates matching binaural beats.
                </p>
                <p v-if="mediaPlayer.autoDetectedBpm" class="text-sm text-white mt-2 font-semibold">
                  Detected: {{ mediaPlayer.autoDetectedBpm }} BPM
                </p>
              </div>
            </div>

            <div v-if="mediaPlayer.binauralEnabled">
              <label class="text-xs text-white/40 uppercase tracking-wider">Volume</label>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-white/40">Quiet</span>
                <USlider
                  v-model="mediaPlayer.binauralVolume"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  :thumb-size="'sm'"
                  class="flex-1"
                />
                <span class="text-xs text-white/40">Loud</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-white">Hypnotic Spiral</p>
                <p class="text-xs text-white/40 mt-0.5">Show spiral animation instead of cover art</p>
              </div>
              <USwitch v-model="mediaPlayer.showSpiral" />
            </div>
          </div>
        </UCard>

        <!-- Account -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-key" class="size-5 text-white/40" />
              <h2 class="text-lg font-semibold text-white">Account</h2>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Current Password</label>
              <UInput v-model="passwords.current" class="mt-1" type="password" placeholder="Enter current password" />
            </div>

            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">New Password</label>
              <UInput v-model="passwords.new" class="mt-1" type="password" placeholder="Enter new password" />
            </div>

            <div>
              <label class="text-xs text-white/40 uppercase tracking-wider">Confirm New Password</label>
              <UInput v-model="passwords.confirm" class="mt-1" type="password" placeholder="Confirm new password" />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between items-center">
              <UButton variant="outline" color="error" size="sm">
                <template #leading>
                  <UIcon name="i-lucide-trash-2" class="size-4" />
                </template>
                Delete Account
              </UButton>
              <div class="flex gap-2">
                <UButton variant="subtle" color="neutral">Cancel</UButton>
                <UButton color="primary" @click="saved = true">Save Changes</UButton>
              </div>
            </div>
          </template>
        </UCard>

        <!-- Save notification -->
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

const hapticsModeOptions = [
  { label: 'Reactive (Audio-Synced)', value: 'reactive' },
  { label: 'Manual (Pattern)', value: 'manual' }
]

const selectedPatternIndex = ref(mediaPlayer.hapticsPatternIndex)

const patternOptions = computed(() =>
  mediaPlayer.hapticPatterns.map((p, i) => ({
    label: p.name,
    value: i
  }))
)

function onPatternChange() {
  mediaPlayer.setHapticsPatternIndex(selectedPatternIndex.value)
}

const binauralModeOptions = [
  { label: 'Generated (Live Oscillators)', value: 'generated' },
  { label: 'Track (Pre-recorded)', value: 'track' },
  { label: 'Auto (Detect from Media)', value: 'auto' }
]

const selectedBinauralTrackIndex = ref(mediaPlayer.selectedTrackIndex)

const binauralTrackOptions = computed(() =>
  mediaPlayer.binauralTracks.map((t, i) => ({
    label: `${t.title} (${t.brainwave || 'Custom'})`,
    value: i
  }))
)

function onBinauralTrackChange() {
  mediaPlayer.setSelectedTrackIndex(selectedBinauralTrackIndex.value)
}

useHead({
  title: 'Settings'
})

useSeoMeta({
  title: 'Settings',
  description: 'Manage your account settings at KiSS Academy. Configure notifications, privacy, appearance, and security preferences.',
  ogTitle: 'Settings',
  ogDescription: 'Manage your account settings at KiSS Academy. Configure notifications, privacy, appearance, and security preferences.',
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
            '@id': 'https://kiss-academy.github.io/KiSS/settings/#webpage',
            'url': 'https://kiss-academy.github.io/KiSS/settings/',
            'name': 'Settings',
            'description': 'Manage your account settings at KiSS Academy. Configure notifications, privacy, appearance, and security preferences.',
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
  new: '',
  confirm: ''
})

const themeOptions = ['Dark', 'Light', 'System']
const fontSizeOptions = ['Small', 'Medium', 'Large']

const items = ref<BreadcrumbItem[]>([
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/settings'
  }
])

// Clear saved notification after 3 seconds
watch(saved, (val) => {
  if (val) {
    setTimeout(() => {
      saved.value = false
    }, 3000)
  }
})
</script>
