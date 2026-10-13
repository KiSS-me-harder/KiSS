<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <NuxtLink to="/library/videos" class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-12 px-6">
        <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <UIcon name="i-lucide-video" class="w-8 h-8 text-green-400" />
        </div>
        <h3 class="text-white text-lg font-semibold mb-1">Videos</h3>
        <p class="text-white/40 text-xs text-center">Browse visual content and demonstrations</p>
        <p class="text-white/30 text-xs mt-2">{{ videoCount }} item{{ videoCount !== 1 ? 's' : '' }}</p>
      </div>
    </NuxtLink>

    <NuxtLink to="/library/images" class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-12 px-6">
        <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <UIcon name="i-lucide-image" class="w-8 h-8 text-blue-400" />
        </div>
        <h3 class="text-white text-lg font-semibold mb-1">Images</h3>
        <p class="text-white/40 text-xs text-center">View pictures and visual guides</p>
        <p class="text-white/30 text-xs mt-2">{{ imageCount }} item{{ imageCount !== 1 ? 's' : '' }}</p>
      </div>
    </NuxtLink>

    <NuxtLink to="/library/audio" class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-12 px-6">
        <div class="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <UIcon name="i-lucide-headphones" class="w-8 h-8 text-amber-400" />
        </div>
        <h3 class="text-white text-lg font-semibold mb-1">Audio</h3>
        <p class="text-white/40 text-xs text-center">Listen to music lessons and sessions</p>
        <p class="text-white/30 text-xs mt-2">{{ audioCount }} item{{ audioCount !== 1 ? 's' : '' }}</p>
      </div>
    </NuxtLink>

    <NuxtLink to="/library/books" class="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden">
      <div class="flex flex-col items-center justify-center py-12 px-6">
        <div class="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <UIcon name="i-lucide-book-open" class="w-8 h-8 text-purple-400" />
        </div>
        <h3 class="text-white text-lg font-semibold mb-1">Books</h3>
        <p class="text-white/40 text-xs text-center">Read stories and literature</p>
        <p class="text-white/30 text-xs mt-2">{{ bookCount }} item{{ bookCount !== 1 ? 's' : '' }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  videoCount: number
  imageCount: number
  audioCount: number
  bookCount: number
}>()
</script>
