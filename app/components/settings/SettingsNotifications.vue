<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bell" class="size-5 text-white/40" />
        <h2 class="text-lg font-semibold text-white">
          Notifications
        </h2>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Email Notifications
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Receive course updates via email
          </p>
        </div>
        <USwitch :model-value="emailNotifications" @update:model-value="update('emailNotifications', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Push Notifications
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Browser push notifications for alerts
          </p>
        </div>
        <USwitch :model-value="pushNotifications" @update:model-value="update('pushNotifications', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Class Reminders
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Reminders for upcoming classes
          </p>
        </div>
        <USwitch :model-value="classReminders" @update:model-value="update('classReminders', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-white">
            Detention Alerts
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            Notifications when assigned detention
          </p>
        </div>
        <USwitch :model-value="detentionAlerts" @update:model-value="update('detentionAlerts', $event)" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  settings: {
    emailNotifications: boolean
    pushNotifications: boolean
    classReminders: boolean
    detentionAlerts: boolean
  }
}>()

const emit = defineEmits<{
  'update:settings': [settings: typeof props.settings]
}>()

const emailNotifications = computed(() => props.settings.emailNotifications)
const pushNotifications = computed(() => props.settings.pushNotifications)
const classReminders = computed(() => props.settings.classReminders)
const detentionAlerts = computed(() => props.settings.detentionAlerts)

function update(key: keyof typeof props.settings, value: boolean) {
  emit('update:settings', { ...props.settings, [key]: value })
}
</script>
