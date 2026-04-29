import { useState } from 'react';
import '../App.scss';
import {
  ButtonMenuComponent,
  CaseMaterialsTable,
  Layout,
  LoadingSpinner,
  MaterialsFilters,
  RenameDrawer,
  TableActions,
  TwoCol
} from '../components';

import {
  useAppRoute,
  useBanner,
  useCaseMaterial,
  useCaseMaterials,
  useTableActions
} from '../hooks';
import {
  useCaseInfoStore,
  useMaterialTags,
  useSelectedItemsStore
} from '../stores';

import { useNavigate } from 'react-router-dom';
import { URL } from '../constants/url';
import { navigateToViewDocumentPageInNewTab } from '../hooks/ui/navigateToViewDocumentPageInNewTab';
import { CaseMaterialsType } from '../schemas';

export const MaterialsPage = () => {
  const { getRoute } = useAppRoute();
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(true);
  const [selectedMaterial, setSelectedMaterial] =
    useState<CaseMaterialsType | null>(null);
  const { caseInfo } = useCaseInfoStore();

  const { mutate: refreshCaseMaterials, loading: caseMaterialsLoading } =
    useCaseMaterials({ dataType: 'materials' });
  const { setBanner, resetBanner } = useBanner();
  const { deselectMaterial } = useCaseMaterial();

  const { items: selectedItems, clear: clearSelectedItems } =
    useSelectedItemsStore();
  const { setTags } = useMaterialTags();

  const {
    handleReclassifyClick,
    handleReadStatusClick,
    handleRedactClick,
    handleUnusedClick,
    determineReadStatusLabel,
    handleEditClick,
    isReadStatusUpdating
  } = useTableActions({
    selectedItems: selectedItems.materials,
    refreshData: refreshCaseMaterials,
    setBanner,
    deselectItem: deselectMaterial,
    resetBanner
  });

  const handleRenameClick = () => {
    if (selectedItems.materials[0]) {
      setSelectedMaterial(selectedItems.materials[0]);
    }
  };

  const handleDiscardClick = () => {
    navigate(getRoute('DISCARD'), {
      state: {
        selectedMaterial: selectedItems.materials[0],
        returnTo: getRoute('MATERIALS')
      }
    });
  };

  const handleCancelRename = () => {
    setSelectedMaterial(null);
    clearSelectedItems();
  };

  const handleSuccessfulRename = async () => {
    setTags([
      { materialId: selectedMaterial?.materialId as number, tagName: 'Renamed' }
    ]);

    setSelectedMaterial(null);
    deselectMaterial();
    clearSelectedItems('materials');

    setBanner({
      type: 'success',
      header: 'Renaming successful',
      content: 'Material successfully renamed.'
    });

    await refreshCaseMaterials();
  };

  const row = selectedItems.materials?.[0];

  const handleViewInNewWindowClick = async () => {
    if (!selectedItems.materials) return;

    for (const item of selectedItems.materials) {
      const materialId = item.materialId;
      const urn = caseInfo?.urn;
      const caseId = caseInfo?.id;
      if (!urn || !caseId) return;
      navigateToViewDocumentPageInNewTab({ urn, caseId, materialId });
    }
  };

  const menuItems = [
    {
      label: 'Rename',
      onClick: handleRenameClick,
      hide: (() => {
        const rowDocId = row?.documentTypeId;
        if (!rowDocId) return false;

        return (
          [1031, 1059].includes(rowDocId) ||
          selectedItems.communications.length > 1
        );
      })()
    },
    {
      label: 'Reclassify',
      onClick: handleReclassifyClick,
      hide: selectedItems.materials?.length > 1 || !row?.isReclassifiable
    },
    {
      label: 'Update',
      onClick: () =>
        handleEditClick(row as CaseMaterialsType, getRoute('MATERIALS')),
      hide: (() => {
        const itemCommsCategory = selectedItems.communications[0]?.category;
        if (!itemCommsCategory) return;
        return (
          selectedItems.communications.length > 1 ||
          !['Exhibit', 'Statement'].includes(itemCommsCategory)
        );
      })()
    },
    {
      label: 'Redact',
      onClick: () => {
        if (row?.materialId) return handleRedactClick(row.materialId);
      },
      hide: selectedItems.materials?.length > 1
    },
    {
      label: 'Discard',
      onClick: handleDiscardClick,
      disabled: selectedItems.materials?.length > 1,
      hide: selectedItems.materials?.length > 1
    },
    {
      label: determineReadStatusLabel(selectedItems.materials),
      onClick: () => handleReadStatusClick(selectedItems.materials)
    },
    {
      label: 'Mark as unused',
      onClick: () => handleUnusedClick(selectedItems.materials, URL.MATERIALS),
      hide: selectedItems.materials?.some((item) => item.status === 'Unused')
    },
    { label: 'View in new window', onClick: handleViewInNewWindowClick }
  ];

  return (
    <Layout title="Case Materials">
      <div className="govuk-main-wrapper">
        <RenameDrawer
          material={selectedMaterial}
          onCancel={handleCancelRename}
          onSuccess={handleSuccessfulRename}
        />

        <TwoCol sidebar={showFilter ? <MaterialsFilters /> : undefined}>
          <LoadingSpinner
            isLoading={caseMaterialsLoading || isReadStatusUpdating}
            textContent="Loading materials"
          />
          {!(caseMaterialsLoading || isReadStatusUpdating) && (
            <>
              <TableActions
                showFilter={showFilter}
                onSetShowFilter={setShowFilter}
                menuItems={menuItems}
                selectedItems={selectedItems.materials}
              />

              <CaseMaterialsTable />

              <div className="action-on-selection-container">
                <ButtonMenuComponent
                  menuTitle="Action on selection"
                  menuItems={menuItems}
                  isDisabled={selectedItems.materials?.length === 0}
                />
              </div>
            </>
          )}
        </TwoCol>
      </div>
    </Layout>
  );
};
