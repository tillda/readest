import type { FoliateView } from '@/types/view';

/**
 * Calculates what fraction of a Range is visible on the current screen.
 *
 * In paginated mode, a paragraph may span across page boundaries.
 * This function determines the visible fraction by comparing each line
 * rect's position against the content document's viewport dimensions.
 *
 * @returns The visible fraction (0–1), or `null` if the range is fully
 *          visible or detection is not applicable (scrolled mode, empty range).
 */
export function calculatePageSplitFraction(
  range: Range,
  renderer: FoliateView['renderer'],
): number | null {
  // Only applies to paginated mode; scrolled mode handles visibility via scrollToAnchor
  if (renderer.scrolled) return null;

  const rects = Array.from(range.getClientRects());
  if (rects.length === 0) return null;

  // Determine the viewport dimension from the content document
  const doc = range.startContainer.ownerDocument;
  const docEl = doc?.documentElement;
  if (!docEl) return null;

  const isVertical = renderer.sideProp === 'height';
  const viewportDim = isVertical ? docEl.clientHeight : docEl.clientWidth;

  let visibleSize = 0;
  let totalSize = 0;
  let hasNonVisible = false;

  for (const rect of rects) {
    const rectStart = isVertical ? rect.y : rect.x;
    const rectLen = isVertical ? rect.height : rect.width;
    const rectEnd = rectStart + rectLen;

    totalSize += rectLen;

    // Calculate how much of this rect overlaps [0, viewportDim]
    const visStart = Math.max(rectStart, 0);
    const visEnd = Math.min(rectEnd, viewportDim);
    const overlap = Math.max(0, visEnd - visStart);

    visibleSize += overlap;

    if (overlap < rectLen) {
      hasNonVisible = true;
    }
  }

  // If everything is visible, no page split — no timer needed
  if (!hasNonVisible || totalSize === 0) return null;

  return visibleSize / totalSize;
}
