import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DocumentKeywordSearch,
  Layout,
  LoadingSpinner,
  RenameDrawer,
  TwoCol
} from '../../../components';
import { useCaseInfoStore } from '../../../hooks';
import { navigateToViewDocumentPageInNewTab } from '../../../hooks/ui/navigateToViewDocumentPageInNewTab';
import { checkInDocumentFromAxiosInstance } from '../../../materials_components/CaseworkPdfRedactorWrapper/hooks/useDocumentCheckOutRequest';
import { DocumentSidebar } from '../../../materials_components/DocumentSelectAccordion/DocumentSidebar';
import { TDocument } from '../../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import {
  clearOpenDocumentTabsFromLocalStorage,
  safeGetOpenDocumentTabsFromLocalStorage,
  safeSetOpenDocumentTabsFromLocalStorage
} from '../../../materials_components/DocumentSelectAccordion/utils/OpenDocumentTabsLocalStorageUtils';
import {
  DocSearchContext,
  DocumentTabPanel
} from '../../../materials_components/DocumentTabPanel/DocumentTabPanel';
import { TRedaction } from '../../../materials_components/PdfRedactor/utils/coordUtils';
import { TMode } from '../../../materials_components/PdfRedactor/utils/modeUtils';
import { convertMatchesToSearchHighlights } from '../../../materials_components/PdfRedactor/utils/searchHighlightUtils';
import { useTrigger } from '../../../materials_components/PdfRedactor/utils/useTriggger';
import { RedactionLogModal } from '../../../materials_components/RedactionLog/RedactionLogModal';
import type { SearchTermResultType } from '../../../schemas/documents';
import { Tabs } from '../../components/tabs';
import { getLookups, useAxiosInstances } from '../../components/utils/getData';
import { useSwitchContentArea } from '../../hooks/useSwitchContentArea';
import { TLookupsResponse } from '../../types/redaction';
import { CloseTabUnsavedRedactionsModal } from './CloseTabUnsavedRedactionsModal';
import { UnsavedRedactionsModal } from './UnsavedRedactionsModal';

