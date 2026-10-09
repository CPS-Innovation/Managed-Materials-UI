import { useEffect, useState } from 'react';
import '../App.scss';
import {
  ButtonMenuComponent,
  CommsFilters,
  CommunicationsTable,
  LoadingSpinner,
  RenameDrawer,
  TableActions,
  TwoCol,
} from '../components';

import { useParams } from 'react-router-dom';
import {
  LayoutErrorTemplate,
  LayoutLoadedTemplate,
  LayoutLoadingTemplate,
} from '../components/Layout/Layout';
import {
  useAppRoute,
  useBanner,
  useCaseInfo,
  useCaseMaterial,
  useCaseMaterials,
  useTableActions,
} from '../hooks';
import { navigateToViewDocumentPageInNewTab } from '../hooks/ui/navigateToViewDocumentPageInNewTab';
import { CaseMaterialsType } from '../schemas';
import { useMaterialTags, useSelectedItemsStore } from '../stores';
import { trackAction } from '../telemetry/appInsights';

const useCommunicationsPageAppRoute = () => {
  const { caseId } = useParams();

  return { caseId: caseId! };
};

export const CommunicationsPage = () => {
  const { caseId } = useCommunicationsPageAppRoute();
  const { caseInfo } = useCaseInfo({ caseId });

  const [selectedMaterial, setSelectedMaterial] = useState<CaseMaterialsType | null>(null);
  const { setBanner, resetBanner } = useBanner();
  const { loading: caseMaterialsLoading, mutate: refreshCommunications } = useCaseMaterials({
    dataType: 'communications',
  });
  const { deselectMaterial } = useCaseMaterial();
  const { getRoute } = useAppRoute();
  const { setTags } = useMaterialTags();

  const [showFilter, setShowFilter] = useState(true);
  const { items: selectedItems, clear: clearSelectedItems } = useSelectedItemsStore();

  const {
    handleEditClick,
    handleReclassifyClick,
    handleRedactClick,
    handleDiscardClick,
    handleReadStatusClick,
    handleUnusedClick,
    determineReadStatusLabel,
    isReadStatusUpdating,
  } = useTableActions({
    selectedItems: selectedItems.communications,
    refreshData: refreshCommunications,
    setBanner,
    deselectItem: deselectMaterial,
    resetBanner,
  });

  const handleRenameClick = () => {
    if (selectedItems.communications[0]) {
      setSelectedMaterial(selectedItems.communications[0]);
    }
  };

  const handleCancelRename = () => {
    setSelectedMaterial(null);
    clearSelectedItems();
  };

  const handleSuccessfulRename = async () => {
    setTags([{ materialId: selectedMaterial?.materialId as number, tagName: 'Renamed' }]);

    setSelectedMaterial(null);
    deselectMaterial();
    clearSelectedItems('materials');

    setBanner({
      type: 'success',
      header: 'Renaming successful',
      content: 'Material successfully renamed.',
    });

    await refreshCommunications();
  };

  const row = selectedItems.communications?.[0];

  const handleViewInNewWindowClick = async () => {
    const materialId = row?.materialId;
    const caseId = caseInfo?.id;

    const documentId = row?.documentId;
    if (!materialId || !caseId) return;

    trackAction('OpenedInNewWindow', {
      materialId: row?.materialId?.toString(),
      category: row?.category,
    });
    navigateToViewDocumentPageInNewTab({ caseId, materialId, documentId });
  };

  const menuItems = [
    {
      label: 'Rename',
      onClick: handleRenameClick,
      hide: (() => {
        const rowDocId = row?.documentTypeId;
        if (!rowDocId) return false;

        return [1031, 1059].includes(rowDocId) || selectedItems.communications.length > 1;
      })(),
    },
    {
      label: 'Reclassify',
      onClick: handleReclassifyClick,
      hide: !row?.isReclassifiable || selectedItems.communications.length > 1,
    },
    {
      label: 'Update',
      onClick: () => handleEditClick(row as CaseMaterialsType, getRoute('COMMUNICATIONS')),
      hide: (() => {
        const itemCommsCategory = selectedItems.communications[0]?.category;
        if (!itemCommsCategory) return;
        return (
          selectedItems.communications.length > 1 ||
          !['Exhibit', 'Statement'].includes(itemCommsCategory)
        );
      })(),
    },
    {
      label: 'Redact',
      onClick: () => {
        if (row?.materialId) return handleRedactClick(row.materialId);
      },
      hide: selectedItems.communications.length > 1,
    },
    {
      label: 'Discard',
      onClick: () => handleDiscardClick(getRoute('COMMUNICATIONS')),
      hide: selectedItems.communications.length > 1,
    },
    {
      label: determineReadStatusLabel(selectedItems.communications),
      onClick: () => handleReadStatusClick(selectedItems.communications),
    },
    {
      label: 'Mark as unused',
      onClick: () => handleUnusedClick(selectedItems.communications, getRoute('COMMUNICATIONS')),
    },
    {
      label: 'View in new window',
      onClick: handleViewInNewWindowClick,
      hide: selectedItems.communications?.length !== 1,
    },
  ];

  useEffect(() => {
    if (isReadStatusUpdating || caseMaterialsLoading) {
      window.scrollTo(0, 0);
    }
  }, [caseMaterialsLoading, isReadStatusUpdating]);

  useEffect(() => {
    clearSelectedItems('communications');
  }, []);

  if (caseMaterialsLoading || caseInfo === undefined)
    return <LayoutLoadingTemplate title="Communications" />;

  if (caseInfo === null)
    return (
      <LayoutErrorTemplate bannerError={{ header: 'Error loading case info', type: 'error' }} />
    );

  return (
    <LayoutLoadedTemplate title="Communications" caseInfo={caseInfo}>
      <div className="govuk-main-wrapper">
        <RenameDrawer
          material={selectedMaterial}
          onCancel={handleCancelRename}
          onSuccess={handleSuccessfulRename}
        />

        <TwoCol sidebar={showFilter ? <CommsFilters /> : undefined}>
          <LoadingSpinner
            isLoading={caseMaterialsLoading || isReadStatusUpdating}
            textContent="Loading communications"
          />
          {!(caseMaterialsLoading || isReadStatusUpdating) && (
            <>
              <TableActions
                showFilter={showFilter}
                onSetShowFilter={setShowFilter}
                menuItems={menuItems}
                selectedItems={selectedItems.communications}
              />

              <CommunicationsTable />

              <div className="action-on-selection-container">
                <ButtonMenuComponent
                  menuTitle="Action on selection"
                  menuItems={menuItems}
                  isDisabled={selectedItems.communications?.length === 0}
                />
              </div>
            </>
          )}
        </TwoCol>
      </div>
    </LayoutLoadedTemplate>
  );
};
