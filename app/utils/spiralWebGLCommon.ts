/**
 * Common WebGL shader sources shared across all spiral templates.
 */

/**
 * Vertex shader source (shared across all templates).
 */
export const vertexShaderSource = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

/**
 * Common GLSL utilities shared by all fragment shaders.
 */
export const commonGLSL = `
  precision mediump float;
  
  uniform vec2 uResolution;
  uniform float uTime;
  uniform int uTemplate;
  uniform int uLayerCount;
  
  // Layer uniforms (up to 8 layers max)
  #define MAX_LAYERS 8
  
  uniform int uLayerTemplate[MAX_LAYERS];
  uniform vec3 uLayerColor[MAX_LAYERS];
  uniform float uLayerAngle[MAX_LAYERS];
  uniform float uLayerCumulativeAngle[MAX_LAYERS];
  uniform float uLayerSize[MAX_LAYERS];
  uniform float uLayerSpeed[MAX_LAYERS];
  uniform int uLayerDirection[MAX_LAYERS];  // 1 = forward, -1 = backward
  uniform int uLayerIntensity[MAX_LAYERS];  // 1 to 12 arms
  
  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;
  
  // Template IDs
  const int T_CLASSIC = 0;
  const int T_CONCENTRIC = 1;
  const int T_WAVE = 2;
  const int T_DOUBLE = 3;
  const int T_FRACTAL = 4;
  const int T_HELIX = 5;
  const int T_STARBURST = 6;
  const int T_GALAXY = 7;
  const int T_MANDALA = 8;
  const int T_DNA = 9;
  const int T_KALEIDOSCOPE = 10;
  const int T_VORTEX = 11;
  
  // Simple hash for pseudo-random (used by galaxy template)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // HSL to RGB conversion
  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
  }
  
  // Background color
  vec3 bgColor = vec3(0.0);
  
  // Get normalized pixel coordinates
  vec2 getUV() {
    return gl_FragCoord.xy / uResolution;
  }
  
  // Get centered, aspect-corrected pixel coordinates
  vec2 getP() {
    return (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);
  }
  
  // Get polar coordinates
  void getPolar(out float r, out float a) {
    vec2 p = getP();
    r = length(p);
    a = atan(p.y, p.x);
  }
  
  // Max radius based on layer size
  float getMaxRadius(float sizePercent) {
    return 0.5 * (sizePercent / 100.0);
  }
`
