import type { SpiralLayerData } from '~/utils/spiralDrawing'
import type { SpiralLayer } from '~/components/tools/SpiralLayers.vue'

/**
 * Maps SpiralLayer props to SpiralLayerData for drawing.
 * @param layers - Array of spiral layers.
 * @returns Array of layer data objects.
 */
export function mapLayerData(layers: SpiralLayer[]): SpiralLayerData[] {
  return layers.map(l => ({
    template: l.template,
    color: l.color,
    angle: l.angle,
    cumulativeAngle: l.cumulativeAngle ?? l.angle,
    size: l.size,
    speed: l.speed,
    direction: l.direction,
    intensity: l.intensity
  }))
}
