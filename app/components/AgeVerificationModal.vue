<template>
  <UModal
    :dismissible="false"
    :close="false"
    :ui="{
      container: 'relative flex min-h-screen w-full justify-center z-50',
      overlay: 'bg-black/60 backdrop-blur-sm',
      base: 'bg-background rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800',
      header: 'border-b border-gray-100 dark:border-gray-800',
      footer: 'border-t border-gray-100 dark:border-gray-800'
    }"
  >
    <template #header>
      <div class="flex flex-col items-center justify-center text-center gap-3 py-4 w-full">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-shield-check" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Age Verification Required
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          You must be 18 years or older to access this content. Please confirm your age to continue.
        </p>
      </div>
    </template>

    <template #body>
      <div class="py-6">
        <p class="text-center text-base font-bold text-gray-700 dark:text-gray-300">
          Are you 18 years or older?
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 px-4 py-4 w-full">
        <UButton
          label="No, I'm under 18"
          color="neutral"
          variant="outline"
          size="lg"
          class="flex-1"
          @click="onNo"
        />
        <UButton
          label="Yes, I'm 18+"
          color="primary"
          variant="solid"
          size="lg"
          class="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold"
          @click="onYes"
        />
      </div>
    </template>
  </UModal>
</template>

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
  window.location.href = 'https://www.youtubekids.com'
}
</script>
