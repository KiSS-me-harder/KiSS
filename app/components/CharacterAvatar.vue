<template>
  <div class="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10">
    <!-- Classroom Background -->
    <div class="absolute inset-0">
      <!-- Chalkboard -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] h-[35%] rounded-lg bg-emerald-900/80 border-4 border-amber-900/60 shadow-lg">
        <!-- Chalk drawings on board -->
        <div class="absolute inset-2 flex items-center justify-center gap-4 opacity-30">
          <div class="text-white/40 text-2xl">👗</div>
          <div class="text-white/40 text-2xl">👠</div>
          <div class="text-white/40 text-2xl">💄</div>
          <div class="text-white/40 text-2xl">🎀</div>
          <div class="text-white/40 text-2xl">💅</div>
        </div>
        <!-- Chalk dust effect -->
        <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-transparent" />
      </div>

      <!-- Desk -->
      <div class="absolute bottom-[30%] right-6 w-[25%] h-[15%] rounded bg-amber-900/40 border border-amber-800/30">
        <div class="absolute top-1 left-1 right-1 h-[40%] rounded-sm bg-amber-800/20" />
      </div>

      <!-- Desk legs -->
      <div class="absolute bottom-[25%] right-[18%] w-1 h-[5%] bg-amber-900/30" />
      <div class="absolute bottom-[25%] right-[8%] w-1 h-[5%] bg-amber-900/30" />

      <!-- Floor -->
      <div class="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-amber-950/30 to-transparent" />
      <!-- Floor lines -->
      <div class="absolute bottom-0 left-0 right-0 h-[30%]">
        <div v-for="i in 5" :key="i" class="absolute left-0 right-0 h-px bg-amber-900/10" :style="{ bottom: `${i * 6}%` }" />
      </div>

      <!-- Light rays from window -->
      <div class="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-bl from-white/[0.03] to-transparent" />
    </div>

    <!-- Character Figure -->
    <div class="absolute inset-0 flex items-end justify-center pb-[15%]">
      <div class="relative" :style="{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.3))` }">
        <!-- Head -->
        <div
          class="relative w-16 h-20 rounded-full mx-auto"
          :style="{ backgroundColor: customization.skinTone }"
        >
          <!-- Hair -->
          <div
            class="absolute -top-2 left-1/2 -translate-x-1/2 w-18 h-14 rounded-t-full"
            :style="{ backgroundColor: customization.hairColor }"
          />
          <!-- Eyes -->
          <div class="absolute top-8 left-3 w-3 h-3 rounded-full bg-white">
            <div
              class="absolute top-0.5 left-1 w-2 h-2 rounded-full"
              :style="{ backgroundColor: customization.eyeColor }"
            />
          </div>
          <div class="absolute top-8 right-3 w-3 h-3 rounded-full bg-white">
            <div
              class="absolute top-0.5 left-1 w-2 h-2 rounded-full"
              :style="{ backgroundColor: customization.eyeColor }"
            />
          </div>
          <!-- Mouth -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-2 rounded-full bg-pink-400/60" />
          <!-- Blush -->
          <div class="absolute top-10 left-2 w-3 h-2 rounded-full bg-pink-300/30" />
          <div class="absolute top-10 right-2 w-3 h-2 rounded-full bg-pink-300/30" />
        </div>

        <!-- Neck -->
        <div
          class="w-4 h-3 mx-auto"
          :style="{ backgroundColor: customization.skinTone }"
        />

        <!-- Body -->
        <div class="relative">
          <!-- Torso -->
          <div
            class="w-20 h-24 rounded-t-xl rounded-b-lg mx-auto"
            :style="{ backgroundColor: customization.skinTone }"
          >
            <!-- Outfit overlay -->
            <div
              v-if="customization.outfit !== 'none'"
              class="absolute inset-0 rounded-t-xl rounded-b-lg"
              :class="outfitClass"
            />
          </div>

          <!-- Arms -->
          <div
            class="absolute top-2 -left-3 w-4 h-20 rounded-full rotate-12"
            :style="{ backgroundColor: customization.skinTone }"
          />
          <div
            class="absolute top-2 -right-3 w-4 h-20 rounded-full -rotate-12"
            :style="{ backgroundColor: customization.skinTone }"
          />

          <!-- Legs -->
          <div class="flex justify-center gap-1 -mt-1">
            <div
              class="w-6 h-28 rounded-b-lg"
              :style="{ backgroundColor: customization.skinTone }"
            />
            <div
              class="w-6 h-28 rounded-b-lg"
              :style="{ backgroundColor: customization.skinTone }"
            />
          </div>
        </div>

        <!-- Accessories -->
        <div
          v-for="accessory in customization.accessories"
          :key="accessory"
          class="absolute"
          :class="accessoryPosition(accessory)"
        >
          <component :is="accessoryIcon(accessory)" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Sparkle effects -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        v-for="i in 5"
        :key="i"
        class="absolute w-1 h-1 rounded-full bg-white/40 animate-pulse"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }"
      />
    </div>

    <!-- Level badge -->
    <div class="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm text-white text-xs font-bold">
      Lv. {{ level }}
    </div>

    <!-- Name tag -->
    <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
      <p class="text-sm font-semibold text-white">{{ name }}</p>
      <p class="text-xs text-white/50">{{ degree }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CharacterCustomization } from '~/stores/enrollment'

const props = defineProps<{
  name: string
  degree: string
  level: number
  customization: CharacterCustomization
}>()

const outfitClass = computed(() => {
  const outfit = props.customization.outfit
  const classes: Record<string, string> = {
    casual: 'bg-gradient-to-b from-pink-400/80 to-purple-500/80',
    formal: 'bg-gradient-to-b from-slate-600/90 to-slate-700/90',
    uniform: 'bg-gradient-to-b from-blue-500/80 to-blue-600/80',
    elegant: 'bg-gradient-to-b from-rose-400/80 to-pink-500/80',
    none: ''
  }
  return classes[outfit] || ''
})

const accessoryPosition = (accessory: string) => {
  const positions: Record<string, string> = {
    'necklace': 'top-[28%] left-1/2 -translate-x-1/2',
    'earrings': 'top-[18%] left-0',
    'glasses': 'top-[14%] left-1/2 -translate-x-1/2',
    'crown': '-top-4 left-1/2 -translate-x-1/2',
    'bow': 'top-[8%] left-1/2 -translate-x-1/2',
    'collar': 'top-[26%] left-1/2 -translate-x-1/2'
  }
  return positions[accessory] || ''
}

const accessoryIcon = (accessory: string) => {
  const icons: Record<string, string> = {
    'necklace': 'i-lucide-circle',
    'earrings': 'i-lucide-circle-dot',
    'glasses': 'i-lucide-glasses',
    'crown': 'i-lucide-crown',
    'bow': 'i-lucide-ribbon',
    'collar': 'i-lucide-circle-dashed'
  }
  return icons[accessory] || 'i-lucide-circle'
}
</script>
