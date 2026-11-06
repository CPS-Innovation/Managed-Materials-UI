import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DocumentKeywordSearch, LoadingSpinner, RenameDrawer, TwoCol } from '../../../components';
import { LayoutLoadedTemplate, LayoutLoadingTemplate } from '../../../components/Layout/Layout';
import { useAppRoute, useBanner, useCaseInfo } from '../../../hooks';
import { useSafeCase } from '../../../hooks/case/useCase';
import { navigateToViewDocumentPageInNewTab } from '../../../hooks/ui/navigateToViewDocumentPageInNewTab';
import { checkInDocumentFromAxiosInstance } from '../../../materials_components/CaseworkPdfRedactorWrapper/hooks/useDocumentCheckOutRequest';
import { DocumentSidebar } from '../../../materials_components/DocumentSelectAccordion/DocumentSidebar';
import {
  TDocument,
  useGetDocumentList,
} from '../../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { GovUkBanner } from '../../../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import {
  clearOpenDocumentTabsFromLocalStorage,
  safeGetOpenDocumentTabsFromLocalStorage,
  safeSetOpenDocumentTabsFromLocalStorage,
} from '../../../materials_components/DocumentSelectAccordion/utils/OpenDocumentTabsLocalStorageUtils';
import {
  DocSearchContext,
  DocumentTabPanel,
} from '../../../materials_components/DocumentTabPanel/DocumentTabPanel';
import { DocumentActionsDropdown } from '../../../materials_components/documenViewportArea/DocumentActionsDropdown';
import { TRedaction } from '../../../materials_components/PdfRedactor/utils/coordUtils';
import {
  isRedactionEnabledMode,
  TMode,
} from '../../../materials_components/PdfRedactor/utils/modeUtils';
import { convertMatchesToSearchHighlights } from '../../../materials_components/PdfRedactor/utils/searchHighlightUtils';
import { useTrigger } from '../../../materials_components/PdfRedactor/utils/useTriggger';
import { RedactionLogModal } from '../../../materials_components/RedactionLog/RedactionLogModal';
import type { SearchTermResultType } from '../../../schemas/documents';
import { trackAction, trackMetric } from '../../../telemetry/appInsights';
import { Tabs } from '../../components/tabs';
import { getLookups, useAxiosInstances } from '../../components/utils/getData';
import { useSwitchContentArea } from '../../hooks/useSwitchContentArea';
import { TLookupsResponse } from '../../types/redaction';
import { CloseTabUnsavedRedactionsModal } from './CloseTabUnsavedRedactionsModal';
import { UnsavedRedactionsModal } from './UnsavedRedactionsModal';

type PendingUnsavedAction =
  | { kind: 'closeTab'; materialId: string }
  | { kind: 'switchTab'; materialId: string; nextMaterialId: string }
  | { kind: 'stopRedacting'; materialId: string };

type UnsavedModal = { kind: 'blockNav'; href?: string } | { kind: 'closeAll' };

const useReviewAndRedactRoute = () => {
  const { caseId } = useAppRoute();

  return { caseId: caseId! };
};

