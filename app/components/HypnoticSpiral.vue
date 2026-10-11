<template>
  <canvas
    ref="canvasRef"
    class="w-full h-full"
  />
</template>

<script setup lang="ts">
interface SpiralConfig {
  /** Number of spiral arms */
  arms: number
  /** Rotation speed (radians per second) */
  speed: number
  /** Primary color hue (0-360) */
  hue1: number
  /** Secondary color hue (0-360) */
  hue2: number
  /** Saturation percentage */
  saturation: number
  /** Lightness percentage */
  lightness: number
  /** Spiral tightness (how quickly it expands) */
  tightness: number
  /** Line width multiplier */
  lineWidth: number
  /** Whether to pulse the colors */
  pulse: boolean
  /** Pulse speed multiplier */
  pulseSpeed: number
}

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

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let gl: WebGLRenderingContext | null = null
let startTime = 0
let lastTime = 0

function getConfig(): SpiralConfig {
  return { ...defaultConfig, ...props.config }
}

// WebGL shaders
const vertexShaderSource = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform int uArms;
  uniform float uHue1;
  uniform float uHue2;
  uniform float uSaturation;
  uniform float uLightness;
  uniform float uTightness;
  uniform float uLineWidth;
  uniform float uPulse;
  uniform float uPulseSpeed;

  // HSL to RGB conversion
  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);

    // Polar coordinates
    float r = length(p);
    float a = atan(p.y, p.x);

    // Spiral pattern
    float spiral = 0.0;
    for (int i = 0; i < 8; i++) {
      if (i >= uArms) break;
      float angleOffset = float(i) * 3.14159265 * 2.0 / float(uArms);
      float spiralAngle = a - angleOffset - r * uTightness * 20.0 - uTime * uSpeed;
      float spiralLine = abs(fract(spiralAngle / 3.14159265) - 0.5);
      spiral = max(spiral, 1.0 - smoothstep(0.0, uLineWidth * 0.02, spiralLine));
    }

    // Radial fade
    float radialFade = 1.0 - smoothstep(0.0, 0.7, r);

    // Pulse effect
    float pulseEffect = 1.0;
    if (uPulse > 0.5) {
      pulseEffect = 0.7 + 0.3 * sin(uTime * uPulseSpeed);
    }

    // Color calculation
    float hueMix = (sin(uTime * 0.3) * 0.5 + 0.5);
    float hue = mix(uHue1, uHue2, hueMix) / 360.0;
    float lightness = uLightness / 100.0 * (1.0 - r * 0.5) * pulseEffect;
    float saturation = uSaturation / 100.0;

    vec3 color = hsl2rgb(hue, saturation, lightness);

    // Background (dark)
    vec3 bgColor = vec3(0.02, 0.01, 0.03);
    color = mix(bgColor, color, spiral * radialFade);

    // Center glow
    float centerGlow = exp(-r * 3.0) * 0.3 * pulseEffect;
    vec3 glowColor = hsl2rgb(hue, saturation, uLightness / 100.0 * pulseEffect);
    color += glowColor * centerGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initWebGL() {
  const canvas = canvasRef.value
  if (!canvas) return

  gl = canvas.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) {
    console.error('WebGL not supported')
    return
  }

  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  if (!vertexShader || !fragmentShader) return

  // Create program
  const program = gl.createProgram()
  if (!program) return
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)

  // Create full-screen quad
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const aPosition = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

  // Store uniforms on gl for convenience
  ;(gl as any)._uniforms = {
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    uArms: gl.getUniformLocation(program, 'uArms'),
    uHue1: gl.getUniformLocation(program, 'uHue1'),
    uHue2: gl.getUniformLocation(program, 'uHue2'),
    uSaturation: gl.getUniformLocation(program, 'uSaturation'),
    uLightness: gl.getUniformLocation(program, 'uLightness'),
    uTightness: gl.getUniformLocation(program, 'uTightness'),
    uLineWidth: gl.getUniformLocation(program, 'uLineWidth'),
    uPulse: gl.getUniformLocation(program, 'uPulse'),
    uPulseSpeed: gl.getUniformLocation(program, 'uPulseSpeed')
  }

  startTime = performance.now() / 1000
  lastTime = startTime
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
}

function render(time: number) {
  if (!gl || !canvasRef.value) return

  const now = time / 1000
  const elapsed = now - startTime

  const config = getConfig()
  const uniforms = (gl as any)._uniforms

  if (!uniforms) return

  gl.viewport(0, 0, canvasRef.value.width, canvasRef.value.height)

  gl.uniform2f(uniforms.uResolution, canvasRef.value.width, canvasRef.value.height)
  gl.uniform1f(uniforms.uTime, elapsed)
  gl.uniform1f(uniforms.uSpeed, config.speed)
  gl.uniform1i(uniforms.uArms, config.arms)
  gl.uniform1f(uniforms.uHue1, config.hue1)
  gl.uniform1f(uniforms.uHue2, config.hue2)
  gl.uniform1f(uniforms.uSaturation, config.saturation)
  gl.uniform1f(uniforms.uLightness, config.lightness)
  gl.uniform1f(uniforms.uTightness, config.tightness)
  gl.uniform1f(uniforms.uLineWidth, config.lineWidth)
  gl.uniform1f(uniforms.uPulse, props.playing && config.pulse ? 1.0 : 0.0)
  gl.uniform1f(uniforms.uPulseSpeed, config.pulseSpeed)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  animationId = requestAnimationFrame(render)
}

function start() {
  initWebGL()
  resizeCanvas()
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
  if (gl) {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
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
