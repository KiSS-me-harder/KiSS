<template>
  <div class="space-y-4">
    <!-- XP Bar -->
    <div class="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-star" class="w-4 h-4 text-yellow-400" />
          <span class="text-sm font-semibold text-white">Level {{ level }}</span>
        </div>
        <span class="text-xs text-white/50">{{ xp }} / {{ xp + xpNeeded }} XP</span>
      </div>
      <div class="h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
          :style="{ width: `${((xp % 100) / 100) * 100}%` }"
        />
      </div>
    </div>

    <!-- Stat Bars -->
    <div class="space-y-3">
      <div
        v-for="stat in statsList"
        :key="stat.key"
        class="group"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <UIcon :name="stat.icon" class="w-4 h-4" :class="stat.color" />
            <span class="text-sm text-white/80">{{ stat.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-white/50">{{ stats[stat.key] }}</span>
            <div class="flex gap-0.5">
              <button
                class="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs flex items-center justify-center transition-colors"
                @click="decrement(stat.key)"
              >
                <UIcon name="i-lucide-minus" class="w-3 h-3" />
              </button>
              <button
                class="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs flex items-center justify-center transition-colors"
                @click="increment(stat.key)"
              >
                <UIcon name="i-lucide-plus" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div class="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="stat.barColor"
            :style="{ width: `${stats[stat.key]}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Stat Points Available -->
    <div v-if="statPoints > 0" class="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
      <p class="text-sm text-yellow-400 font-semibold">
        <UIcon name="i-lucide-sparkles" class="w-4 h-4 inline mr-1" />
        {{ statPoints }} Stat Points Available
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CharacterStats } from '~/stores/enrollment'

const props = defineProps<{
  stats: CharacterStats
  level: number
  xp: number
  xpNeeded: number
  statPoints?: number
}>()

const emit = defineEmits<{
  update: [stat: keyof CharacterStats, value: number]
}>()

const statsList = [
  { key: 'obedience' as const, label: 'Obedience', icon: 'i-lucide-heart', color: 'text-pink-400', barColor: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { key: 'charm' as const, label: 'Charm', icon: 'i-lucide-sparkles', color: 'text-purple-400', barColor: 'bg-gradient-to-r from-purple-500 to-violet-500' },
  { key: 'knowledge' as const, label: 'Knowledge', icon: 'i-lucide-book-open', color: 'text-blue-400', barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { key: 'confidence' as const, label: 'Confidence', icon: 'i-lucide-flame', color: 'text-orange-400', barColor: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { key: 'flexibility' as const, label: 'Flexibility', icon: 'i-lucide-wind', color: 'text-emerald-400', barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  { key: 'creativity' as const, label: 'Creativity', icon: 'i-lucide-palette', color: 'text-indigo-400', barColor: 'bg-gradient-to-r from-indigo-500 to-purple-500' }
]

const increment = (stat: keyof CharacterStats) => {
  const newValue = Math.min(100, props.stats[stat] + 1)
  emit('update', stat, newValue)
}

const decrement = (stat: keyof CharacterStats) => {
  const newValue = Math.max(0, props.stats[stat] - 1)
  emit('update', stat, newValue)
}
</script>
