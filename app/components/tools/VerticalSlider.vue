<template>
  <div class="vertical-slider-container">
    <div
      class="vertical-slider"
      :class="{ 'vertical-slider-small': small }"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
    >
      <div
        class="vertical-slider-track"
        :style="{
          background: `linear-gradient(to top, ${color} ${fillPercent}%, rgba(255,255,255,0.1) ${fillPercent}%)`
        }"
      >
        <div
          class="vertical-slider-thumb"
          :class="{ 'vertical-slider-thumb-small': small }"
          :style="{
            top: `calc(${(1 - value) * 100}% - ${small ? 6 : 8}px)`,
            backgroundColor
          }"
        />
      </div>
    </div>
    <span v-if="label" class="vertical-slider-label">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Current slider value (0-1 normalized). */
  value: number
  /** Color of the slider track and thumb. */
  color: string
  /** Label displayed below the slider. */
  label?: string
  /** Whether to use the smaller slider size. */
  small?: boolean
}>(), {
  label: undefined,
  small: false
})

const emit = defineEmits<{
  /** Emitted when the slider value changes (0-1 normalized). */
  'update:value': [value: number]
}>()

const fillPercent = computed(() => props.value * 100)
const backgroundColor = computed(() => props.color)

// Drag state
let dragging = false
let sliderEl: HTMLElement | null = null

function getClientY(event: MouseEvent | TouchEvent): number | null {
  const isTouch = event.type.startsWith('touch')
  if (isTouch) {
    const touch = (event as TouchEvent).touches[0]
    return touch ? touch.clientY : null
  }
  return (event as MouseEvent).clientY
}

function startDrag(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  dragging = true

  const isTouch = event.type.startsWith('touch')
  const target = isTouch
    ? document.elementFromPoint(
        (event as TouchEvent).touches[0]!.clientX,
        (event as TouchEvent).touches[0]!.clientY
      )
    : (event as MouseEvent).target
  sliderEl = target ? (target as HTMLElement).closest('.vertical-slider') : null

  updateValue(event)

  const moveEvent = isTouch ? 'touchmove' : 'mousemove'
  const upEvent = isTouch ? 'touchend' : 'mouseup'
  document.addEventListener(moveEvent, onDragMove)
  document.addEventListener(upEvent, onDragEnd)
}

function onMouseDown(event: MouseEvent) {
  startDrag(event)
}

function onTouchStart(event: TouchEvent) {
  startDrag(event)
}

function onDragMove(event: MouseEvent | TouchEvent) {
  if (dragging) {
    updateValue(event)
  }
}

function onDragEnd() {
  dragging = false
  sliderEl = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
}

function updateValue(event: MouseEvent | TouchEvent) {
  if (!sliderEl) return

  const clientY = getClientY(event)
  if (clientY === null) return

  const rect = sliderEl.getBoundingClientRect()
  // ratio: 1 at top, 0 at bottom
  const ratio = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
  emit('update:value', ratio)
}
</script>

<style scoped>
.vertical-slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.vertical-slider {
  position: relative;
  width: 24px;
  height: 160px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vertical-slider-small {
  height: 96px;
}

.vertical-slider-track {
  position: relative;
  width: 6px;
  height: 100%;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
}

.vertical-slider-thumb {
  position: absolute;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transform: translateX(-50%);
  pointer-events: none;
  transition: background-color 0.1s, transform 0.1s;
}

.vertical-slider-thumb-small {
  width: 12px;
  height: 12px;
}

.vertical-slider:hover .vertical-slider-thumb {
  transform: translateX(-50%) scale(1.2);
}

.vertical-slider-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}
</style>
