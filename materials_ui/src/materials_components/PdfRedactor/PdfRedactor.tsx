import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { AreaIcon } from './icons/AreaIcon';
import { EditIcon } from './icons/EditIcon';
import { TickCircleIcon } from './icons/TickCircleIcon';
import { PdfRedactorCenteredModal } from './modals/PdfRedactorCenteredModal';
import { SaveToProceedToRedactionsModal } from './modals/SaveToProceedToRedactionsModal';
import { SaveToProceedToRotationsModal } from './modals/SaveToProceedToRotationsModal';
import { PdfRedactorPage } from './PdfRedactorPage';
import type { TRedaction } from './utils/coordUtils';
import { TDeletion, TIndexedDeletion } from './utils/deletionUtils';
import { type TMode } from './utils/modeUtils';
import styles from './utils/PdfRedactor.module.css';
import { TIndexedRotation, TRotation } from './utils/rotationUtils';
import type { TSearchHighlight } from './utils/searchHighlightUtils';
import { useTrigger } from './utils/useTriggger';
import '/node_modules/react-pdf/dist/cjs/Page/AnnotationLayer.css';
import '/node_modules/react-pdf/dist/cjs/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const modeClassMap: { [x in TMode]: string | undefined } = {
  areaRedact: styles.areaRedact,
  textRedact: styles.textRedact,
  rotation: styles.rotation,
  deletion: styles.deletion
};

const useScaleHelper = (p?: { initScale?: number }) => {
  const [scale, setScale] = useState(p?.initScale ?? 1);

  const increaseScale = () => setScale((prev) => (prev += 0.25));
  const decreaseScale = () =>
    setScale((prev) => {
      const newScale = prev - 0.25;
      return newScale <= 0 ? prev : newScale;
    });
  const resetScale = () => setScale(1);

  return { scale, setScale, increaseScale, decreaseScale, resetScale };
};

const indexRedactionsOnPageNumber = (redactions: TRedaction[]) => {
  const temp: { [k: number]: TRedaction[] } = {};
  redactions.forEach((redaction) => (temp[redaction.pageNumber] = []));
  redactions.forEach((redaction) =>
    temp[redaction.pageNumber]!.push(redaction)
  );
  return temp;
};

const PdfRedactorFooter = (p: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        border: '1px solid black',
        background: 'white',
        color: 'black',
        userSelect: 'none'
      }}
    >
      {p.children}
    </div>
  );
};

const RedactionsFooter = (p: {
  redactions: TRedaction[];
  onRemoveAllRedactionsClick: () => void;
  onSaveRedactionsClick: (x: TRedaction[]) => void;
  onShowRedactionLogModal?: (redactions: TRedaction[]) => void;
}) => {
  return (
    <PdfRedactorFooter>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px'
        }}
      >
        <button
          className="govuk-button govuk-button--inverse"
          onClick={() => p.onRemoveAllRedactionsClick()}
        >
          Remove all redactions
        </button>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>
            {p.redactions.length === 1 && <>There is 1 redaction</>}
            {p.redactions.length > 1 && (
              <>There are {p.redactions.length} redactions</>
            )}
          </span>
          <button
            className="govuk-button"
            onClick={() => {
              p.onSaveRedactionsClick(p.redactions);
              if (p.onShowRedactionLogModal) {
                p.onShowRedactionLogModal(p.redactions);
              }
            }}
          >
            Save all redactions
          </button>
        </span>
      </div>
    </PdfRedactorFooter>
  );
};

const RotationsFooter = (p: {
  rotations: TRotation[];
  onRemoveAllRotationsClick: () => void;
  onSaveRotationsClick: (x: TRotation[]) => void;
}) => {
  return (
    <PdfRedactorFooter>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px'
        }}
      >
        <button
          className="govuk-button govuk-button--inverse"
          onClick={() => p.onRemoveAllRotationsClick()}
        >
          Remove all rotations
        </button>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>
            {p.rotations.length === 1 && <>There is 1 rotation</>}
            {p.rotations.length > 1 && (
              <>There are {p.rotations.length} rotations</>
            )}
          </span>
          <button
            className="govuk-button"
            onClick={() => p.onSaveRotationsClick(p.rotations)}
          >
            Save all rotations
          </button>
        </span>
      </div>
    </PdfRedactorFooter>
  );
};