export const ReviewAndRedactPage = () => {
  const { caseId } = useReviewAndRedactRoute();
  const { state: locationState } = useLocation();
  const { data: caseData } = useSafeCase({ caseId });
  const { caseInfo } = useCaseInfo({ caseId });

  const {
    docType: docTypeParam,
    materialId: materialIdParam,
    searchTerm: searchTermParam,
    searchMatches: searchMatchesParam,
  } = (locationState || {}) as {
    docType?: string;
    materialId?: string;
    searchTerm?: string;
    searchMatches?: SearchTermResultType['matches'];
  };

  const navigate = useNavigate();

  const documentList = useGetDocumentList({ populateOnMount: true, caseId });

  const [selectedDocumentForRename, setSelectedDocumentForRename] = useState<
    (TDocument & { materialId?: number }) | null
  >(null);

  const [redactionsIndexedOnMaterialId, setRedactionsIndexedOnMaterialId] = useState<{
    [k: string]: TRedaction[];
  }>({});

  const [searchContextByMaterialId, setSearchContextByMaterialId] = useState<
    Record<string, DocSearchContext>
  >({});

  const checkInDocumentTrigger = useTrigger();
  useSwitchContentArea();
  const banner = useBanner();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openMaterialIds, setOpenMaterialIds] = useState<string[]>([]);

  const [activeMaterialId, setActiveMaterialId] = useState('');
  const [newVersionMaterialId, setNewVersionMaterialId] = useState('');

  const [modeByMaterialId, setModeByMaterialId] = useState<Record<string, TMode>>({});
  const [numOfPagesByMaterialId, setNumOfPagesByMaterialId] = useState<Record<string, number>>({});

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [unsavedModal, setUnsavedModal] = useState<UnsavedModal | null>(null);
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<PendingUnsavedAction>();

  useEffect(() => {
    const onBeforeUnload = async () => checkInDocumentTrigger.fire();

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const [showRedactionLogModal, setShowRedactionLogModal] = useState(false);
  const [lookups, setLookups] = useState<TLookupsResponse>();

  const { redactionLogAxios, axiosInstance } = useAxiosInstances();

  useEffect(() => {
    const saved = safeGetOpenDocumentTabsFromLocalStorage(caseId);
    if (saved && saved.openMaterialIds.length > 0) {
      setOpenMaterialIds(saved.openMaterialIds);
      setActiveMaterialId(saved.activeMaterialId);
    }
  }, [caseId]);

  useEffect(() => {
    if (openMaterialIds.length === 0) {
      clearOpenDocumentTabsFromLocalStorage(caseId);
    } else {
      safeSetOpenDocumentTabsFromLocalStorage({
        caseId,
        openMaterialIds: openMaterialIds,
        activeMaterialId: activeMaterialId,
      });
    }
  }, [caseId, openMaterialIds, activeMaterialId]);

  useEffect(() => {
    if (materialIdParam) {
      setActiveMaterialId(materialIdParam);
      setOpenMaterialIds((openMaterialIds) =>
        openMaterialIds.includes(`${materialIdParam}`)
          ? openMaterialIds
          : [...openMaterialIds, `${materialIdParam}`],
      );

      if (searchTermParam && searchMatchesParam) {
        const highlights = convertMatchesToSearchHighlights(searchMatchesParam);
        setSearchContextByMaterialId((prev) => ({
          ...prev,
          [materialIdParam]: { searchTerm: searchTermParam, highlights, focusedIndex: 0 },
        }));
      }

      window.history.replaceState({}, '');
    }
  }, [materialIdParam, searchTermParam, searchMatchesParam]);

  const setFocusedSearchIndex = (materialId: string, index: number) => {
    setSearchContextByMaterialId((prev) => {
      const ctx = prev[materialId];
      if (!ctx) return prev;
      return { ...prev, [materialId]: { ...ctx, focusedIndex: index } };
    });
  };

  const clearSearchContextForDoc = (materialId: string) => {
    setSearchContextByMaterialId((prev) => {
      if (!(materialId in prev)) return prev;
      const next = { ...prev };
      delete next[materialId];
      return next;
    });
  };

  useEffect(() => {
    if (
      docTypeParam &&
      documentList.state.status === 'success' &&
      documentList.state.data.length > 0
    ) {
      const filteredDocs = documentList.state.data.filter(
        (doc) =>
          doc.cmsDocType?.documentType === docTypeParam && !openMaterialIds.includes(doc.parentId),
      );

      if (filteredDocs.length) {
        const newActiveParentId = filteredDocs[0]?.parentId;
        if (newActiveParentId) setActiveMaterialId(newActiveParentId);
        setOpenMaterialIds((prev) => [...prev, ...filteredDocs.map((doc) => doc.parentId)]);
      }
    }
  }, [docTypeParam, documentList.state]);

  const documentListState = documentList.state; // required for ts compiler to narrow
  const openDocuments =
    documentListState.status === 'success'
      ? openMaterialIds
          .map((parentId) => documentListState.data.find((d) => d.parentId === parentId))
          .filter((doc): doc is TDocument => doc !== undefined)
      : [];

  const filteredTabItems = openDocuments.filter((doc) => !!doc.documentId) as (TDocument & {
    documentId: number;
  })[];
  const tabItems = filteredTabItems.map((doc) => ({
    id: doc.parentId,
    label: doc.subject || '',
    documentId: doc.documentId,
    isDirty: (redactionsIndexedOnMaterialId[doc.parentId]?.length ?? 0) > 0,
    panel: {
      children: (
        <DocumentTabPanel
          key={doc.parentId}
          materialId={doc.parentId}
          documentId={doc.documentId}
          mode={modeByMaterialId[doc.parentId] ?? 'disabled'}
          onModeChange={(newMode) => handleModeChange(doc.parentId, newMode)}
          onRedactionsChange={(redactions) => {
            setRedactionsIndexedOnMaterialId((prev) => ({ ...prev, [doc.parentId]: redactions }));
          }}
          onModification={(document) => {
            setNewVersionMaterialId(document.parentId);
            documentList.load();
          }}
          initRedactions={redactionsIndexedOnMaterialId[doc.parentId]}
          onNumOfPagesChange={(numOfPages) =>
            setNumOfPagesByMaterialId((prev) => ({ ...prev, [doc.parentId]: numOfPages }))
          }
          searchContext={searchContextByMaterialId[doc.parentId]}
          onFocusedSearchIndexChange={(index) => setFocusedSearchIndex(doc.parentId, index)}
          onBackToSearchResults={() => setSearchModalOpen(true)}
          checkInDocumentTriggerData={checkInDocumentTrigger.data}
          document={doc}
          caseId={caseId}
        />
      ),
    },
  }));

  const performCloseTab = (documentId: string | undefined) => {
    if (documentListState.status !== 'success') return;

    const document = documentListState.data.find((x) => x.parentId === documentId);
    if (document && document.documentId) {
      checkInDocumentFromAxiosInstance({
        axiosInstance,
        caseId,
        materialId: document.parentId,
        documentId: document.documentId,
      });
    }
    if (documentId && documentId === activeMaterialId) {
      const index = openMaterialIds.indexOf(documentId);
      const nextDocumentId = openMaterialIds[index + 1] ?? openMaterialIds[index - 1] ?? '';
      setActiveMaterialId(nextDocumentId);
    }
    setOpenMaterialIds((prev) => prev.filter((id) => id !== documentId));
    if (documentId) clearSearchContextForDoc(documentId);
  };

  const hasUnsavedRedactions = (parentId: string) =>
    (redactionsIndexedOnMaterialId[parentId]?.length ?? 0) > 0;

  const closeAllTabs = () => {
    openDocuments.forEach((document) => {
      if (!document.documentId) return;
      checkInDocumentFromAxiosInstance({
        axiosInstance,
        caseId,
        materialId: document.parentId,
        documentId: document.documentId,
      });
    });

    setActiveMaterialId('');
    setOpenMaterialIds([]);
    setSearchContextByMaterialId({});
    setRedactionsIndexedOnMaterialId({});
    setNumOfPagesByMaterialId({});

    const sidebarFocusTarget =
      document.querySelector<HTMLElement>('#side-panel .govuk-accordion__section-button') ??
      document.querySelector<HTMLElement>('#side-panel');
    sidebarFocusTarget?.focus();
  };

  const handleCloseAll = () => {
    const hasAnyUnsaved = openMaterialIds.some(hasUnsavedRedactions);
    if (hasAnyUnsaved) {
      setUnsavedModal({ kind: 'closeAll' });
      return;
    }
    closeAllTabs();
  };

  const handleCloseTab = (documentId: string | undefined) => {
    if (documentId && hasUnsavedRedactions(documentId)) {
      setPendingUnsavedAction({ kind: 'closeTab', materialId: documentId });
      return;
    }
    performCloseTab(documentId);
  };

  const requestActiveTabChange = (nextParentId: string) => {
    if (nextParentId !== activeMaterialId && hasUnsavedRedactions(activeMaterialId)) {
      setPendingUnsavedAction({
        kind: 'switchTab',
        materialId: activeMaterialId,
        nextMaterialId: nextParentId,
      });
      return;
    }
    setActiveMaterialId(nextParentId);
  };

  const handleModeChange = (parentId: string, newMode: TMode) => {
    const isStoppingRedaction =
      isRedactionEnabledMode(modeByMaterialId[parentId] ?? 'disabled') && newMode === 'disabled';
    if (isStoppingRedaction && hasUnsavedRedactions(parentId)) {
      setPendingUnsavedAction({ kind: 'stopRedacting', materialId: parentId });
      return;
    }
    setModeByMaterialId((prev) => ({ ...prev, [parentId]: newMode }));
  };

  const proceedWithPendingAction = () => {
    if (!pendingUnsavedAction) return;
    const action = pendingUnsavedAction;
    setPendingUnsavedAction(undefined);
    switch (action.kind) {
      case 'closeTab':
        performCloseTab(action.materialId);
        break;
      case 'switchTab':
        setActiveMaterialId(action.nextMaterialId);
        break;
      case 'stopRedacting':
        setModeByMaterialId((prev) => ({ ...prev, [action.materialId]: 'disabled' }));
        break;
    }
  };

  const activeTabId = activeMaterialId || openMaterialIds[0] || '';

  useEffect(() => {
    if (!activeTabId) return;
    const start = Date.now();
    return () => trackMetric('TabViewTime', Date.now() - start);
  }, [activeTabId]);

  const activeDocument = openDocuments.find((doc) => doc.parentId === activeTabId);

  const openUnsavedRedactions: { [k: string]: TRedaction[] } = Object.fromEntries(
    openMaterialIds
      .filter(hasUnsavedRedactions)
      .map((parentId) => [parentId, redactionsIndexedOnMaterialId[parentId] ?? []]),
  );

  useEffect(() => {
    if (showRedactionLogModal) {
      getLookups({ axiosInstance: redactionLogAxios }).then((data) => {
        setLookups(data);
      });
    }
  }, [showRedactionLogModal]);

  useEffect(() => {
    if (caseInfo === null || (caseData && !caseData.success)) {
      console.error('Case not found', { caseInfo, caseData });
      banner.setBanner({ header: 'Case not found', type: 'error' });
    }
  }, [caseInfo, caseData]);

  if (caseInfo === undefined || caseData === undefined)
    return <LayoutLoadingTemplate title="Review and Redact" />;

  if (caseInfo === null || (caseData && !caseData.success)) return <></>;

  return (
    <LayoutLoadedTemplate
      title="Review and Redact"
      caseInfo={caseInfo}
      shouldBlockNavigationCheck={(tab) => {
        const shouldBlock = Object.values(redactionsIndexedOnMaterialId).some(
          (redacts) => redacts.length > 0,
        );
        if (!shouldBlock) return false;

        setUnsavedModal({ kind: 'blockNav', href: tab.href });
        return true;
      }}
    >
      <LoadingSpinner
        isLoading={documentListState.status === 'loading'}
        textContent="Loading documents"
      />
      {documentListState.status === 'error' && (
        <div>
          <GovUkBanner
            variant="error"
            headerTitle="Error"
            contentHeading="The materials could not be loaded"
            contentBody={
              <>
                <p className="govuk-body">
                  Please try again or <Link to="/case-search">search for another case</Link>
                </p>
                <p className="govuk-inset-text">
                  {[...new Set(documentListState.errorMessages)].map((x, j, arr) => {
                    const isLast = arr.length - 1 === j;
                    return (
                      <Fragment key={x}>
                        {x}
                        {!isLast && <br />}
                      </Fragment>
                    );
                  })}
                </p>
              </>
            }
          />
        </div>
      )}
      {unsavedModal && (
        <UnsavedRedactionsModal
          documents={documentListState.status === 'success' ? documentListState.data : []}
          redactionsIndexedOnDocumentId={
            unsavedModal.kind === 'closeAll' ? openUnsavedRedactions : redactionsIndexedOnMaterialId
          }
          onReturnClick={() => setUnsavedModal(null)}
          onIgnoreClick={() => {
            if (unsavedModal.kind === 'closeAll') closeAllTabs();
            else if (unsavedModal.href) navigate(unsavedModal.href);
            setUnsavedModal(null);
          }}
          onDocumentClick={(documentId) => {
            setActiveMaterialId(documentId);
            setUnsavedModal(null);
          }}
        />
      )}
      {pendingUnsavedAction && (
        <CloseTabUnsavedRedactionsModal
          redactions={redactionsIndexedOnMaterialId[pendingUnsavedAction.materialId]}
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
              documentList.load();
            }}
          />
        )}

        {showRedactionLogModal && (
          <RedactionLogModal
            isOpen={showRedactionLogModal}
            onClose={() => setShowRedactionLogModal(false)}
            lookups={lookups}
            activeDocument={activeDocument}
            mode="over-under"
            case={caseData.data}
          />
        )}

        <TwoCol
          sidebar={
            isSidebarVisible ? (
              <>
                {documentListState.status === 'success' && (
                  <DocumentKeywordSearch
                    modalOpen={searchModalOpen}
                    setModalOpen={setSearchModalOpen}
                  />
                )}
                <DocumentSidebar
                  caseId={caseId}
                  activeDocumentId={activeTabId}
                  newVersionDocumentId={newVersionMaterialId}
                  openDocumentIds={openMaterialIds}
                  onSetDocumentOpenIds={setOpenMaterialIds}
                  onDocumentClick={requestActiveTabChange}
                  documentListState={documentList.state}
                  onChangeSidebarModeView={(mode) => {
                    if (mode === 'accordion') documentList.load();
                  }}
                />
              </>
            ) : undefined
          }
        >
          {tabItems.length > 0 && (
            <Tabs
              items={tabItems}
              activeTabId={activeMaterialId}
              handleTabSelection={requestActiveTabChange}
              handleCloseTab={handleCloseTab}
              onCloseAllClick={handleCloseAll}
              noMargin
              onShowHideCategoriesClick={() => setIsSidebarVisible((v) => !v)}
              isShowCategories={isSidebarVisible}
              documentActions={
                <DocumentActionsDropdown
                  mode={modeByMaterialId[activeTabId] ?? 'disabled'}
                  onModeChange={(newMode) => handleModeChange(activeTabId, newMode)}
                  onRedactionLogClick={() => setShowRedactionLogModal(true)}
                  onViewInNewWindowClick={() => {
                    const documentId = activeDocument?.documentId;

                    trackAction('OpenedInNewWindow', { materialId: activeTabId, documentId });
                    if (!documentId) return;
                    navigateToViewDocumentPageInNewTab({
                      caseId,
                      materialId: activeTabId,
                      documentId,
                    });
                  }}
                  numOfDocumentPages={numOfPagesByMaterialId[activeTabId] ?? 0}
                />
              }
            />
          )}
        </TwoCol>
      </div>
    </LayoutLoadedTemplate>
  );
};
