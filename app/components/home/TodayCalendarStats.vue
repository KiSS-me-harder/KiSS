<template>
  <UCard>
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">Stats</span>
      <UButton variant="ghost" size="xs" color="neutral">
        All time
      </UButton>
    </div>
    <div class="space-y-3">
      <div v-for="stat in statsTop" :key="stat.label" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="stat.color" />
          <span class="text-sm">{{ stat.label }}</span>
        </div>
        <span class="text-sm font-medium">{{ stat.count }}</span>
      </div>
    </div>
    <div class="border-t border-default/50 my-3" />
    <div class="space-y-3">
      <div v-for="stat in statsBottom" :key="stat.label" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon :name="stat.icon" class="size-4 text-muted" />
          <span class="text-sm">{{ stat.label }}</span>
        </div>
        <span class="text-sm font-medium">{{ stat.month }} / {{ stat.allTime }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  statsTop: { label: string, color: string, count: number }[]
  statsBottom: { label: string, icon: string, month: number, allTime: number }[]
}>()
</script>
