/**
 * Second half of unified WebGL fragment shader inline code blocks.
 * Contains: Starburst, Galaxy, Mandala, DNA, Kaleidoscope, Vortex.
 * Each export is a standalone GLSL code block (wrapped in { }) to be inlined
 * inside main()'s for loop where "li" is a valid loop index variable.
 */

/**
 * GLSL code block for the Starburst template.
 */
export const starburstBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      vec3 lc = uLayerColor[li];
      int rays = arms * 6;
      float t = r / maxR;
      float rayAngle = a - angle * 0.01745;
      float rayIndex = rayAngle / (TAU / float(rays));
      float rayDist = abs(fract(rayIndex) - 0.5) * 2.0;
      float spiralOffset = t * 0.5;
      rayDist = abs(fract(rayIndex + spiralOffset) - 0.5) * 2.0;
      float ray = 1.0 - smoothstep(0.0, 0.03, rayDist);
      float ringIndex = t * 5.0;
      float ringDist = abs(fract(ringIndex) - 0.5) * 2.0;
      float ring = 1.0 - smoothstep(0.0, 0.05, ringDist);
      float ringAlpha = 0.2 + t * 0.3;
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, ray * radialFade * 0.9);
      fragColor = mix(fragColor, lc, ring * ringAlpha * radialFade * 0.3);
    }`

/**
 * GLSL code block for the Galaxy template.
 */
export const galaxyBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      vec3 lc = uLayerColor[li];
      float t = r / maxR;
      float coreGlow = exp(-r * 4.0 / maxR) * 0.8;
      fragColor = mix(fragColor, lc, coreGlow * 0.5);
      float galaxy = 0.0;
      for (int arm = 0; arm < 12; arm++) {
        if (arm >= arms) break;
        float armAngle = float(arm) * TAU / float(arms);
        float baseAngle = angle * 0.01745 + armAngle;
        float spiralAngle = a - baseAngle - t * 10.0 - uTime * uLayerSpeed[li] * 0.02 * float(uLayerDirection[li]);
        float spiralDist = abs(fract(spiralAngle / TAU) - 0.5);
        vec2 gridPos = gl_FragCoord.xy / 4.0;
        float scatter = hash(floor(gridPos));
        float scatterOffset = (scatter - 0.5) * 0.3;
        float armLine = 1.0 - smoothstep(0.0, 0.05, abs(spiralDist + scatterOffset));
        float dotEffect = step(0.7, scatter);
        galaxy = max(galaxy, armLine * dotEffect);
      }
      float alpha = (1.0 - t) * 0.8 + 0.1;
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, galaxy * alpha * radialFade * 0.7);
    }`

/**
 * GLSL code block for the Mandala template.
 */
