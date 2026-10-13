<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield" class="size-5 text-white/40" />
        <h2 class="text-lg font-semibold text-white">
          Privacy
        </h2>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Profile Visibility
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Allow other students to view your profile
          </p>
        </div>
        <USwitch :model-value="profileVisibility" @update:model-value="update('profileVisibility', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Show Progress
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Display your progress to peers
          </p>
        </div>
        <USwitch :model-value="showProgress" @update:model-value="update('showProgress', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Read Receipts
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Show when you've read messages
          </p>
        </div>
        <USwitch :model-value="readReceipts" @update:model-value="update('readReceipts', $event)" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  settings: {
    profileVisibility: boolean
    showProgress: boolean
    readReceipts: boolean
  }
}>()

const emit = defineEmits<{
  'update:settings': [settings: typeof props.settings]
}>()

const profileVisibility = computed(() => props.settings.profileVisibility)
const showProgress = computed(() => props.settings.showProgress)
const readReceipts = computed(() => props.settings.readReceipts)

function update(key: keyof typeof props.settings, value: boolean) {
  emit('update:settings', { ...props.settings, [key]: value })
}
</script>
