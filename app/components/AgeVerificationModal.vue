<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{ close: [boolean] }>()

const onYes = () => {
  const ageCookie = useCookie('age-verification')
  ageCookie.value = 'yes'
  emit('close', true)
}
const onNo = () => {
  const ageCookie = useCookie('age-verification')
  ageCookie.value = undefined
  window.location.href = 'https://google.com'
}
</script>

<template>
  <UModal
    :dismissible="false"
    :close="false"
    title="Are you 18 years or older?"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton label="No" color="neutral" @click="onNo" />
        <UButton label="Yes" @click="onYes" />
      </div>
    </template>
  </UModal>
</template>
