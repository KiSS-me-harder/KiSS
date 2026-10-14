/**
 * First half of unified WebGL fragment shader inline code blocks.
 * Contains: Classic, Concentric, Wave, Double, Fractal, Helix.
 * Each export is a standalone GLSL code block (wrapped in { }) to be inlined
 * inside main()'s for loop where "li" is a valid loop index variable.
 */

/**
 * GLSL code block for the Classic template.
 */
export const classicBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      float sizeFactor = 0.7 * (maxR / PI);
      int arms = uLayerIntensity[li];
      vec3 lc = uLayerColor[li];
      float spiral = 0.0;
      for (int i = 0; i < 12; i++) {
        if (i >= arms) break;
        float angleOffset = float(i) * TAU / float(arms);
        float spiralAngle = a - angleOffset - r * 20.0 / sizeFactor - uTime * uLayerSpeed[li] * 0.02 * float(uLayerDirection[li]);
        float spiralLine = abs(fract(spiralAngle / PI) - 0.5);
        spiral = max(spiral, 1.0 - smoothstep(0.0, 0.02, spiralLine));
      }
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, spiral * radialFade * 0.9);
    }`

/**
 * GLSL code block for the Concentric template.
 */
export const concentricBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      float ringSpacing = maxR / 20.0;
      vec3 lc = uLayerColor[li];
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      for (int arm = 0; arm < 12; arm++) {
        if (arm >= arms) break;
        float armAngle = float(arm) * TAU / float(arms);
        float ringPos = (r - (angle * 0.01 + armAngle) * ringSpacing) / ringSpacing;
        float ringDist = abs(fract(ringPos) - 0.5) * 2.0;
        float ring = 1.0 - smoothstep(0.0, 0.6, ringDist);
        float t = r / maxR;
        float alpha = 0.3 + t * 0.7;
        float radialFade = 1.0 - smoothstep(0.0, maxR, r);
        fragColor = mix(fragColor, lc, ring * alpha * radialFade * 0.5);
      }
    }`

/**
 * GLSL code block for the Wave template.
 */
export const waveBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      float sizeFactor = maxR / 3.5;
      int arms = uLayerIntensity[li];
      vec3 lc = uLayerColor[li];
      float spiral = 0.0;
      for (int i = 0; i < 12; i++) {
        if (i >= arms) break;
        float angleOffset = float(i) * TAU / float(arms);
        float theta = a - angleOffset;
        float wave = sin(r * 3.0) * 0.15;
        float spiralAngle = theta - r / sizeFactor - uTime * uLayerSpeed[li] * 0.02 * float(uLayerDirection[li]) + wave;
        float spiralLine = abs(fract(spiralAngle / PI) - 0.5);
        spiral = max(spiral, 1.0 - smoothstep(0.0, 0.015, spiralLine));
      }
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, spiral * radialFade * 0.9);
    }`

/**
 * GLSL code block for the Double template.
 */
export const doubleBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      float sizeFactor = 0.5 * (maxR / PI);
      int arms = uLayerIntensity[li];
      vec3 lc = uLayerColor[li];
      vec3 lcDark = lc * 0.4;
      float spiral = 0.0;
      float spiral2 = 0.0;
      for (int i = 0; i < 12; i++) {
        if (i >= arms) break;
        float angleOffset = float(i) * TAU / float(arms);
        float spiralAngle = a - angleOffset - r / sizeFactor - uTime * uLayerSpeed[li] * 0.02 * float(uLayerDirection[li]);
        float spiralLine = abs(fract(spiralAngle / PI) - 0.5);
        spiral = max(spiral, 1.0 - smoothstep(0.0, 0.015, spiralLine));
        float spiralAngle2 = spiralAngle + PI;
        float spiralLine2 = abs(fract(spiralAngle2 / PI) - 0.5);
        spiral2 = max(spiral2, 1.0 - smoothstep(0.0, 0.015, spiralLine2));
      }
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, spiral * radialFade * 0.9);
      fragColor = mix(fragColor, lcDark, spiral2 * radialFade * 0.9);
    }`

/**
 * GLSL code block for the Fractal template.
 */
export const fractalBlock = `
    {
      vec2 p = getP();
      float r = length(p);
      float a = atan(p.y, p.x);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float cumulativeAngle = uLayerCumulativeAngle[li];
      vec3 lc = uLayerColor[li];
      float sway = sin(cumulativeAngle * 0.01745) * 0.5;
      float cumulativeRad = cumulativeAngle * 0.01745;
      float fractal = 0.0;
      for (int arm = 0; arm < 12; arm++) {
        if (arm >= arms) break;
        float armAngle = float(arm) * TAU / float(arms) + cumulativeRad;
        float localA = a - armAngle;
        for (int depth = 0; depth < 5; depth++) {
          float branchAngle = localA - sway * float(depth);
          float branchR = r * pow(1.43, float(depth));
          float branchDist = abs(sin(branchAngle * 2.0)) * 0.5;
          float lineDist = abs(branchR - r * float(depth + 1) * 0.5);
          float dist = length(vec2(branchDist, lineDist));
          float alpha = 0.3 + (5.0 - float(depth)) / 5.0 * 0.7;
          float line = 1.0 - smoothstep(0.0, 0.01 * pow(1.43, float(depth)), dist);
          fractal = max(fractal, line * alpha);
        }
      }
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, fractal * radialFade * 0.7);
    }`

/**
 * GLSL code block for the Helix template.
 */
export const helixBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      vec3 lc = uLayerColor[li];
      float helix = 0.0;
      for (int arm = 0; arm < 12; arm++) {
        if (arm >= arms) break;
        float armAngle = float(arm) * TAU / float(arms);
        float t = r / maxR;
        float helixAngle = a - armAngle - t * 10.0 - uTime * uLayerSpeed[li] * 0.02 * float(uLayerDirection[li]);
        float helixLine = abs(fract(helixAngle / TAU) - 0.5);
        float line = 1.0 - smoothstep(0.0, 0.02, helixLine);
        float depth = cos(a + uTime * uLayerSpeed[li] * 0.02);
        float depthFactor = (depth + 1.0) * 0.5;
        helix = max(helix, line * (0.3 + 0.7 * depthFactor));
      }
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, helix * radialFade * 0.9);
    }`
