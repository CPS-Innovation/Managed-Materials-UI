export type TCoord = { x: number; y: number };
export type TCoordPair = { x1: number; y1: number; x2: number; y2: number };
export type TRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
export type TXywhPair = {
  xLeft: number;
  yBottom: number;
  width: number;
  height: number;
};
export type TRedaction = TCoordPair & {
  id: string;
  pageNumber: number;
  pageHeight: number;
  pageWidth: number;
};

export const MIN_REDACTION_SIZE_PX = 3;

export const convertCoordPairToXywh = (p: TCoordPair): TXywhPair => {
  const xLeft = Math.min(p.x1, p.x2);
  const xRight = Math.max(p.x1, p.x2);
  const yBottom = Math.min(p.y1, p.y2);
  const yTop = Math.max(p.y1, p.y2);

  const width = xRight - xLeft;
  const height = yTop - yBottom;

  return { xLeft, yBottom, width, height };
};

export const getPdfCoords = (p: {
  screenX: number;
  screenY: number;
  scale: number;
  pdfPageRect: DOMRect;
}) => {
  const targetLeft = p.pdfPageRect.left;
  const targetTop = p.pdfPageRect.top;
  const targetBottom = p.pdfPageRect.bottom;
  const targetHeight = targetBottom - targetTop;

  const targetX = p.screenX - targetLeft;
  const targetY = p.screenY - targetTop;

  const x = targetX / p.scale;
  const y = (targetHeight - targetY) / p.scale; // required for bottom-left origin

  const pdfPageHeight = p.pdfPageRect.height / p.scale;
  const pdfPageWidth = p.pdfPageRect.width / p.scale;

  if (y > pdfPageHeight || x > pdfPageWidth || y < 0 || x < 0) return null;

  return { x, y };
};

export const safeGetRangeAt = (p: { selection: Selection }) => {
  try {
    const range = p.selection.getRangeAt(0);
    return { success: true, data: range } as const;
  } catch (_error) {
    return { success: false } as const;
  }
};

export const createRedaction = (p: {
  coord1: TCoord;
  coord2: TCoord;
  pageNumber: number;
  pageRect: DOMRect;
  scale: number;
}): TRedaction => ({
  id: crypto.randomUUID(),
  x1: p.coord1.x,
  y1: p.coord1.y,
  x2: p.coord2.x,
  y2: p.coord2.y,
  pageNumber: p.pageNumber,
  pageHeight: p.pageRect.height / p.scale,
  pageWidth: p.pageRect.width / p.scale
});
