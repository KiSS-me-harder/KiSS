<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-key" class="size-5 text-white/40" />
        <h2 class="text-lg font-semibold text-white">
          Account
        </h2>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <label class="text-xs text-white/40 uppercase tracking-wider">Current Password</label>
        <UInput
          :model-value="current"
          class="mt-1"
          type="password"
          placeholder="Enter current password"
          @update:model-value="update('current', $event)"
        />
      </div>
      <div>
        <label class="text-xs text-white/40 uppercase tracking-wider">New Password</label>
        <UInput
          :model-value="newPassword"
          class="mt-1"
          type="password"
          placeholder="Enter new password"
          @update:model-value="update('newPassword', $event)"
        />
      </div>
      <div>
        <label class="text-xs text-white/40 uppercase tracking-wider">Confirm New Password</label>
        <UInput
          :model-value="confirm"
          class="mt-1"
          type="password"
          placeholder="Confirm new password"
          @update:model-value="update('confirm', $event)"
        />
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
          <UButton variant="subtle" color="neutral">
            Cancel
          </UButton>
          <UButton color="primary" @click="$emit('save')">
            Save Changes
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  passwords: {
    current: string
    newPassword: string
    confirm: string
  }
}>()

const emit = defineEmits<{
  'update:passwords': [passwords: typeof props.passwords]
  'save': []
}>()

const current = computed(() => props.passwords.current)
const newPassword = computed(() => props.passwords.newPassword)
const confirm = computed(() => props.passwords.confirm)

function update(key: keyof typeof props.passwords, value: string) {
  emit('update:passwords', { ...props.passwords, [key]: value })
}
</script>
