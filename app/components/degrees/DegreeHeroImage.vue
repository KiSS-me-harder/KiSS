<script setup lang="ts">
/**
 * Displays the degree hero image with a hover-to-enroll overlay button.
 */
defineProps<{
  imageUrl: string
  title: string | undefined
}>()
</script>

<template>
  <div class="relative rounded-lg overflow-hidden sticky top-4 group/degree-img">
    <img
      :src="imageUrl"
      :alt="title"
      class="w-full object-cover"
    >
    <!-- Title overlay -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
    >
      <h3 class="text-lg font-semibold text-white">
        {{ title }}
      </h3>
    </div>
  </div>
</template>
