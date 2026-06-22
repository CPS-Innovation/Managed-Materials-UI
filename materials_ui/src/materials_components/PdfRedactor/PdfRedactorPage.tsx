import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { Page } from 'react-pdf';
import { DocumentIcon } from './icons/DocumentIcon';
import { RotateIcon } from './icons/RotateIcon';
import {
  PdfTextHighlightOverlay,
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
  MIN_REDACTION_SIZE_PX,
  type TCoord,
  type TRedaction
} from './utils/coordUtils';
import { createId } from './utils/generalUtils';
import { getPdfCoordPairsOfHighlightedText } from './utils/highlightedTextUtils';
import { isRedactionEnabledMode, type TMode } from './utils/modeUtils';
import type { THighlightLayer } from './utils/searchHighlightUtils';
import { useTriggerListener, type TTriggerData } from './utils/useTriggger';

const isSelectableTextTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'SPAN' && !!el.closest('.react-pdf__Page__textContent');
};

const isAreaLargeEnoughToRedact = (
  corner1: TCoord,
  corner2: TCoord,
  scale: number
) => {
  const { width, height } = convertCoordPairToXywh({
    x1: corner1.x,
    y1: corner1.y,
    x2: corner2.x,
    y2: corner2.y
  });
  return (
    width * scale >= MIN_REDACTION_SIZE_PX &&
    height * scale >= MIN_REDACTION_SIZE_PX
  );
};

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
  highlightLayers?: THighlightLayer[];
}) => {
  const { pageNumber, scale, redactions } = p;
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [firstCorner, setFirstCorner] = useState<TCoord | null>(null);
  const [isAreaDragging, setIsAreaDragging] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const cancelAreaDrag = () => {
    setFirstCorner(null);
    setIsAreaDragging(false);
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'Escape') cancelAreaDrag();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  useEffect(() => cancelAreaDrag(), [p.mode]);
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
  useEffect(() => {
    return () => {
      if (requestAnimationFrameRef.current)
        cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, []);

  const finishAreaRedactionDrag = () => {
    if (!isAreaDragging) return;
    setIsAreaDragging(false);

    const pdfPageWrapperElm = pdfPageWrapperElmRef.current;
    if (
      firstCorner &&
      mousePos &&
      pdfPageWrapperElm &&
      isAreaLargeEnoughToRedact(firstCorner, mousePos, scale)
    ) {
      const newRedaction = createRedaction({
        coord1: firstCorner,
        coord2: mousePos,
        pageNumber: p.pageNumber,
        pageRect: pdfPageWrapperElm.getBoundingClientRect(),
        scale
      });
      p.onAddRedactions([newRedaction]);
      p.onPageRedactionsChange([
        ...(redactions ? redactions : []),
        newRedaction
      ]);
    }

    setFirstCorner(null);
    window.getSelection()?.removeAllRanges();
  };

  const startAreaRedactionDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isRedactionEnabledMode(p.mode)) return;
    if (isSelectableTextTarget(e.target)) return;

    const start = getPdfCoords({
      screenX: e.clientX,
      screenY: e.clientY,
      scale: p.scale,
      pdfPageRect: e.currentTarget.getBoundingClientRect()
    });
    if (!start) return;

    window.getSelection()?.removeAllRanges();
    setFirstCorner(start);
    setMousePos(start);
    setIsAreaDragging(true);
  };

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
            className={`react-pdf-page-wrapper${
              isAreaDragging ? ' area-dragging' : ''
            }`}
            onMouseUp={finishAreaRedactionDrag}
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
              onMouseDown={startAreaRedactionDrag}
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

              const widthScale = pageDimensions
                ? pageDimensions.width / box.pageWidth
                : 1;
              const heightScale = pageDimensions
                ? pageDimensions.height / box.pageHeight
                : 1;

              const handleRemoveRedaction = (fnProps: { boxId: string }) => {
                p.onRemoveRedactions([fnProps.boxId]);
                p.onPageRedactionsChange(
                  redactions?.filter((x) => x.id !== fnProps.boxId)
                );
              };

              return (
                <PositionedRedactionBox
                  key={i}
                  xLeft={xLeft * widthScale}
                  yBottom={yBottom * heightScale}
                  width={width * widthScale}
                  height={height * heightScale}
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
              p.highlightLayers?.map((layer, i) => (
                <PdfTextHighlightOverlay
                  key={i}
                  highlights={layer.highlights}
                  focusedId={layer.focusedId}
                  pageDimensions={pageDimensions}
                  scale={p.scale}
                />
              ))}
          </div>
        </span>
      </span>
    </div>
  );
};
