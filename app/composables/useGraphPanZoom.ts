/**
 * Composable for SVG graph pan and zoom interactions.
 */
import { createMouseHandlers, createTouchHandlers, createZoomControls } from '~/utils/graphPanZoomHelpers'

export function useGraphPanZoom(
  graphContainer: Ref<HTMLElement | null>,
  svgElement: Ref<SVGSVGElement | null>,
  nodes: Ref<{ x: number, y: number }[]>
) {
  const panX = ref(0)
  const panY = ref(0)
  const zoom = ref(1)
  const isPanning = ref(false)
  const panStart = ref({ x: 0, y: 0 })
  const panStartOffset = ref({ x: 0, y: 0 })

  const touchStart = ref({ x: 0, y: 0 })
  const touchStartOffset = ref({ x: 0, y: 0 })
  const lastTouchDistance = ref(0)
  const lastTouchZoom = ref(1)

  const mouseHandlers = createMouseHandlers(
    graphContainer, svgElement, nodes, panX, panY, zoom, isPanning, panStart, panStartOffset
  )

  const touchHandlers = createTouchHandlers(
    graphContainer, panX, panY, zoom, touchStart, touchStartOffset, lastTouchDistance, lastTouchZoom
  )

  const zoomControls = createZoomControls(graphContainer, panX, panY, zoom, nodes)

  return {
    panX, panY, zoom, isPanning,
    ...mouseHandlers,
    ...touchHandlers,
    ...zoomControls
  }
}
