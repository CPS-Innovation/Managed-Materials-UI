import {
  getPdfCoords,
  MIN_REDACTION_SIZE_PX,
  safeGetRangeAt,
  TRect,
  type TCoordPair
} from './coordUtils';

const mergeDomRects = (domRectList: DOMRect[]) => {
  const mergedDomRects: TRect[] = [];

  for (const rect of domRectList) {
    const match = mergedDomRects.find(
      (existing) =>
        // Vertically overlapping (same line)
        rect.top < existing.bottom &&
        rect.bottom > existing.top &&
        // Horizontally close enough to be on the same line segment
        rect.left <= existing.right + 5 &&
        rect.right >= existing.left - 5
    );

    if (match) {
      // edit the existing one
      match.left = Math.min(match.left, rect.left);
      match.right = Math.max(match.right, rect.right);
      match.top = Math.min(match.top, rect.top);
      match.bottom = Math.max(match.bottom, rect.bottom);
      match.width = match.right - match.left;
      match.height = match.bottom - match.top;
    } else {
      const newRect: TRect = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
      mergedDomRects.push(newRect);
    }
  }

  return mergedDomRects;
};

export const getPdfCoordPairsOfHighlightedText = (p: {
  pdfPageRect: DOMRect;
  scale: number;
}) => {
  const selection = window.getSelection();
  if (!selection) return [];

  const rangeResponse = safeGetRangeAt({ selection });
  if (!rangeResponse.success) return [];

  const range = rangeResponse.data;
  const rects = range.getClientRects();
  const mergedRects = mergeDomRects([...rects]);
  const coordPairs = mergedRects.map((rect) => {
    if (
      rect.width < MIN_REDACTION_SIZE_PX ||
      rect.height < MIN_REDACTION_SIZE_PX
    )
      return;

    const coord1 = getPdfCoords({
      screenX: rect.left,
      screenY: rect.bottom,
      scale: p.scale,
      pdfPageRect: p.pdfPageRect
    });
    const coord2 = getPdfCoords({
      screenX: rect.right,
      screenY: rect.top,
      scale: p.scale,
      pdfPageRect: p.pdfPageRect
    });

    if (!coord1 || !coord2) return;

    const newRedaction: TCoordPair = {
      x1: coord1.x,
      y1: coord1.y,
      x2: coord2.x,
      y2: coord2.y
    };
    return newRedaction;
  });

  return coordPairs.filter((x) => !!x);
};
