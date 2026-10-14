/**
 * WebGL renderer for multi-template spiral visualization.
 * Handles context initialization, uniform management, and frame rendering.
 */

import { vertexShaderSource } from './spiralWebGLCommon'
import { fragmentShaderUnified } from './spiralWebGLUnified'

/** Maximum number of layers supported by the WebGL renderer. */
export const MAX_LAYERS = 8

/**
 * Template ID mapping - must match the GLSL constants.
 */
export const templateIds: Record<string, number> = {
  classic: 0,
  concentric: 1,
  wave: 2,
  double: 3,
  fractal: 4,
  helix: 5,
  starburst: 6,
  galaxy: 7,
  mandala: 8,
  dna: 9,
  kaleidoscope: 10,
  vortex: 11
}

/**
 * Layer data for WebGL rendering.
 */
export interface WebGLLayerData {
  template: number
  color: [number, number, number] // RGB 0-1
  angle: number
  cumulativeAngle: number
  size: number
  speed: number
  direction: number // 1 or -1
  intensity: number // 1-12 arms
}

/**
 * Uniform location keys for the multi-template spiral shader.
 */
export interface SpiralMultiUniforms {
  uResolution: WebGLUniformLocation | null
  uTime: WebGLUniformLocation | null
  uLayerCount: WebGLUniformLocation | null
  uLayerTemplate: (WebGLUniformLocation | null)[]
  uLayerColor: (WebGLUniformLocation | null)[]
  uLayerAngle: (WebGLUniformLocation | null)[]
  uLayerCumulativeAngle: (WebGLUniformLocation | null)[]
  uLayerSize: (WebGLUniformLocation | null)[]
  uLayerSpeed: (WebGLUniformLocation | null)[]
  uLayerDirection: (WebGLUniformLocation | null)[]
  uLayerIntensity: (WebGLUniformLocation | null)[]
}

/**
 * Result of initializing the WebGL renderer.
 */
export interface SpiralWebGLRenderer {
  gl: WebGLRenderingContext
  canvas: HTMLCanvasElement
  uniforms: SpiralMultiUniforms
}

/**
 * Creates a WebGL shader from source code.
 * @param gl - The WebGL rendering context.
 * @param type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER).
 * @param source - GLSL source code.
 * @returns The compiled shader, or null on failure.
 */
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
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

/**
 * Initializes the WebGL context, compiles shaders, creates the program,
 * and sets up the full-screen quad.
 * @param canvas - The canvas element to render on.
 * @returns The renderer object with GL context and uniforms, or null on failure.
 */
export function initSpiralWebGL(canvas: HTMLCanvasElement): SpiralWebGLRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true })
  if (!gl) {
    console.error('WebGL not supported')
    return null
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderUnified)
  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return null
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

  // Get uniform locations
  const uniforms: SpiralMultiUniforms = {
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uLayerCount: gl.getUniformLocation(program, 'uLayerCount'),
    uLayerTemplate: [],
    uLayerColor: [],
    uLayerAngle: [],
    uLayerCumulativeAngle: [],
    uLayerSize: [],
    uLayerSpeed: [],
    uLayerDirection: [],
    uLayerIntensity: []
  }

  for (let i = 0; i < MAX_LAYERS; i++) {
    uniforms.uLayerTemplate.push(gl.getUniformLocation(program, `uLayerTemplate[${i}]`))
    uniforms.uLayerColor.push(gl.getUniformLocation(program, `uLayerColor[${i}]`))
    uniforms.uLayerAngle.push(gl.getUniformLocation(program, `uLayerAngle[${i}]`))
    uniforms.uLayerCumulativeAngle.push(gl.getUniformLocation(program, `uLayerCumulativeAngle[${i}]`))
    uniforms.uLayerSize.push(gl.getUniformLocation(program, `uLayerSize[${i}]`))
    uniforms.uLayerSpeed.push(gl.getUniformLocation(program, `uLayerSpeed[${i}]`))
    uniforms.uLayerDirection.push(gl.getUniformLocation(program, `uLayerDirection[${i}]`))
    uniforms.uLayerIntensity.push(gl.getUniformLocation(program, `uLayerIntensity[${i}]`))
  }

  return { gl, canvas, uniforms }
}

/**
 * Parses a hex color string to RGB 0-1 values.
 * @param hex - Hex color string (e.g. "#ff0000").
 * @returns RGB tuple with values 0-1.
 */
export function hexToRGB01(hex: string): [number, number, number] {
  if (!hex.startsWith('#')) return [1, 1, 1]
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1]
  return [r, g, b]
}

/**
 * Renders a single frame of the spiral visualization.
 * @param renderer - The WebGL renderer object.
 * @param layers - Array of layer data.
 * @param elapsed - Elapsed time in seconds.
 */
export function renderSpiralFrame(
  renderer: SpiralWebGLRenderer,
  layers: WebGLLayerData[],
  elapsed: number
) {
  const { gl, canvas, uniforms } = renderer

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.uniform2f(uniforms.uResolution!, canvas.width, canvas.height)
  gl.uniform1f(uniforms.uTime!, elapsed)
  gl.uniform1i(uniforms.uLayerCount!, Math.min(layers.length, MAX_LAYERS))

  // Set layer uniforms
  for (let i = 0; i < MAX_LAYERS; i++) {
    if (i < layers.length) {
      const layer = layers[i]
      gl.uniform1i(uniforms.uLayerTemplate[i]!, layer.template)
      gl.uniform3f(uniforms.uLayerColor[i]!, layer.color[0], layer.color[1], layer.color[2])
      gl.uniform1f(uniforms.uLayerAngle[i]!, layer.angle)
      gl.uniform1f(uniforms.uLayerCumulativeAngle[i]!, layer.cumulativeAngle)
      gl.uniform1f(uniforms.uLayerSize[i]!, layer.size)
      gl.uniform1f(uniforms.uLayerSpeed[i]!, layer.speed)
      gl.uniform1i(uniforms.uLayerDirection[i]!, layer.direction)
      gl.uniform1i(uniforms.uLayerIntensity[i]!, layer.intensity)
    } else {
      // Set inactive layers to safe defaults
      gl.uniform1i(uniforms.uLayerTemplate[i]!, -1)
      gl.uniform3f(uniforms.uLayerColor[i]!, 0, 0, 0)
      gl.uniform1f(uniforms.uLayerAngle[i]!, 0)
      gl.uniform1f(uniforms.uLayerCumulativeAngle[i]!, 0)
      gl.uniform1f(uniforms.uLayerSize[i]!, 100)
      gl.uniform1f(uniforms.uLayerSpeed[i]!, 0)
      gl.uniform1i(uniforms.uLayerDirection[i]!, 1)
      gl.uniform1i(uniforms.uLayerIntensity[i]!, 1)
    }
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

/**
 * Resizes the WebGL canvas to match the display size.
 * @param renderer - The WebGL renderer object.
 * @param width - Desired width in pixels.
 * @param height - Desired height in pixels.
 */
export function resizeWebGLCanvas(renderer: SpiralWebGLRenderer, width: number, height: number) {
  const { canvas } = renderer
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

/**
 * Cleans up the WebGL context and resources.
 * @param renderer - The WebGL renderer object.
 */
export function cleanupWebGL(renderer: SpiralWebGLRenderer) {
  const { gl } = renderer
  const ext = gl.getExtension('WEBGL_lose_context')
  if (ext) {
    ext.loseContext()
  }
}
