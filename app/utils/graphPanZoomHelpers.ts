/**
 * Helper functions for graph pan and zoom interactions.
 * Extracted from useGraphPanZoom to keep the composable within line limits.
 */

/**
 * Zoom transformation result.
 */
export interface ZoomTransform {
  panX: number
  panY: number
  zoom: number
}

/**
 * Touch pair distance calculation.
 * @param touches - The touch list.
 * @returns Distance between two touches, or 0 if not a pair.
 */
export function getTouchDistance(touches: TouchList): number {
  if (touches.length !== 2 || !touches[0] || !touches[1]) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Applies a zoom delta centered on a point.
 * @param currentZoom - Current zoom level.
 * @param delta - Zoom multiplier (e.g., 0.9 for zoom out, 1.1 for zoom in).
 * @param centerX - X coordinate of the zoom center.
 * @param centerY - Y coordinate of the zoom center.
 * @param currentPanX - Current pan X offset.
 * @param currentPanY - Current pan Y offset.
 * @returns New zoom transform values.
 */
export function applyZoomDelta(
  currentZoom: number,
  delta: number,
  centerX: number,
  centerY: number,
  currentPanX: number,
  currentPanY: number
): ZoomTransform {
  const newZoom = Math.max(0.2, Math.min(5, currentZoom * delta))
  const scale = newZoom / currentZoom
  const panX = centerX - (centerX - currentPanX) * scale
  const panY = centerY - (centerY - currentPanY) * scale
  return { panX, panY, zoom: newZoom }
}

/**
 * Centers the graph view on the given nodes within the container.
 * @param nodes - Array of node positions.
 * @param containerWidth - Container width in pixels.
 * @param containerHeight - Container height in pixels.
 * @param padding - Padding around the graph in pixels.
 * @returns Pan offsets for centering, or null if no nodes.
 */
export function calculateCenterTransform(
  nodes: { x: number, y: number }[],
  containerWidth: number,
  containerHeight: number,
  padding: number = 80
): { panX: number, panY: number } | null {
  if (nodes.length === 0) return null
  const minX = Math.min(...nodes.map(n => n.x)) - padding
  const maxX = Math.max(...nodes.map(n => n.x)) + padding
  const minY = Math.min(...nodes.map(n => n.y)) - padding
  const maxY = Math.max(...nodes.map(n => n.y)) + padding
  const graphW = maxX - minX
  const graphH = maxY - minY
  const panX = (containerWidth - graphW) / 2 - minX
  const panY = (containerHeight - graphH) / 2 - minY
  return { panX, panY }
}

/**
 * Finds the closest node to a given SVG coordinate.
 * @param svgX - X coordinate in SVG space.
 * @param svgY - Y coordinate in SVG space.
 * @param nodes - Array of node positions.
 * @param threshold - Maximum distance to consider a node as "closest".
 * @returns The closest node or null if none within threshold.
 */
export function findClosestNode(
  svgX: number,
  svgY: number,
  nodes: { x: number, y: number }[],
  threshold: number
): { x: number, y: number } | null {
  let closest: { x: number, y: number } | null = null
  let closestDist = threshold
  for (const node of nodes) {
    const dx = svgX - node.x
    const dy = svgY - node.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < closestDist) {
      closestDist = dist
      closest = node
    }
  }
  return closest
}

/**
 * Calculates SVG coordinates from mouse event coordinates.
 * @param clientX - Mouse client X.
 * @param clientY - Mouse client Y.
 * @param svgRect - SVG element bounding rectangle.
 * @param panX - Current pan X offset.
 * @param panY - Current pan Y offset.
 * @param zoomLevel - Current zoom level.
 * @returns SVG coordinate object.
 */
export function clientToSvgCoords(
  clientX: number,
  clientY: number,
  svgRect: DOMRect,
  panX: number,
  panY: number,
  zoomLevel: number
): { svgX: number, svgY: number } {
  const svgX = ((clientX - svgRect.left) - panX) / zoomLevel
  const svgY = ((clientY - svgRect.top) - panY) / zoomLevel
  return { svgX, svgY }
}

