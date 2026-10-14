/**
 * Unified WebGL fragment shader for multi-template spiral visualization.
 * Assembles the common GLSL header, all 12 template code blocks, and main().
 * All template code is inlined directly in the for loop so that "li" is a
 * valid loop index variable for uniform array access (GLSL ES 1.0 requirement).
 */

import { commonGLSL } from './spiralWebGLCommon'
import {
  classicBlock,
  concentricBlock,
  waveBlock,
  doubleBlock,
  fractalBlock,
  helixBlock
} from './spiralWebGLShaders1'
import {
  starburstBlock,
  galaxyBlock,
  mandalaBlock,
  dnaBlock,
  kaleidoscopeBlock,
  vortexBlock
} from './spiralWebGLShaders2'

/**
 * The complete unified fragment shader source combining all template inline code blocks.
 */
export const fragmentShaderUnified = `${commonGLSL}

  // Global color accumulator (GLSL ES 1.0 doesn't support inout)
  vec3 fragColor;

  void main() {
    fragColor = bgColor;

    for (int li = 0; li < MAX_LAYERS; li++) {
      if (li >= uLayerCount) break;

      int tmpl = uLayerTemplate[li];

      if (tmpl == T_CLASSIC) ${classicBlock}
      else if (tmpl == T_CONCENTRIC) ${concentricBlock}
      else if (tmpl == T_WAVE) ${waveBlock}
      else if (tmpl == T_DOUBLE) ${doubleBlock}
      else if (tmpl == T_FRACTAL) ${fractalBlock}
      else if (tmpl == T_HELIX) ${helixBlock}
      else if (tmpl == T_STARBURST) ${starburstBlock}
      else if (tmpl == T_GALAXY) ${galaxyBlock}
      else if (tmpl == T_MANDALA) ${mandalaBlock}
      else if (tmpl == T_DNA) ${dnaBlock}
      else if (tmpl == T_KALEIDOSCOPE) ${kaleidoscopeBlock}
      else if (tmpl == T_VORTEX) ${vortexBlock}
    }

    // Center glow
    float r = length(getP());
    float centerGlow = exp(-r * 6.0) * 0.15;
    fragColor += centerGlow;

    gl_FragColor = vec4(fragColor, 1.0);
  }
`