const DeletionsFooter = (p: {
  deletions: TDeletion[];
  onRemoveAllDeletionsClick: () => void;
  onSaveDeletionsClick: (x: TDeletion[]) => void;
}) => {
  return (
    <PdfRedactorFooter>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px'
        }}
      >
        <button
          className="govuk-button govuk-button--inverse"
          onClick={() => p.onRemoveAllDeletionsClick()}
        >
          Remove all deletions
        </button>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>
            {p.deletions.length === 1 && <>There is 1 deletion</>}
            {p.deletions.length > 1 && (
              <>There are {p.deletions.length} deletions</>
            )}
          </span>
          <button
            className="govuk-button"
            onClick={() => p.onSaveDeletionsClick(p.deletions)}
          >
            Save all deletions
          </button>
        </span>
      </div>
    </PdfRedactorFooter>
  );
};

const usePreviousModeRef = (value: TMode) => {
  const currentRef = useRef(value);
  const previousModeRef = useRef<TMode>(value);

  useEffect(() => {
    previousModeRef.current = currentRef.current;
    currentRef.current = value;
  }, [value]);

  return { previousModeRef };
};

export const PdfRedactor = (p: {
  fileUrl: string;
  redactions: TRedaction[];
  hideToolbar: boolean;
  mode: TMode;
  onModeChange: (x: TMode) => void;
  onRedactionsChange: (redactions: TRedaction[]) => void;
  onAddRedactions: (redactions: TRedaction[]) => void;
  onRemoveRedactions: (redactionIds: string[]) => void;
  onSaveRedactions: () => Promise<void>;
  onSaveDeletions: () => Promise<void>;
  onSaveRotations: () => Promise<void>;
  indexedRotation: TIndexedRotation;
  onRotationsChange: (x: TIndexedRotation) => void;
  onRotationAdd: (x: TRotation) => void;
  onRotationRemove: (x: TRotation) => void;
  indexedDeletion: TIndexedDeletion;
  onDeletionsChange: (x: TIndexedDeletion) => void;
  onDeletionAdd: (x: TDeletion) => void;
  onDeletionRemove: (x: TDeletion) => void;
  initRedactions: TRedaction[];
  onShowRedactionLogModal?: (redactions: TRedaction[]) => void;
  onNumOfDocPagesChanged: (x: number) => void;
  searchHighlights?: TSearchHighlight[];
  focusedSearchIndex?: number;
}) => {
  const { previousModeRef } = usePreviousModeRef(p.mode);

  // ref required for eventlistener
  const modeRef = useRef(p.mode);

  // Keep ref in sync with p.mode
  // - lift state up, but worsen developer experience???
  useEffect(() => {
    modeRef.current = p.mode;
  }, [p.mode]);

  const [displayToProceedModal, setDisplayToProceedModal] = useState<
    TMode | undefined
  >(undefined);

  const [numPages, setNumPages] = useState<number>();
  const scaleHelper = useScaleHelper();
  const pdfRedactorWrapperElmRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const indexedRedactions = useMemo(() => {
    return indexRedactionsOnPageNumber(p.redactions);
  }, [p.redactions]);

  const indexedSearchHighlights = useMemo(() => {
    const map: { [pageNumber: number]: TSearchHighlight[] } = {};
    (p.searchHighlights ?? []).forEach((highlight) => {
      if (!map[highlight.pageNumber]) map[highlight.pageNumber] = [];
      map[highlight.pageNumber]!.push(highlight);
    });
    return map;
  }, [p.searchHighlights]);

  const focusedHighlight =
    p.searchHighlights && p.focusedSearchIndex !== undefined
      ? p.searchHighlights[p.focusedSearchIndex]
      : undefined;
  const focusedHighlightId = focusedHighlight?.id;

  const rotations = useMemo(() => {
    return Object.values(p.indexedRotation);
  }, [p.indexedRotation]);
  const filteredRotations = useMemo(() => {
    return rotations.filter((rot) => rot.rotationDegrees !== 0);
  }, [rotations]);

  const deletions = useMemo(() => {
    return Object.values(p.indexedDeletion);
  }, [p.indexedDeletion]);
  const filteredDeletions = useMemo(() => {
    return deletions.filter((del) => !!del?.isDeleted);
  }, [deletions]);

  useEffect(() => {
    if (
      p.mode === 'rotation' &&
      (p.redactions.length > 0 || filteredDeletions.length > 0)
    ) {
      p.onModeChange(previousModeRef.current);
      setDisplayToProceedModal(previousModeRef.current);
    }
    if (
      (p.mode === 'textRedact' || p.mode === 'areaRedact') &&
      (filteredRotations.length > 0 || filteredDeletions.length > 0)
    ) {
      p.onModeChange(previousModeRef.current);
      setDisplayToProceedModal(previousModeRef.current);
    }
    if (
      p.mode === 'deletion' &&
      (filteredRotations.length > 0 || p.redactions.length > 0)
    ) {
      p.onModeChange(previousModeRef.current);
      setDisplayToProceedModal(previousModeRef.current);
    }
  }, [p.mode]);

  const autoScale = async (pdf: PDFDocumentProxy) => {
    const containerWidth = containerRef.current?.clientWidth;
    if (!containerWidth) return;

    let maxPageWidth = 0;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      maxPageWidth = Math.max(maxPageWidth, viewport.width);
    }

    if (maxPageWidth > 0) {
      const ratio = containerWidth / maxPageWidth;
      scaleHelper.setScale(ratio * 0.98);
    }
  };

  const redactHighlightedTextTrigger = useTrigger();
  const redactHighlightedIfTextRedactionMode = () => {
    if (modeRef.current === 'textRedact') redactHighlightedTextTrigger.fire();
  };

  useEffect(() => {
    const elm = pdfRedactorWrapperElmRef.current;
    if (!elm) return;

    elm.addEventListener('mouseup', redactHighlightedIfTextRedactionMode);
    return () =>
      elm.removeEventListener('mouseup', redactHighlightedIfTextRedactionMode);
  }, []);

  const pageDeleteButtonDisabled = (numPages ?? 0) - deletions.length <= 1;

  return (
    <div className={modeClassMap[p.mode]} ref={pdfRedactorWrapperElmRef}>
      {displayToProceedModal && (
        <PdfRedactorCenteredModal
          onBackgroundClick={() => setDisplayToProceedModal(undefined)}
          onEscPress={() => setDisplayToProceedModal(undefined)}
          ariaLabel="Save changes before proceeding"
        >
          {['areaRedact', 'textRedact'].includes(displayToProceedModal) && (
            <SaveToProceedToRedactionsModal
              onClose={() => setDisplayToProceedModal(undefined)}
            />
          )}
          {displayToProceedModal === 'rotation' && (
            <SaveToProceedToRotationsModal
              onClose={() => setDisplayToProceedModal(undefined)}
            />
          )}
          {displayToProceedModal === 'deletion' && (
            <SaveToProceedToRotationsModal
              onClose={() => setDisplayToProceedModal(undefined)}
            />
          )}
        </PdfRedactorCenteredModal>
      )}
      {!p.hideToolbar && (
        <div
          style={{
            border: '1px solid black',
            background: 'white',
            color: 'black',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px'
          }}
        >
          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span>
              <button
                className={`govuk-button ${
                  p.mode === 'areaRedact' ? '' : 'govuk-button--secondary'
                }`}
                onClick={() => p.onModeChange('areaRedact')}
                aria-label="Area redaction mode"
                aria-pressed={p.mode === 'areaRedact'}
              >
                <AreaIcon width={20} height={20} />
              </button>
              <button
                className={`govuk-button ${
                  p.mode === 'textRedact' ? '' : 'govuk-button--secondary'
                }`}
                onClick={() => p.onModeChange('textRedact')}
                aria-label="Text redaction mode"
                aria-pressed={p.mode === 'textRedact'}
              >
                <EditIcon width={20} height={20} />
              </button>
            </span>
            {p.mode === 'textRedact' && (
              <button
                className="govuk-button govuk-button--secondary"
                onClick={() => redactHighlightedTextTrigger.fire()}
                aria-label="Apply text redaction"
              >
                <TickCircleIcon width={20} height={20} />
              </button>
            )}
          </span>

          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span>x{scaleHelper.scale.toFixed(2)}</span>
            <button
              className="govuk-button govuk-button--secondary"
              onClick={() => scaleHelper.decreaseScale()}
              aria-label="Decrease zoom"
            >
              -
            </button>
            <button
              className="govuk-button govuk-button--secondary"
              onClick={() => scaleHelper.increaseScale()}
              aria-label="Increase zoom"
            >
              +
            </button>
            <button
              className="govuk-button govuk-button--secondary"
              onClick={() => scaleHelper.resetScale()}
              aria-label="Reset zoom"
            >
              x 1.00
            </button>
          </span>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            height: '80vh',
            width: '100%',
            overflowX: 'scroll',
            overflowY: 'scroll',
            backgroundColor: '#F3F2F1',
            paddingBottom: '70px',
            boxSizing: 'border-box',
            border: 'solid 1px black'
          }}
        >
          <Document
            file={p.fileUrl}
            onLoadSuccess={async (pdf) => {
              p.onRedactionsChange(p.initRedactions ?? []);
              setNumPages(pdf.numPages);
              p.onNumOfDocPagesChanged(pdf.numPages);
              await autoScale(pdf);
            }}
          >
            {[...Array(numPages)].map((_, j) => (
              <PdfRedactorPage
                pageDeleteButtonDisabled={pageDeleteButtonDisabled}
                key={`pdf-redactor-page-${j}`}
                pageNumber={j + 1}
                pagesAmount={numPages!}
                scale={scaleHelper.scale}
                onMouseMove={() => {}}
                redactHighlightedTextTriggerData={
                  redactHighlightedTextTrigger.data
                }
                mode={p.mode}
                onPageRedactionsChange={() => {}}
                onAddRedactions={(x) => {
                  p.onRedactionsChange([...p.redactions, ...x]);
                  p.onAddRedactions(x);
                }}
                onRemoveRedactions={(ids) => {
                  p.onRedactionsChange(
                    p.redactions.filter((red) => !ids.includes(red.id))
                  );
                  p.onRemoveRedactions(ids);
                }}
                redactions={indexedRedactions[j + 1] ?? []}
                pageRotationDegrees={(() => {
                  const rotation = p.indexedRotation[j + 1];
                  return rotation ? rotation.rotationDegrees : 0;
                })()}
                onPageRotationChange={(x) => {
                  p.onRotationsChange({
                    ...p.indexedRotation,
                    [j + 1]: {
                      id: crypto.randomUUID(),
                      pageNumber: j + 1,
                      rotationDegrees: x
                    }
                  });
                }}
                searchHighlights={indexedSearchHighlights[j + 1] ?? []}
                focusedSearchHighlightId={focusedHighlightId}
                pageIsDelete={!!p.indexedDeletion[j + 1]?.isDeleted}
                onPageIsDeleteChange={(isDeleted) => {
                  const deletion = {
                    id: crypto.randomUUID(),
                    pageNumber: j + 1,
                    isDeleted
                  };
                  const fn = isDeleted ? p.onDeletionAdd : p.onDeletionRemove;
                  fn(deletion);
                  p.onDeletionsChange({
                    ...p.indexedDeletion,
                    [j + 1]: deletion
                  });
                }}
              />
            ))}
          </Document>
        </div>
        {p.redactions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '25px',
              left: 0,
              right: 0,
              zIndex: 800
            }}
          >
            <RedactionsFooter
              redactions={p.redactions}
              onRemoveAllRedactionsClick={() => p.onRedactionsChange([])}
              onSaveRedactionsClick={async () => {
                await p.onSaveRedactions();
                p.onRedactionsChange([]);
              }}
              onShowRedactionLogModal={p.onShowRedactionLogModal}
            />
          </div>
        )}
        {filteredRotations.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '25px',
              left: 0,
              right: 0,
              zIndex: 800
            }}
          >
            <RotationsFooter
              rotations={filteredRotations}
              onRemoveAllRotationsClick={() => p.onRotationsChange({})}
              onSaveRotationsClick={async () => {
                await p.onSaveRotations();
                p.onRotationsChange({});
              }}
            />
          </div>
        )}
        {filteredDeletions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '25px',
              left: 0,
              right: 0,
              zIndex: 800
            }}
          >
            <DeletionsFooter
              deletions={filteredDeletions}
              onRemoveAllDeletionsClick={() => p.onDeletionsChange({})}
              onSaveDeletionsClick={async () => {
                await p.onSaveDeletions();
                p.onDeletionsChange({});
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
