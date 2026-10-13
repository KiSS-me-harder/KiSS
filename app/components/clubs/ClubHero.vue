<template>
  <div class="relative rounded-xl overflow-hidden border border-white/10 shadow-lg">
    <img :src="heroImage" :alt="title" class="absolute inset-0 w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
    <div class="relative p-6 sm:p-8">
      <div v-if="!isMember && requiredDegree && !hasPrerequisite" class="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <UIcon name="i-lucide-shield-alert" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-amber-400">
            Prerequisite Required
          </p>
          <p class="text-xs text-amber-200/70 mt-1">
            To join this club, you must be enrolled in the
            <NuxtLink :to="`/degrees/${requiredDegree}`" class="underline font-medium hover:text-amber-300">{{ requiredDegree }}</NuxtLink>
            degree.
          </p>
        </div>
      </div>

      <div v-if="joinFailed" class="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
        <UIcon name="i-lucide-circle-x" class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-red-400">
            Unable to Join
          </p>
          <p class="text-xs text-red-200/70 mt-1">
            You must be enrolled in the
            <NuxtLink :to="`/degrees/${requiredDegree}`" class="underline font-medium hover:text-red-300">{{ requiredDegree }}</NuxtLink>
            degree to join this club.
          </p>
        </div>
      </div>

      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-white mb-2">
            {{ title }}
          </h1>
          <p v-if="description" class="text-white/70 text-sm leading-relaxed">
            {{ description }}
          </p>
        </div>
        <div class="shrink-0">
          <UButton
            :variant="isMember ? 'solid' : 'outline'"
            :color="isMember ? 'primary' : 'secondary'"
            size="lg"
            :disabled="(!isMember && requiredDegree && !hasPrerequisite) as boolean"
            @click="$emit('toggle-membership')"
          >
            {{ isMember ? 'Leave Club' : 'Join Club' }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  heroImage: string
  isMember: boolean
  requiredDegree?: string
  hasPrerequisite: boolean
  joinFailed: boolean
}>()

defineEmits<{
  'toggle-membership': []
}>()
</script>
