<template>
  <canvas
    ref="canvasRef"
    class="w-full h-full"
  />
</template>

<script setup lang="ts">
import type { SpiralConfig, SpiralUniforms } from '../utils/spiralWebGL'
import { initSpiralWebGL, renderSpiralFrame } from '../utils/spiralWebGL'

const props = withDefaults(defineProps<{
  config?: Partial<SpiralConfig>
  playing?: boolean
}>(), {
  config: () => ({}),
  playing: true
})

const defaultConfig: SpiralConfig = {
  arms: 4,
  speed: 0.5,
  hue1: 280,
  hue2: 320,
  saturation: 70,
  lightness: 50,
  tightness: 0.15,
  lineWidth: 2,
  pulse: true,
  pulseSpeed: 1.5
}

function getConfig(): SpiralConfig {
  return { ...defaultConfig, ...props.config }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let gl: WebGLRenderingContext | null = null
let uniforms: SpiralUniforms | null = null
let startTime = 0
let lastTime = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
}

function render(time: number) {
  if (!gl || !canvasRef.value || !uniforms) return
  const elapsed = time / 1000 - startTime
  renderSpiralFrame(gl, canvasRef.value, uniforms, getConfig(), elapsed, props.playing)
  animationId = requestAnimationFrame(render)
}

function start() {
  const canvas = canvasRef.value
  if (!canvas) return
  const result = initSpiralWebGL(canvas)
  if (!result) return
  gl = result.gl
  uniforms = result.uniforms
  resizeCanvas()
  startTime = performance.now() / 1000
  animationId = requestAnimationFrame(render)
}

function stop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

onMounted(() => {
  start()
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', resizeCanvas)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})

watch(() => props.playing, (isPlaying) => {
  if (isPlaying) {
    startTime = performance.now() / 1000 - (lastTime - startTime)
    start()
  } else {
    lastTime = performance.now() / 1000
    stop()
  }
})
</script>
