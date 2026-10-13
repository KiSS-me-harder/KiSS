<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  category: string
  categories: { id: string, label: string }[]
}>()

defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:title' | 'update:message' | 'update:category', value: string): void
  (e: 'post'): void
}>()
</script>

<template>
  <UModal
    :model-value="show"
    title="New Thread"
    description="Start a new discussion thread"
    class="max-w-lg"
    @update:model-value="$emit('update:show', $event)"
  >
    <div class="space-y-4">
      <UFormField label="Title" required>
        <UInput
          :model-value="title"
          placeholder="What's on your mind?"
          variant="outline"
          @update:model-value="$emit('update:title', $event)"
        />
      </UFormField>

      <UFormField label="Category" required>
        <USelect
          :model-value="category"
          :items="categories"
          variant="outline"
          @update:model-value="$emit('update:category', $event)"
        />
      </UFormField>

      <UFormField label="Message" required>
        <UTextarea
          :model-value="message"
          placeholder="Write your message..."
          :rows="4"
          variant="outline"
          @update:model-value="$emit('update:message', $event)"
        />
      </UFormField>
    </div>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="$emit('update:show', false)"
      />
      <UButton
        label="Post Thread"
        color="primary"
        variant="solid"
        :disabled="!title.trim() || !message.trim()"
        @click="$emit('post')"
      />
    </template>
  </UModal>
</template>
