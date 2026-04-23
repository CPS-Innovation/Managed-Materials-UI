import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { getLookups, getPdfFiles, useAxiosInstances } from '../../caseWorkApp/components/utils/getData';
import { Banner } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { CaseworkPdfRedactorWrapper } from '../CaseworkPdfRedactorWrapper/CaseworkPdfRedactorWrapper';
import { TDocument } from '../DocumentSelectAccordion/getters/getDocumentList';
import { DocumentViewportArea } from '../documenViewportArea';
import { TRedactionType } from '../PdfRedactor/PdfRedactionTypeForm';
import { TRedaction } from '../PdfRedactor/utils/coordUtils';
import { TMode } from '../PdfRedactor/utils/modeUtils';
import type { TSearchHighlight } from '../PdfRedactor/utils/searchHighlightUtils';
import { RedactionLogModal } from '../RedactionLog/RedactionLogModal';
import { TLookupsResponse } from '../../caseWorkApp/types/redaction';

export type DocSearchContext = {
  searchTerm: string;
  highlights: TSearchHighlight[];
  focusedIndex: number;
};

type LoadStatus = 'loading' | 'error' | 'success';

type RedactionLogModalData = {
  mode: 'list' | 'over-under';
  redactions: TRedaction[];
  selectedRedactionTypes: TRedactionType[];
};

export type DocumentTabPanelProps = {
  documentId: string;
  versionId: number;
  document: TDocument;
  urn: string;
  caseId: number;
  mode: TMode;
  onModeChange: (mode: TMode) => void;
  onRedactionsChange: (redactions: TRedaction[]) => void;
  onModification: (x: TDocument) => void;
  onViewInNewWindowClick: () => void;
  initRedactions?: TRedaction[];
  onRedactionLogClick: () => void;
  searchContext?: DocSearchContext;
  onFocusedSearchIndexChange?: (index: number) => void;
  onBackToSearchResults?: () => void;
};

export const DocumentTabPanel = ({
  documentId,
  versionId,
  document,
  urn,
  caseId,
  mode,
  onModeChange,
  onRedactionsChange,
  onModification,
  initRedactions,
  onViewInNewWindowClick,
  onRedactionLogClick,
  searchContext,
  onFocusedSearchIndexChange,
  onBackToSearchResults
}: DocumentTabPanelProps) => {
  const { redactionLogAxios, axiosInstance } = useAxiosInstances();

  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [showRedactionLogModal, setShowRedactionLogModal] = useState(false);
  const [redactionSaveStatus, setRedactionSaveStatus] = useState<
    'saving' | 'saved'
  >();
  const [redactionLogModalData, setRedactionLogModalData] =
    useState<RedactionLogModalData>();
  const [lookups, setLookups] = useState<TLookupsResponse>();


  useEffect(() => {
    const loadPdf = async () => {
      setStatus('loading');

      try {
        const blob = await getPdfFiles({
          axiosInstance,
          urn,
          caseId,
          documentId,
          versionId
        });

        if (blob instanceof Blob) {
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setPdfFileUrl(url);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (e) {
        setStatusCode(
          axios.isAxiosError(e) ? (e.response?.status ?? null) : null
        );
        setStatus('error');
      }
    };

    loadPdf();

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [documentId, versionId, urn, caseId]);
  const [numOfDocumentPages, setNumOfDocumentPages] = useState(0);


  useEffect(() => {
    const loadLookups = async () => {
      const data = await getLookups({ axiosInstance: redactionLogAxios });
      if (data) {
        setLookups(data);
      }
    };
    loadLookups();
  }, []);


  return (
    <div>
      {showRedactionLogModal && redactionLogModalData && (
        <RedactionLogModal
          urn={urn}
          caseId={caseId}
          isOpen={showRedactionLogModal}
          onClose={() => {
            setShowRedactionLogModal(false);
            setRedactionSaveStatus(undefined);
          }}
          mode={redactionLogModalData.mode}
          redactions={redactionLogModalData.redactions}
          selectedRedactionTypes={redactionLogModalData.selectedRedactionTypes}
          activeDocument={document}
          lookups={lookups}
          redactionSaveStatus={redactionSaveStatus}
        />
      )}

      <LoadingSpinner
        isLoading={status === 'loading'}
        textContent="Loading document..."
      />

      {status === 'error' && (
        <div className="govuk-error-message">Failed to load Document</div>
      )}

      {status === 'error' && statusCode === 403 && (
        <Banner
          type="error"
          header="This document is password protected"
          content={
            'Ask the agency who supplied it to remove the password and resend the document.'
          }
        />
      )}

      {status === 'success' && pdfFileUrl && (
        <>
          <DocumentViewportArea
            documentName={document.presentationTitle}
            mode={mode}
            onModeChange={onModeChange}
            onViewInNewWindowButtonClick={onViewInNewWindowClick}
            onRedactionLogClick={onRedactionLogClick}
            numOfDocumentPages={numOfDocumentPages}
            searchMode={
              searchContext
                ? {
                    searchTerm: searchContext.searchTerm,
                    totalMatches: searchContext.highlights.length,
                    focusedIndex: searchContext.focusedIndex,
                    onPrev: () =>
                      onFocusedSearchIndexChange?.(
                        Math.max(0, searchContext.focusedIndex - 1)
                      ),
                    onNext: () =>
                      onFocusedSearchIndexChange?.(
                        Math.min(
                          searchContext.highlights.length - 1,
                          searchContext.focusedIndex + 1
                        )
                      ),
                    onBackToSearchResults: () => onBackToSearchResults?.()
                  }
                : undefined
            }
          />
          <CaseworkPdfRedactorWrapper
            fileUrl={pdfFileUrl}
            mode={mode}
            onModeChange={onModeChange}
            onModification={onModification}
            urn={urn}
            caseId={caseId}
            versionId={versionId}
            documentId={documentId}
            document={document}
            onRedactionsChange={onRedactionsChange}
            initRedactions={initRedactions ?? []}
            onShowRedactionLogModal={(data) => {
              setRedactionLogModalData(data);
              setShowRedactionLogModal(true);
            }}
            onRedactionSaveStatusChange={setRedactionSaveStatus}
            onNumOfPagesDocumentChange={(x) => setNumOfDocumentPages(x)}
            searchHighlights={searchContext?.highlights}
            focusedSearchIndex={searchContext?.focusedIndex}
          />
        </>
      )}
    </div>
  );
};
