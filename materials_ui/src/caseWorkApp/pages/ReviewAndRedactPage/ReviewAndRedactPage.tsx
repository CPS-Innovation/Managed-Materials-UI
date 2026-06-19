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
import {
  isRedactionEnabledMode,
  TMode
} from '../../../materials_components/PdfRedactor/utils/modeUtils';
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

// An action that moves focus away from in-progress redaction work and so is
// held behind the unsaved-redactions warning until the user confirms.
// `parentId` is the document whose unsaved redactions the warning is about.
type PendingUnsavedAction =
  | { kind: 'closeTab'; parentId: string }
  | { kind: 'switchTab'; parentId: string; nextParentId: string }
  | { kind: 'stopRedacting'; parentId: string };

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

  const [redactionsIndexedOnParentId, setRedactionsIndexedOnParentId] =
    useState<{ [k: string]: TRedaction[] }>({});

  const [searchContextByParentId, setSearchContextByParentId] = useState<
    Record<string, DocSearchContext>
  >({});

  const reloadSidebarTrigger = useTrigger();
  const checkInDocumentTrigger = useTrigger();
  useSwitchContentArea();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openParentIds, setOpenParentIds] = useState<string[]>([]);

  const [activeParentId, setActiveParentId] = useState('');
  const [newVersionParentId, setNewVersionParentId] = useState('');

  const [modeByParentId, setModeByParentId] = useState<Record<string, TMode>>(
    {}
  );

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [showBlockNavigationModal, setShowBlockNavigationModal] =
    useState(false);
  const [attemptedNavigationHref, setAttemptedNavigationHref] =
    useState<string>();
  const [pendingUnsavedAction, setPendingUnsavedAction] =
    useState<PendingUnsavedAction>();
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
      setOpenParentIds((openParentIds) =>
        openParentIds.includes(`${materialIdParam}`)
          ? openParentIds
          : [...openParentIds, `${materialIdParam}`]
      );

      if (searchTermParam && searchMatchesParam) {
        const highlights = convertMatchesToSearchHighlights(searchMatchesParam);
        setSearchContextByParentId((prev) => ({
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

  const setFocusedSearchIndex = (parentId: string, index: number) => {
    setSearchContextByParentId((prev) => {
      const ctx = prev[parentId];
      if (!ctx) return prev;
      return { ...prev, [parentId]: { ...ctx, focusedIndex: index } };
    });
  };

  const clearSearchContextForDoc = (parentId: string) => {
    setSearchContextByParentId((prev) => {
      if (!(parentId in prev)) return prev;
      const next = { ...prev };
      delete next[parentId];
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
        const newActiveParentId = filteredDocs[0]?.parentId;
        if (newActiveParentId) setActiveParentId(newActiveParentId);
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
          .map((parentId) => documents?.find((d) => d.parentId === parentId))
          .filter((doc): doc is TDocument => doc !== undefined)
      : [];

  const tabItems = openDocuments.map((doc) => ({
    id: doc.parentId,
    label: doc.presentationTitle,
    childId: doc.childId,
    isDirty: (redactionsIndexedOnParentId[doc.parentId]?.length ?? 0) > 0,
    panel: {
      children: (
        <DocumentTabPanel
          key={doc.parentId}
          parentId={doc.parentId}
          childId={doc.childId}
          document={doc}
          urn={urn!}
          caseId={caseId!}
          mode={modeByParentId[doc.parentId] ?? 'disabled'}
          onModeChange={(newMode) => handleModeChange(doc.parentId, newMode)}
          onRedactionsChange={(redactions) => {
            setRedactionsIndexedOnParentId((prev) => ({
              ...prev,
              [doc.parentId]: redactions
            }));
          }}
          onModification={(document) => {
            setNewVersionParentId(document.parentId);
            reloadSidebarTrigger.fire();
          }}
          initRedactions={redactionsIndexedOnParentId[doc.parentId]}
          onViewInNewWindowClick={() => {
            if (!urn || !caseId) return;
            navigateToViewDocumentPageInNewTab({
              urn,
              caseId,
              materialId: doc.parentId
            });
          }}
          onRedactionLogClick={() => setShowRedactionLogModal(true)}
          searchContext={searchContextByParentId[doc.parentId]}
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

  const hasUnsavedRedactions = (parentId: string) =>
    (redactionsIndexedOnParentId[parentId]?.length ?? 0) > 0;

  const handleCloseTab = (documentId: string | undefined) => {
    if (documentId && hasUnsavedRedactions(documentId)) {
      setPendingUnsavedAction({ kind: 'closeTab', parentId: documentId });
      return;
    }
    performCloseTab(documentId);
  };

  const requestActiveTabChange = (nextParentId: string) => {
    if (
      nextParentId !== activeParentId &&
      hasUnsavedRedactions(activeParentId)
    ) {
      setPendingUnsavedAction({
        kind: 'switchTab',
        parentId: activeParentId,
        nextParentId
      });
      return;
    }
    setActiveParentId(nextParentId);
  };

  const handleModeChange = (parentId: string, newMode: TMode) => {
    const isStoppingRedaction =
      isRedactionEnabledMode(modeByParentId[parentId] ?? 'disabled') &&
      newMode === 'disabled';
    if (isStoppingRedaction && hasUnsavedRedactions(parentId)) {
      setPendingUnsavedAction({ kind: 'stopRedacting', parentId });
      return;
    }
    setModeByParentId((prev) => ({ ...prev, [parentId]: newMode }));
  };

  const proceedWithPendingAction = () => {
    if (!pendingUnsavedAction) return;
    const action = pendingUnsavedAction;
    setPendingUnsavedAction(undefined);
    switch (action.kind) {
      case 'closeTab':
        performCloseTab(action.parentId);
        break;
      case 'switchTab':
        setActiveParentId(action.nextParentId);
        break;
      case 'stopRedacting':
        setModeByParentId((prev) => ({
          ...prev,
          [action.parentId]: 'disabled'
        }));
        break;
    }
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
        const shouldBlock = Object.values(redactionsIndexedOnParentId).some(
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
          redactionsIndexedOnDocumentId={redactionsIndexedOnParentId}
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
      {pendingUnsavedAction && (
        <CloseTabUnsavedRedactionsModal
          redactions={
            redactionsIndexedOnParentId[pendingUnsavedAction.parentId]
          }
          onReturnClick={() => setPendingUnsavedAction(undefined)}
          onIgnoreClick={proceedWithPendingAction}
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
                  onDocumentClick={requestActiveTabChange}
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
              handleTabSelection={requestActiveTabChange}
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