/**
 * Handles pinch-to-zoom touch move event.
 * @param touches - Current touch list (must have 2 touches).
 * @param lastDistance - Last recorded pinch distance.
 * @param lastZoom - Zoom level when pinch started.
 * @param containerRect - Container bounding rectangle or null.
 * @param currentPanX - Current pan X.
 * @param currentPanY - Current pan Y.
 * @param currentZoom - Current zoom level.
 * @returns New pan/zoom values or null if invalid pinch.
 */
export function handlePinchZoom(
  touches: TouchList,
  lastDistance: number,
  lastZoom: number,
  containerRect: DOMRect | null,
  currentPanX: number,
  currentPanY: number,
  currentZoom: number
): { panX: number, panY: number, zoom: number } | null {
  if (touches.length !== 2 || !touches[0] || !touches[1] || lastDistance <= 0 || !containerRect) {
    return null
  }
  const distance = Math.sqrt(
    (touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2
  )
  const scale = distance / lastDistance
  const newZoom = Math.max(0.2, Math.min(5, lastZoom * scale))
  const midX = (touches[0].clientX + touches[1].clientX) / 2 - containerRect.left
  const midY = (touches[0].clientY + touches[1].clientY) / 2 - containerRect.top
  const actualScale = newZoom / currentZoom
  const panX = midX - (midX - currentPanX) * actualScale
  const panY = midY - (midY - currentPanY) * actualScale
  return { panX, panY, zoom: newZoom }
}

/**
 * Creates mouse event handlers for graph pan and zoom.
 * @param graphContainer - Graph container element ref.
 * @param svgElement - SVG element ref.
 * @param nodes - Nodes ref.
 * @param panX - Pan X ref.
 * @param panY - Pan Y ref.
 * @param zoom - Zoom ref.
 * @param isPanning - Is panning ref.
 * @param panStart - Pan start position ref.
 * @param panStartOffset - Pan start offset ref.
 * @returns Object with mouse event handlers.
 */
export function createMouseHandlers(
  graphContainer: Ref<HTMLElement | null>,
  svgElement: Ref<SVGSVGElement | null>,
  nodes: Ref<{ x: number, y: number }[]>,
  panX: Ref<number>,
  panY: Ref<number>,
  zoom: Ref<number>,
  isPanning: Ref<boolean>,
  panStart: Ref<{ x: number, y: number }>,
  panStartOffset: Ref<{ x: number, y: number }>
) {
  function onMouseDown(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.cursor-pointer')) return
    isPanning.value = true
    panStart.value = { x: event.clientX, y: event.clientY }
    panStartOffset.value = { x: panX.value, y: panY.value }
  }

  function onGraphMouseMove(event: MouseEvent, onHover?: (x: number, y: number) => void) {
    if (isPanning.value) {
      panX.value = panStartOffset.value.x + (event.clientX - panStart.value.x)
      panY.value = panStartOffset.value.y + (event.clientY - panStart.value.y)
      return
    }
    const container = graphContainer.value
    if (!container) return
    const svgRect = svgElement.value?.getBoundingClientRect()
    if (!svgRect) return
    const { svgX, svgY } = clientToSvgCoords(event.clientX, event.clientY, svgRect, panX.value, panY.value, zoom.value)
    const closest = findClosestNode(svgX, svgY, nodes.value, 30 / zoom.value)
    if (closest && onHover) {
      const rect = container.getBoundingClientRect()
      onHover(event.clientX - rect.left, event.clientY - rect.top)
    }
  }

  function onMouseUp() {
    isPanning.value = false
  }

  function onMouseLeave() {
    isPanning.value = false
  }

  function onWheel(event: MouseEvent) {
    const wheelEvent = event as WheelEvent
    const delta = wheelEvent.deltaY > 0 ? 0.9 : 1.1
    const container = graphContainer.value
    const rect = container!.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const result = applyZoomDelta(zoom.value, delta, mouseX, mouseY, panX.value, panY.value)
    panX.value = result.panX
    panY.value = result.panY
    zoom.value = result.zoom
  }

  return { onMouseDown, onGraphMouseMove, onMouseUp, onMouseLeave, onWheel }
}

/**
 * Creates touch event handlers for graph pan and zoom.
 * @param graphContainer - Graph container element ref.
 * @param panX - Pan X ref.
 * @param panY - Pan Y ref.
 * @param zoom - Zoom ref.
 * @param touchStart - Touch start position ref.
 * @param touchStartOffset - Touch start offset ref.
 * @param lastTouchDistance - Last touch distance ref.
 * @param lastTouchZoom - Last touch zoom ref.
 * @returns Object with touch event handlers.
 */
export function createTouchHandlers(
  graphContainer: Ref<HTMLElement | null>,
  panX: Ref<number>,
  panY: Ref<number>,
  zoom: Ref<number>,
  touchStart: Ref<{ x: number, y: number }>,
  touchStartOffset: Ref<{ x: number, y: number }>,
  lastTouchDistance: Ref<number>,
  lastTouchZoom: Ref<number>
) {
  function onTouchStart(event: TouchEvent) {
    if ((event.target as HTMLElement).closest('.cursor-pointer')) return
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      if (touch) {
        touchStart.value = { x: touch.clientX, y: touch.clientY }
        touchStartOffset.value = { x: panX.value, y: panY.value }
      }
    } else if (event.touches.length === 2) {
      lastTouchDistance.value = getTouchDistance(event.touches)
      lastTouchZoom.value = zoom.value
    }
  }

  function onTouchMove(event: TouchEvent) {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      if (touch) {
        panX.value = touchStartOffset.value.x + (touch.clientX - touchStart.value.x)
        panY.value = touchStartOffset.value.y + (touch.clientY - touchStart.value.y)
      }
    } else if (event.touches.length === 2) {
      const container = graphContainer.value
      const rect = container?.getBoundingClientRect()
      const result = handlePinchZoom(
        event.touches, lastTouchDistance.value, lastTouchZoom.value,
        rect ?? null, panX.value, panY.value, zoom.value
      )
      if (result) {
        panX.value = result.panX
        panY.value = result.panY
        zoom.value = result.zoom
      }
    }
  }

  function onTouchEnd() {
    lastTouchDistance.value = 0
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}

