<template>
  <select
    :value="modelValue"
    class="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
    @change="(e) => $emit('update:modelValue', (e.target as HTMLSelectElement).value)"
  >
    <option value="classic" class="bg-gray-900">
      Classic Spiral
    </option>
    <option value="concentric" class="bg-gray-900">
      Concentric Rings
    </option>
    <option value="wave" class="bg-gray-900">
      Wave Spiral
    </option>
    <option value="double" class="bg-gray-900">
      Double Spiral
    </option>
    <option value="fractal" class="bg-gray-900">
      Fractal Branches
    </option>
    <option value="helix" class="bg-gray-900">
      3D Helix
    </option>
    <option value="starburst" class="bg-gray-900">
      Starburst
    </option>
    <option value="galaxy" class="bg-gray-900">
      Galaxy
    </option>
    <option value="mandala" class="bg-gray-900">
      Mandala
    </option>
    <option value="dna" class="bg-gray-900">
      DNA Helix
    </option>
    <option value="kaleidoscope" class="bg-gray-900">
      Kaleidoscope
    </option>
    <option value="vortex" class="bg-gray-900">
      Vortex Tunnel
    </option>
  </select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