export const ReviewAndRedactPage = () => {
  const { state: locationState } = useLocation();
  const {
    docType: docTypeParam,
    materialId: materialIdParam,
    searchTerm: searchTermParam,
    searchMatches: searchMatchesParam
  } = (locationState || {}) as {
    docType?: string;
    materialId?: string;
    searchTerm?: string;
    searchMatches?: SearchTermResultType['matches'];
  };

  const navigate = useNavigate();

  const { caseInfo } = useCaseInfoStore();
  const { id: caseId, urn } = caseInfo || {};

  const [selectedDocumentForRename, setSelectedDocumentForRename] = useState<
    (TDocument & { materialId?: number }) | null
  >(null);

  const [redactionsIndexedOnDocId, setRedactionsIndexedOnDocId] = useState<{
    [k: string]: TRedaction[];
  }>({});

  const [searchContextByDocId, setSearchContextByDocId] = useState<
    Record<string, DocSearchContext>
  >({});

  const reloadSidebarTrigger = useTrigger();
  useSwitchContentArea();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openDocumentIds, setOpenDocumentIds] = useState<string[]>([]);

  const [activeDocumentId, setActiveDocumentId] = useState('');
  const [newVersionDocumentId, setNewVersionDocumentId] = useState('');
  const [mode, setMode] = useState<TMode>('textRedact');

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [showBlockNavigationModal, setShowBlockNavigationModal] =
    useState(false);
  const [attemptedNavigationHref, setAttemptedNavigationHref] =
    useState<string>();
  const [pendingCloseDocumentId, setPendingCloseDocumentId] = useState<
    string | undefined
  >();
  const [documents, setDocuments] = useState<TDocument[] | null | undefined>();
  const documentsRef = useRef<TDocument[] | null | undefined>(undefined);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    const onBeforeUnload = () => {
      documentsRef.current?.forEach((document) => {
        if (document && caseId && urn)
          checkInDocumentFromAxiosInstance({
            axiosInstance,
            caseId,
            urn,
            documentId: document.documentId,
            versionId: document.versionId
          });
      });
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const [showRedactionLogModal, setShowRedactionLogModal] = useState(false);
  const [lookups, setLookups] = useState<TLookupsResponse>();

  const { redactionLogAxios, axiosInstance } = useAxiosInstances();

  useEffect(() => {
    if (!caseId) return;
    const saved = safeGetOpenDocumentTabsFromLocalStorage(caseId);
    if (saved && saved.openDocumentIds.length > 0) {
      setOpenDocumentIds(saved.openDocumentIds);
      setActiveDocumentId(saved.activeDocumentId);
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    if (openDocumentIds.length === 0) {
      clearOpenDocumentTabsFromLocalStorage(caseId);
    } else {
      safeSetOpenDocumentTabsFromLocalStorage({
        caseId,
        openDocumentIds,
        activeDocumentId
      });
    }
  }, [caseId, openDocumentIds, activeDocumentId]);

  useEffect(() => {
    if (materialIdParam) {
      setActiveDocumentId(materialIdParam);
      setOpenDocumentIds((openedDocumentIds) =>
        openedDocumentIds.includes(`${materialIdParam}`)
          ? openedDocumentIds
          : [...openedDocumentIds, `${materialIdParam}`]
      );

      if (searchTermParam && searchMatchesParam) {
        const highlights = convertMatchesToSearchHighlights(searchMatchesParam);
        setSearchContextByDocId((prev) => ({
          ...prev,
          [materialIdParam]: {
            searchTerm: searchTermParam,
            highlights,
            focusedIndex: 0
          }
        }));
      }

      window.history.replaceState({}, '');
    }
  }, [materialIdParam, searchTermParam, searchMatchesParam]);

  const setFocusedSearchIndex = (docId: string, index: number) => {
    setSearchContextByDocId((prev) => {
      const ctx = prev[docId];
      if (!ctx) return prev;
      return { ...prev, [docId]: { ...ctx, focusedIndex: index } };
    });
  };

  useEffect(() => {
    if (docTypeParam && documents && documents.length > 0) {
      const filteredDocs = documents.filter(
        (doc) =>
          doc.cmsDocType.documentType === docTypeParam &&
          !openDocumentIds.includes(doc.documentId)
      );

      if (filteredDocs.length) {
        const newActiveDocId = filteredDocs[0]?.documentId;
        if (newActiveDocId) setActiveDocumentId(newActiveDocId);
        setOpenDocumentIds((prev) => [
          ...prev,
          ...filteredDocs.map((doc) => doc.documentId)
        ]);
      }
    }
  }, [docTypeParam, documents]);

  const openDocuments =
    urn && caseId
      ? openDocumentIds
          .map((docId) => documents?.find((d) => d.documentId === docId))
          .filter((doc): doc is TDocument => doc !== undefined)
      : [];

  const tabItems = openDocuments.map((doc) => ({
    id: doc.documentId,
    label: doc.presentationTitle,
    versionId: doc.versionId,
    isDirty: (redactionsIndexedOnDocId[doc.documentId]?.length ?? 0) > 0,
    panel: {
      children: (
        <DocumentTabPanel
          key={doc.documentId}
          documentId={doc.documentId}
          versionId={doc.versionId}
          document={doc}
          urn={urn!}
          caseId={caseId!}
          mode={mode}
          onModeChange={setMode}
          onRedactionsChange={(redactions) => {
            setRedactionsIndexedOnDocId((prev) => ({
              ...prev,
              [doc.documentId]: redactions
            }));
          }}
          onModification={(document) => {
            setNewVersionDocumentId(document.documentId);
            reloadSidebarTrigger.fire();
          }}
          initRedactions={redactionsIndexedOnDocId[doc.documentId]}
          onViewInNewWindowClick={() => {
            if (!urn || !caseId) return;
            navigateToViewDocumentPageInNewTab({
              urn,
              caseId,
              materialId: doc.documentId
            });
          }}
          onRedactionLogClick={() => setShowRedactionLogModal(true)}
          searchContext={searchContextByDocId[doc.documentId]}
          onFocusedSearchIndexChange={(index) =>
            setFocusedSearchIndex(doc.documentId, index)
          }
          onBackToSearchResults={() => setSearchModalOpen(true)}
        />
      )
    }
  }));

  const performCloseTab = (documentId: string | undefined) => {
    const document = documents?.find((x) => x.documentId === documentId);
    if (document && caseId && urn) {
      checkInDocumentFromAxiosInstance({
        axiosInstance,
        caseId,
        urn,
        documentId: document.documentId,
        versionId: document.versionId
      });
    }
    if (documentId && documentId === activeDocumentId) {
      const index = openDocumentIds.indexOf(documentId);
      const nextDocumentId =
        openDocumentIds[index + 1] ?? openDocumentIds[index - 1] ?? '';
      setActiveDocumentId(nextDocumentId);
    }
    setOpenDocumentIds((prev) => prev.filter((id) => id !== documentId));
  };

  const handleCloseTab = (documentId: string | undefined) => {
    if (documentId && (redactionsIndexedOnDocId[documentId]?.length ?? 0) > 0) {
      setPendingCloseDocumentId(documentId);
      return;
    }
    performCloseTab(documentId);
  };

  const activeTabId = activeDocumentId || openDocumentIds[0] || '';

  const activeDocument = openDocuments.find(
    (doc) => doc.documentId === activeTabId
  );

  useEffect(() => {
    if (showRedactionLogModal) {
      getLookups({ axiosInstance: redactionLogAxios }).then((data) => {
        setLookups(data);
      });
    }
  }, [showRedactionLogModal]);

  return (
    <Layout
      title="Review and Redact"
      shouldBlockNavigationCheck={(tab) => {
        const shouldBlock = Object.values(redactionsIndexedOnDocId).some(
          (redacts) => redacts.length > 0
        );
        if (!shouldBlock) return false;

        setShowBlockNavigationModal(true);
        setAttemptedNavigationHref(tab.href);
        return true;
      }}
    >
      <LoadingSpinner
        isLoading={documents === undefined}
        textContent="Loading documents"
      />
      {documents === null && <div>Error...</div>}
      {showBlockNavigationModal && (
        <UnsavedRedactionsModal
          redactionsIndexedOnDocumentId={redactionsIndexedOnDocId}
          onIgnoreClick={() => {
            if (attemptedNavigationHref) navigate(attemptedNavigationHref);
          }}
          onReturnClick={() => setShowBlockNavigationModal(false)}
          documents={documents ?? []}
          onDocumentClick={(documentId) => {
            setActiveDocumentId(documentId);
            setShowBlockNavigationModal(false);
          }}
        />
      )}
      {pendingCloseDocumentId && (
        <CloseTabUnsavedRedactionsModal
          onReturnClick={() => setPendingCloseDocumentId(undefined)}
          onIgnoreClick={() => {
            performCloseTab(pendingCloseDocumentId);
            setPendingCloseDocumentId(undefined);
          }}
        />
      )}
      <div className="govuk-main-wrapper">
        {selectedDocumentForRename && (
          <RenameDrawer
            material={selectedDocumentForRename}
            onCancel={() => setSelectedDocumentForRename(null)}
            onSuccess={() => {
              setSelectedDocumentForRename(null);
              reloadSidebarTrigger.fire();
            }}
          />
        )}

        {showRedactionLogModal && (
          <RedactionLogModal
            urn={urn!}
            caseId={caseId!}
            isOpen={showRedactionLogModal}
            onClose={() => setShowRedactionLogModal(false)}
            lookups={lookups}
            activeDocument={activeDocument}
            mode="over-under"
          />
        )}

        <TwoCol
          sidebar={
            isSidebarVisible && caseId && urn ? (
              <>
                {documents && (
                  <DocumentKeywordSearch
                    modalOpen={searchModalOpen}
                    setModalOpen={setSearchModalOpen}
                  />
                )}
                <DocumentSidebar
                  urn={urn}
                  caseId={caseId}
                  activeDocumentId={activeTabId}
                  newVersionDocumentId={newVersionDocumentId}
                  openDocumentIds={openDocumentIds}
                  onSetDocumentOpenIds={setOpenDocumentIds}
                  onDocumentClick={setActiveDocumentId}
                  reloadTriggerData={reloadSidebarTrigger.data}
                  onDocumentsChange={setDocuments}
                />
              </>
            ) : undefined
          }
        >
          {tabItems.length > 0 && (
            <Tabs
              items={tabItems}
              activeTabId={activeDocumentId}
              handleTabSelection={setActiveDocumentId}
              handleCloseTab={handleCloseTab}
              noMargin
              onShowHideCategoriesClick={() => setIsSidebarVisible((v) => !v)}
              isShowCategories={isSidebarVisible}
            />
          )}
        </TwoCol>
      </div>
    </Layout>
  );
};