/**
 * Creates zoom control functions.
 * @param graphContainer - Graph container element ref.
 * @param panX - Pan X ref.
 * @param panY - Pan Y ref.
 * @param zoom - Zoom ref.
 * @param nodes - Nodes ref.
 * @returns Object with zoom control functions.
 */
export function createZoomControls(
  graphContainer: Ref<HTMLElement | null>,
  panX: Ref<number>,
  panY: Ref<number>,
  zoom: Ref<number>,
  nodes: Ref<{ x: number, y: number }[]>
) {
  function zoomCenter(delta: number) {
    const container = graphContainer.value
    const rect = container?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : 0
    const cy = rect ? rect.height / 2 : 0
    const result = applyZoomDelta(zoom.value, delta, cx, cy, panX.value, panY.value)
    panX.value = result.panX
    panY.value = result.panY
    zoom.value = result.zoom
  }

  function zoomIn() {
    zoomCenter(1.2)
  }

  function zoomOut() {
    zoomCenter(1 / 1.2)
  }

  function resetZoom() {
    zoom.value = 1
  }

  function centerGraph() {
    const container = graphContainer.value
    if (!container) return
    const rect = container.getBoundingClientRect()
    const result = calculateCenterTransform(nodes.value, rect.width, rect.height)
    if (result) {
      panX.value = result.panX
      panY.value = result.panY
    }
  }

  return { zoomIn, zoomOut, resetZoom, centerGraph }
}
