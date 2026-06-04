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
  const checkInDocumentTrigger = useTrigger();
  useSwitchContentArea();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openParentIds, setOpenParentIds] = useState<string[]>([]);

  const [activeParentId, setActiveParentId] = useState('');
  const [newVersionParentId, setNewVersionParentId] = useState('');
  const [mode, setMode] = useState<TMode>('textRedact');

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [showBlockNavigationModal, setShowBlockNavigationModal] =
    useState(false);
  const [attemptedNavigationHref, setAttemptedNavigationHref] =
    useState<string>();
  const [pendingCloseParentId, setPendingCloseParentId] = useState<
    string | undefined
  >();
  const [documents, setDocuments] = useState<TDocument[] | null | undefined>();
  const documentsRef = useRef<TDocument[] | null | undefined>(undefined);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    const onBeforeUnload = async () => checkInDocumentTrigger.fire();

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const [showRedactionLogModal, setShowRedactionLogModal] = useState(false);
  const [lookups, setLookups] = useState<TLookupsResponse>();

  const { redactionLogAxios, axiosInstance } = useAxiosInstances();

  useEffect(() => {
    if (!caseId) return;
    const saved = safeGetOpenDocumentTabsFromLocalStorage(caseId);
    if (saved && saved.openParentIds.length > 0) {
      setOpenParentIds(saved.openParentIds);
      setActiveParentId(saved.activeParentId);
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    if (openParentIds.length === 0) {
      clearOpenDocumentTabsFromLocalStorage(caseId);
    } else {
      safeSetOpenDocumentTabsFromLocalStorage({
        caseId,
        openParentIds: openParentIds,
        activeParentId: activeParentId
      });
    }
  }, [caseId, openParentIds, activeParentId]);

  useEffect(() => {
    if (materialIdParam) {
      setActiveParentId(materialIdParam);
      setOpenParentIds((openedDocumentIds) =>
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

  const clearSearchContextForDoc = (docId: string) => {
    setSearchContextByDocId((prev) => {
      if (!(docId in prev)) return prev;
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  useEffect(() => {
    if (docTypeParam && documents && documents.length > 0) {
      const filteredDocs = documents.filter(
        (doc) =>
          doc.cmsDocType.documentType === docTypeParam &&
          !openParentIds.includes(doc.parentId)
      );

      if (filteredDocs.length) {
        const newActiveDocId = filteredDocs[0]?.parentId;
        if (newActiveDocId) setActiveParentId(newActiveDocId);
        setOpenParentIds((prev) => [
          ...prev,
          ...filteredDocs.map((doc) => doc.parentId)
        ]);
      }
    }
  }, [docTypeParam, documents]);

  const openDocuments =
    urn && caseId
      ? openParentIds
          .map((docId) => documents?.find((d) => d.parentId === docId))
          .filter((doc): doc is TDocument => doc !== undefined)
      : [];

  const tabItems = openDocuments.map((doc) => ({
    id: doc.parentId,
    label: doc.presentationTitle,
    childId: doc.childId,
    isDirty: (redactionsIndexedOnDocId[doc.parentId]?.length ?? 0) > 0,
    panel: {
      children: (
        <DocumentTabPanel
          key={doc.parentId}
          parentId={doc.parentId}
          childId={doc.childId}
          document={doc}
          urn={urn!}
          caseId={caseId!}
          mode={mode}
          onModeChange={setMode}
          onRedactionsChange={(redactions) => {
            setRedactionsIndexedOnDocId((prev) => ({
              ...prev,
              [doc.parentId]: redactions
            }));
          }}
          onModification={(document) => {
            setNewVersionParentId(document.parentId);
            reloadSidebarTrigger.fire();
          }}
          initRedactions={redactionsIndexedOnDocId[doc.parentId]}
          onViewInNewWindowClick={() => {
            if (!urn || !caseId) return;
            navigateToViewDocumentPageInNewTab({
              urn,
              caseId,
              materialId: doc.parentId
            });
          }}
          onRedactionLogClick={() => setShowRedactionLogModal(true)}
          searchContext={searchContextByDocId[doc.parentId]}
          onFocusedSearchIndexChange={(index) =>
            setFocusedSearchIndex(doc.parentId, index)
          }
          onBackToSearchResults={() => setSearchModalOpen(true)}
          checkInDocumentTriggerData={checkInDocumentTrigger.data}
        />
      )
    }
  }));

  const performCloseTab = (documentId: string | undefined) => {
    const document = documents?.find((x) => x.parentId === documentId);
    if (document && caseId && urn) {
      checkInDocumentFromAxiosInstance({
        axiosInstance,
        caseId,
        urn,
        parentId: document.parentId,
        childId: document.childId
      });
    }
    if (documentId && documentId === activeParentId) {
      const index = openParentIds.indexOf(documentId);
      const nextDocumentId =
        openParentIds[index + 1] ?? openParentIds[index - 1] ?? '';
      setActiveParentId(nextDocumentId);
    }
    setOpenParentIds((prev) => prev.filter((id) => id !== documentId));
    if (documentId) clearSearchContextForDoc(documentId);
  };

  const handleCloseTab = (documentId: string | undefined) => {
    if (documentId && (redactionsIndexedOnDocId[documentId]?.length ?? 0) > 0) {
      setPendingCloseParentId(documentId);
      return;
    }
    performCloseTab(documentId);
  };

  const activeTabId = activeParentId || openParentIds[0] || '';

  const activeDocument = openDocuments.find(
    (doc) => doc.parentId === activeTabId
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
            setActiveParentId(documentId);
            setShowBlockNavigationModal(false);
          }}
        />
      )}
      {pendingCloseParentId && (
        <CloseTabUnsavedRedactionsModal
          onReturnClick={() => setPendingCloseParentId(undefined)}
          onIgnoreClick={() => {
            performCloseTab(pendingCloseParentId);
            setPendingCloseParentId(undefined);
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
                  newVersionDocumentId={newVersionParentId}
                  openDocumentIds={openParentIds}
                  onSetDocumentOpenIds={setOpenParentIds}
                  onDocumentClick={setActiveParentId}
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
              activeTabId={activeParentId}
              handleTabSelection={setActiveParentId}
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