export const mandalaBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      vec3 lc = uLayerColor[li];
      int segments = arms * 2;
      float t = r / maxR;
      float ringIndex = t * 8.0;
      float ringF = fract(ringIndex);
      float ringI = floor(ringIndex);
      float ringDist = abs(ringF - 0.5) * 2.0;
      float ring = 1.0 - smoothstep(0.0, 0.05, ringDist);
      float ringAlpha = 0.3 + t * 0.5;
      float segAngle = a - angle * 0.01745 * (mod(ringI, 2.0) == 0.0 ? 1.0 : -1.0);
      float segIndex = segAngle / (TAU / float(segments));
      float segDist = abs(fract(segIndex) - 0.5) * 2.0;
      float petal = 1.0 - smoothstep(0.0, 0.15, segDist);
      float petalShape = petal * (1.0 - smoothstep(0.0, 0.3, abs(ringF - 0.5)));
      float mandala = max(ring * 0.5, petalShape);
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, mandala * ringAlpha * radialFade * 0.6);
    }`

/**
 * GLSL code block for the DNA template.
 */
export const dnaBlock = `
    {
      vec2 p = getP();
      float r = length(p);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      vec3 lc = uLayerColor[li];
      vec3 lcDark = lc * 0.4;
      float y = p.y;
      float yNorm = (y + 0.5) * 0.5;
      float helixWidth = maxR * 0.15;
      float dna = 0.0;
      float dnaDark = 0.0;
      for (int arm = 0; arm < 12; arm++) {
        if (arm >= arms) break;
        float armOffset = float(arm) * TAU / float(arms);
        float angleRad = angle * 0.02;
        float t = yNorm * TAU * 2.0;
        float x1 = cos(t + angleRad + armOffset) * helixWidth;
        float x2 = cos(t + angleRad + armOffset + PI) * helixWidth;
        float dist1 = abs(p.x - x1);
        float dist2 = abs(p.x - x2);
        float strand1 = 1.0 - smoothstep(0.0, 0.005, dist1);
        float strand2 = 1.0 - smoothstep(0.0, 0.005, dist2);
        float rungIndex = yNorm * 30.0;
        float rungDist = abs(fract(rungIndex) - 0.5) * 2.0;
        float rung = 1.0 - smoothstep(0.0, 0.1, rungDist);
        float rungAlpha = 0.3 + 0.3 * abs(cos(t));
        float rungLine = smoothstep(0.01, 0.0, abs(p.x - (x1 + x2) * 0.5)) * rung * rungAlpha;
        dna = max(dna, strand1);
        dnaDark = max(dnaDark, strand2);
        float radialFade = 1.0 - smoothstep(0.0, maxR, r);
        fragColor = mix(fragColor, lc, dna * radialFade * 0.9);
        fragColor = mix(fragColor, lcDark, dnaDark * radialFade * 0.9);
        fragColor = mix(fragColor, lc, rungLine * radialFade * 0.5);
      }
    }`

/**
 * GLSL code block for the Kaleidoscope template.
 */
export const kaleidoscopeBlock = `
    {
      float r, a;
      getPolar(r, a);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float angle = uLayerAngle[li];
      vec3 lc = uLayerColor[li];
      int segments = arms * 2;
      float t = r / maxR;
      float segAngle = a - angle * 0.01745;
      float segSize = TAU / float(segments);
      float localAngle = mod(segAngle, segSize);
      localAngle = abs(localAngle - segSize * 0.5) * 2.0;
      float dotIndex = t * 50.0;
      float dotDist = abs(fract(dotIndex) - 0.5) * 2.0;
      float dot = 1.0 - smoothstep(0.0, 0.1, dotDist);
      float alpha = 0.3 + t * 0.5;
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, dot * alpha * radialFade * 0.6);
    }`

/**
 * GLSL code block for the Vortex template.
 */
export const vortexBlock = `
    {
      vec2 p = getP();
      float r = length(p);
      float a = atan(p.y, p.x);
      float maxR = getMaxRadius(uLayerSize[li]);
      int arms = uLayerIntensity[li];
      float cumulativeAngle = uLayerCumulativeAngle[li];
      vec3 lc = uLayerColor[li];
      float t = r / maxR;
      vec2 ellipticalP = p;
      ellipticalP.y *= 0.3;
      float ellipticalR = length(ellipticalP);
      float ellipticalT = ellipticalR / maxR;
      float ringAngle = cumulativeAngle * 0.01745 * (1.0 - ellipticalT) * 0.5;
      vec2 rotatedP = vec2(
        ellipticalP.x * cos(ringAngle) - ellipticalP.y * sin(ringAngle),
        ellipticalP.x * sin(ringAngle) + ellipticalP.y * cos(ringAngle)
      );
      float rotatedR = length(rotatedP);
      float rotatedT = rotatedR / maxR;
      float rotatedRingIndex = rotatedT * 30.0;
      float rotatedRingDist = abs(fract(rotatedRingIndex) - 0.5) * 2.0;
      float rotatedRing = 1.0 - smoothstep(0.0, 0.05, rotatedRingDist);
      float spiralAngle = a - ringAngle;
      float segIndex = spiralAngle / (TAU / float(arms));
      float segDist = abs(fract(segIndex) - 0.5) * 2.0;
      float connector = 1.0 - smoothstep(0.0, 0.1, segDist);
      float alpha = 0.1 + t * 0.6;
      float vortex = max(rotatedRing, connector * 0.3);
      float radialFade = 1.0 - smoothstep(0.0, maxR, r);
      fragColor = mix(fragColor, lc, vortex * alpha * radialFade * 0.7);
    }`
