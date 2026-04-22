import { useEffect, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import { DocumentIcon } from './icons/DocumentIcon';
import { RotateIcon } from './icons/RotateIcon';
import {
  PositionedRedactionBox,
  PositionPdfOverlayBox,
  RedactionBox
} from './PdfRedactorComponents';

import './PdfRedactorPage.scss';

import { DeleteIcon } from './icons/DeleteIcon';
import { GovUkButton } from './templates/GovUkButton';
import {
  convertCoordPairToXywh,
  createRedaction,
  getPdfCoords,
  type TCoord,
  type TRedaction
} from './utils/coordUtils';
import { createId } from './utils/generalUtils';
import { getPdfCoordPairsOfHighlightedText } from './utils/highlightedTextUtils';
import type { TMode } from './utils/modeUtils';
import type { TSearchHighlight } from './utils/searchHighlightUtils';
import { useTriggerListener, type TTriggerData } from './utils/useTriggger';

export const PdfRedactorRotationOverlay = (p: {
  pageRotation: number;
  onPageRotationChange: (x: number) => void;
  pageNumber: number;
  pagesAmount: number;
}) => {
  const [rotationOn, setRotationOn] = useState(p.pageRotation !== 0);
  if (!rotationOn)
    return (
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 500 }}>
        <GovUkButton
          variant="inverse"
          onClick={() => setRotationOn(true)}
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            border: 0,
            padding: 0,
            paddingRight: '8px',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              background: '#1d70b8',
              height: '25px',
              width: '25px',
              padding: '5px'
            }}
          >
            <RotateIcon color="white" />
          </span>
          <div>
            Rotate page {p.pageNumber} / {p.pagesAmount}
          </div>
        </GovUkButton>
      </div>
    );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: '#00000055',
        zIndex: 500
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#ffffff',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <GovUkButton
              variant="inverse"
              onClick={() => {
                const newVal = p.pageRotation - 90;
                p.onPageRotationChange(newVal < 0 ? 360 + newVal : newVal);
              }}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                border: 0,
                padding: 0,
                paddingRight: '8px',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  background: '#1d70b8',
                  height: '25px',
                  width: '25px',
                  padding: '5px'
                }}
              >
                <RotateIcon color="white" flip />
              </span>
              <div>rotate page left</div>
            </GovUkButton>
            <span style={{ height: '125px', width: '125px' }}>
              <DocumentIcon color="white" rotateDegrees={p.pageRotation} />
            </span>
            <GovUkButton
              variant="inverse"
              onClick={() => {
                const newVal = p.pageRotation + 90;
                p.onPageRotationChange(newVal >= 360 ? newVal - 360 : newVal);
              }}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                border: 0,
                padding: 0,
                paddingLeft: '8px',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <div>rotate page right</div>
              <span
                style={{
                  background: '#1d70b8',
                  height: '25px',
                  width: '25px',
                  padding: '5px'
                }}
              >
                <RotateIcon color="white" />
              </span>
            </GovUkButton>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>
              Rotate page {p.pageRotation}&deg;
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                p.onPageRotationChange(0);
                setRotationOn(false);
              }}
              className="govuk-link"
              style={{
                color: '#ffffff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                lineHeight: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export const PdfRedactorDeletionOverlay = (p: {
  pageIsDelete: boolean;
  onPageIsDeleteChange: (x: boolean) => void;
  pageNumber: number;
  pagesAmount: number;
  pageDeleteButtonDisabled: boolean;
}) => {
  const { pageDeleteButtonDisabled = false } = p;

  return (
    <>
      {!p.pageIsDelete && (
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 500 }}>
          {!pageDeleteButtonDisabled && (
            <GovUkButton
              variant="inverse"
              onClick={() => p.onPageIsDeleteChange(true)}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                border: 0,
                padding: 0,
                paddingRight: '8px',
                gap: '8px',
                alignItems: 'center'
              }}
              disabled={pageDeleteButtonDisabled}
            >
              <span
                style={{
                  background: pageDeleteButtonDisabled ? 'gray' : '#1d70b8',
                  height: '25px',
                  width: '25px',
                  padding: '5px'
                }}
              >
                <DeleteIcon color="white" />
              </span>
              <div
                style={{
                  textDecoration: pageDeleteButtonDisabled
                    ? 'line-through'
                    : 'none'
                }}
              >
                Delete page {p.pageNumber} / {p.pagesAmount}
              </div>
            </GovUkButton>
          )}
        </div>
      )}
      {p.pageIsDelete && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: '#00000055',
            zIndex: 500
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                color: '#ffffff',
                gap: '8px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px'
                }}
              >
                <span style={{ height: '125px', width: '125px' }}>
                  <DocumentIcon color="white" rotateDegrees={0} />
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                  Page selected for deletion
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ color: '#ffffff', textAlign: 'center' }}>
                  Click "save all deletions" to remove the page from the
                  document
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => p.onPageIsDeleteChange(false)}
                  className="govuk-link"
                  style={{
                    color: '#ffffff',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                    lineHeight: 'inherit',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export const PdfRedactorPage = (p: {
  onMouseMove: (p: { x: number; y: number } | null) => void;
  pageNumber: number;
  pagesAmount: number;
  scale: number;
  mode: TMode;
  redactHighlightedTextTriggerData: TTriggerData;
  onPageRedactionsChange: (p: TRedaction[]) => void;
  onAddRedactions: (p: TRedaction[]) => void;
  onRemoveRedactions: (p: TRedaction['id'][]) => void;
  redactions: TRedaction[];
  pageRotationDegrees: number;
  onPageRotationChange: (x: number) => void;
  pageIsDelete: boolean;
  onPageIsDeleteChange: (x: boolean) => void;
  pageDeleteButtonDisabled: boolean;
  searchHighlights?: TSearchHighlight[];
  focusedSearchHighlightId?: string;
}) => {
  const { pageNumber, scale, redactions } = p;
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [firstCorner, setFirstCorner] = useState<TCoord | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setFirstCorner(null);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  useEffect(() => setFirstCorner(null), [p.mode]);
  useEffect(() => p.onMouseMove(mousePos), [mousePos]);

  useTriggerListener({
    triggerData: p.redactHighlightedTextTriggerData,
    fn: () => {
      const pdfPageRect = pdfPageWrapperElmRef.current?.getBoundingClientRect();
      if (!pdfPageRect) return;

      const pageHeight = pdfPageRect.height / p.scale;
      const pageWidth = pdfPageRect.width / p.scale;

      const coordPairs = getPdfCoordPairsOfHighlightedText({
        pdfPageRect,
        scale
      });

      const newRedactions = coordPairs.map((coordPair) => {
        return {
          ...coordPair,
          id: createId(),
          pageNumber,
          pageHeight,
          pageWidth
        };
      });

      if (newRedactions.length === 0) return;

      p.onAddRedactions(newRedactions);
      p.onPageRedactionsChange([...redactions, ...newRedactions]);

      window.getSelection()?.removeAllRanges();
    }
  });

  const pdfPageWrapperElmRef = useRef<HTMLDivElement | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);

  // handles scrolling to focused search term
  useEffect(() => {
    if (!pageDimensions || !p.focusedSearchHighlightId) return;
    const focusedIsOnThisPage = p.searchHighlights?.some(
      (hl) => hl.id === p.focusedSearchHighlightId
    );
    if (!focusedIsOnThisPage) return;
    const elm = pdfPageWrapperElmRef.current?.querySelector(
      `[data-search-highlight-id="${p.focusedSearchHighlightId}"]`
    );
    elm?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }, [p.focusedSearchHighlightId, pageDimensions, p.searchHighlights]);
  useEffect(() => {
    return () => {
      if (requestAnimationFrameRef.current)
        cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, []);

  return (
    <div>
      <span
        style={{
          display: 'block',
          margin: 'auto',
          width: 'fit-content',
          padding: '10px 10px 0px 10px'
        }}
      >
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          {p.mode === 'rotation' && (
            <PdfRedactorRotationOverlay
              pageRotation={p.pageRotationDegrees}
              onPageRotationChange={p.onPageRotationChange}
              pageNumber={p.pageNumber}
              pagesAmount={p.pagesAmount}
            />
          )}
          {p.mode === 'deletion' && (
            <PdfRedactorDeletionOverlay
              pageIsDelete={p.pageIsDelete}
              onPageIsDeleteChange={p.onPageIsDeleteChange}
              pageNumber={p.pageNumber}
              pagesAmount={p.pagesAmount}
              pageDeleteButtonDisabled={p.pageDeleteButtonDisabled}
            />
          )}
          <div
            ref={pdfPageWrapperElmRef}
            style={{ position: 'relative' }}
            className="react-pdf-page-wrapper"
          >
            <Page
              pageNumber={p.pageNumber}
              onRenderSuccess={() => {
                const canvas = pdfPageWrapperElmRef.current?.querySelector(
                  '.react-pdf__Page__canvas'
                );
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                setPageDimensions({
                  width: rect.width / p.scale,
                  height: rect.height / p.scale
                });
              }}
              onMouseDown={() => {
                if (p.mode !== 'areaRedact') return;
                const pdfPageWrapperElm = pdfPageWrapperElmRef.current;

                if (!pdfPageWrapperElm) return;
                const pdfPageRect = pdfPageWrapperElm.getBoundingClientRect();

                if (firstCorner && mousePos) {
                  const newRedaction = createRedaction({
                    coord1: firstCorner,
                    coord2: mousePos,
                    pageNumber: p.pageNumber,
                    pageRect: pdfPageRect,
                    scale
                  });
                  p.onAddRedactions([newRedaction]);
                  p.onPageRedactionsChange([
                    ...(redactions ? redactions : []),
                    newRedaction
                  ]);
                }
                setFirstCorner(firstCorner ? null : mousePos);
              }}
              scale={p.scale}
              onMouseMove={(e) => {
                if (requestAnimationFrameRef.current) return;

                const target = e.currentTarget as HTMLDivElement;

                requestAnimationFrameRef.current = requestAnimationFrame(() => {
                  const rect = target.getBoundingClientRect();

                  const coord = getPdfCoords({
                    screenX: e.clientX,
                    screenY: e.clientY,
                    scale: p.scale,
                    pdfPageRect: rect
                  });
                  setMousePos(coord);

                  requestAnimationFrameRef.current = null;
                });
              }}
            />
            {firstCorner &&
              mousePos &&
              (() => {
                const { xLeft, yBottom, width, height } =
                  convertCoordPairToXywh({
                    x1: firstCorner.x,
                    y1: firstCorner.y,
                    x2: mousePos.x,
                    y2: mousePos.y
                  });

                return (
                  <PositionPdfOverlayBox
                    xLeft={xLeft}
                    yBottom={yBottom}
                    width={width}
                    height={height}
                    scale={p.scale}
                  >
                    <RedactionBox
                      background="#fce8974d"
                      border="1px dashed #333"
                      interactive={false}
                    />
                  </PositionPdfOverlayBox>
                );
              })()}

            {redactions?.map((box, i) => {
              const { xLeft, yBottom, width, height } =
                convertCoordPairToXywh(box);

              const handleRemoveRedaction = (fnProps: { boxId: string }) => {
                p.onRemoveRedactions([fnProps.boxId]);
                p.onPageRedactionsChange(
                  redactions?.filter((x) => x.id !== fnProps.boxId)
                );
              };

              return (
                <PositionedRedactionBox
                  key={i}
                  xLeft={xLeft}
                  yBottom={yBottom}
                  width={width}
                  height={height}
                  scale={p.scale}
                  onRedactionBoxEnterPress={() =>
                    handleRemoveRedaction({ boxId: box.id })
                  }
                  onRedactionTooltipClick={() =>
                    handleRemoveRedaction({ boxId: box.id })
                  }
                  interactive
                />
              );
            })}

            {pageDimensions &&
              p.searchHighlights?.map((hl) => {
                // convert from api units to redactor units
                const widthScale = pageDimensions.width / hl.pageWidth;
                const heightScale = pageDimensions.height / hl.pageHeight;
                const xLeft = hl.xLeft * widthScale;
                const width = (hl.xRight - hl.xLeft) * widthScale;
                const height = (hl.yBottom - hl.yTop) * heightScale;
                const yBottom =
                  pageDimensions.height - hl.yBottom * heightScale;
                const isFocused = hl.id === p.focusedSearchHighlightId;
                return (
                  <PositionPdfOverlayBox
                    key={hl.id}
                    xLeft={xLeft}
                    yBottom={yBottom}
                    width={width}
                    height={height}
                    scale={p.scale}
                  >
                    <div
                      data-search-highlight-id={hl.id}
                      style={{
                        height: '100%',
                        width: '100%',
                        background: isFocused
                          ? 'rgba(255, 221, 0, 0.4)'
                          : 'rgba(255, 0, 0, 0.3)',
                        border: isFocused
                          ? '3px dashed rgba(255, 221, 0, 0.4)'
                          : '3px dashed #ff4141',
                        boxSizing: 'border-box',
                        pointerEvents: 'none'
                      }}
                    />
                  </PositionPdfOverlayBox>
                );
              })}
          </div>
        </span>
      </span>
    </div>
  );
};
