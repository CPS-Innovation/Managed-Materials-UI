import { Fragment, ReactNode, useState } from 'react';
import { Checkbox, DocumentActions, LoadingSpinner } from '..';
import { FilterItem } from '../../context/FiltersContext/helpers/types';
import { useAutoReclassify, useCaseMaterial, useFilters } from '../../hooks';
import { CaseMaterialDataType, CaseMaterialsType } from '../../schemas';
import { useSelectedItemsStore } from '../../stores';
import { ColumnSortFn } from '../../utils/filtering';
import { SortDirection, SortDirectionIcon } from './SortDirectionIcon';
import './SortableTable.scss';

export type Column<T> = {
  key: string;
  heading: string | ReactNode;
  render?: (row: T) => ReactNode;
  isSortable?: boolean;
  sortFn?: ColumnSortFn<T>;
};

type SortableTableProps<T> = {
  data: CaseMaterialsType[];
  caption: string;
  filters?: FilterItem;
  columns: Column<T>[];
  expandableRow?: (row: T) => ReactNode;
  dataName: CaseMaterialDataType;
  checkboxes?: boolean;
  error: T;
  isCommunications?: boolean;
};

const SortableTable = <T,>({
  data,
  filters,
  columns,
  expandableRow,
  caption,
  dataName,
  checkboxes = true,
  error,
  isCommunications = false,
}: SortableTableProps<T>) => {
  const {
    items: selectedItems,
    addItems: addSelectedItems,
    removeItems: removeSelectedItems,
    clear: clearSelectedItems,
  } = useSelectedItemsStore();
  const { isPending: isAutoReclassifyPending } = useAutoReclassify();
  const { setSort } = useFilters(dataName);
  const { selectedMaterialId, selectMaterial, deselectMaterial } = useCaseMaterial();
  const [sortStatus, setSortStatus] = useState('');

  const materialType = isCommunications ? 'communications' : 'materials';

  const handleSort = (key: string, heading: string | ReactNode) => {
    const isSameColumn = filters?.sort?.column === key;
    const nextDirection: SortDirection =
      !isSameColumn || !filters?.sort?.direction || filters.sort.direction === 'descending'
        ? 'ascending'
        : 'descending';
    const headingText = typeof heading === 'string' ? heading : key;
    setSortStatus(`Sort by ${headingText} (${nextDirection})`);
    setSort(key);
  };

  const handleSelectItem = (material: CaseMaterialsType) => {
    const isSelected = selectedItems[materialType]?.some(
      (m) => m.materialId === material.materialId,
    );

    if (isSelected) {
      removeSelectedItems([material], materialType);
    } else {
      addSelectedItems([material], materialType);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      addSelectedItems(data, materialType);
    } else {
      clearSelectedItems(materialType);
    }
  };

  const handleActionsClick = (materialId: number | null) => {
    if (materialId) {
      selectMaterial(materialId);
    } else {
      deselectMaterial();
    }
  };

  return (
    <>
      <LoadingSpinner
        isLoading={isAutoReclassifyPending}
        textContent={`Reclassifying ${dataName}...`}
      />
      {!isAutoReclassifyPending && (
        <div className="table-container">
          <table className="govuk-table">
            <caption className="govuk-visually-hidden">
              {caption} (column headers with buttons are sortable).
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                {checkboxes && (
                  <th className="govuk-table__header">
                    <Checkbox
                      id="select-all"
                      aria-label="Select all case materials"
                      label="Select All"
                      labelVisuallyHidden={true}
                      onChange={handleSelectAll}
                      checked={
                        selectedItems[materialType]?.length === data.length && data?.length > 0
                      }
                    />
                  </th>
                )}
                {columns.length &&
                  columns.map(({ key, heading, isSortable }) => {
                    const sortDirection: SortDirection =
                      filters?.sort?.column === key && filters?.sort?.direction
                        ? filters.sort.direction
                        : 'none';

                    return (
                      <th
                        key={key}
                        scope="col"
                        className="govuk-table__header"
                        {...(isSortable ? { 'aria-sort': sortDirection } : {})}
                      >
                        {isSortable ? (
                          <button
                            type="button"
                            className="sortable-table-header-button"
                            onClick={() => handleSort(key, heading)}
                          >
                            {heading}
                            <SortDirectionIcon direction={sortDirection} />
                          </button>
                        ) : (
                          heading
                        )}
                      </th>
                    );
                  })}
                <th scope="col" className="govuk-table__header" style={{ width: '10%' }}></th>
              </tr>
            </thead>

            <tbody className="govuk-table__body">
              {data.length > 0 ? (
                data.map((row, index) => {
                  const isCurrentMaterial =
                    selectedMaterialId !== null && +selectedMaterialId === row.materialId;

                  return (
                    <Fragment key={index}>
                      <tr key={index} className="govuk-table__row">
                        {checkboxes && (
                          <td className="govuk-table__cell">
                            <Checkbox
                              id={`select-${row.subject}`}
                              label={`Select ${row.subject}`}
                              checked={selectedItems[materialType]?.some((m) => m.id === row.id)}
                              onChange={() => handleSelectItem(row)}
                              labelVisuallyHidden={true}
                            />
                          </td>
                        )}
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="govuk-table__cell"
                            style={{ fontVariantLigatures: 'none' }}
                          >
                            {/* @ts-expect-error generic type mismatch with CaseMaterialsType */}
                            {col.render ? col.render(row) : row[col.key]}
                          </td>
                        ))}
                        <td className="govuk-table__cell" style={{ textAlign: 'right' }}>
                          <DocumentActions
                            label={row.subject}
                            isOpen={isCurrentMaterial}
                            onDocumentOpen={() =>
                              handleActionsClick(isCurrentMaterial ? null : row.materialId)
                            }
                          />
                        </td>
                      </tr>

                      {expandableRow && isCurrentMaterial && (
                        <tr>
                          <td className="govuk-table__cell" colSpan={8}>
                            {expandableRow(row as any)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : error ? (
                <tr>
                  <td colSpan={8}>
                    <p className="govuk-body no-materials-message">
                      Unable to fetch {dataName} for this case
                    </p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8}>
                    <p className="govuk-body no-materials-message">
                      There are no {dataName} that match your selection for this case
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className="govuk-visually-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {sortStatus}
          </div>
        </div>
      )}
    </>
  );
};

export default SortableTable;
