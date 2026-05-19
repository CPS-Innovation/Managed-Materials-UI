import { ChangeEvent } from 'react';
import { useDocuments, useFilters } from '../../hooks';
import { categoriseDocument } from '../../materials_components/DocumentSelectAccordion/utils/categoriseDocument';
import {
  categoryDetails,
  initDocsOnDocCategoryNamesMap
} from '../../materials_components/DocumentSelectAccordion/utils/categoriseDocumentHelperUtils';
import Checkbox from '../Checkbox/Checkbox';
import { FilterForm } from './FilterForm';

type DocumentKeywordSearchFiltersProps = {
  onSearchSubmit?: (term: string) => void;
};

export const DocumentKeywordSearchFilters = ({
  onSearchSubmit
}: DocumentKeywordSearchFiltersProps) => {
  const {
    filters,
    resetFilters,
    shallowFilters,
    setCheckboxFilter,
    saveFiltersToContext,
    setSearch
  } = useFilters('documents');

  const { documents } = useDocuments();

  const handleCheckboxChange = (
    filterGroup: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { checked, value } = event.target;

    setCheckboxFilter(filterGroup, value, checked);
  };

  const handleFiltersSubmit = () => {
    saveFiltersToContext();
    if (onSearchSubmit && shallowFilters?.search?.trim()) {
      onSearchSubmit(shallowFilters.search.trim());
    }
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const docsOnDocCategoryNames = initDocsOnDocCategoryNamesMap();

  documents?.forEach((doc) => {
    const categoryName = categoriseDocument(doc);
    if (!categoryName) return;
    docsOnDocCategoryNames[categoryName].push(doc);
  });

  const categoriesList = categoryDetails.map((category) => ({
    key: category.categoryName,
    label: category.label,
    documents: docsOnDocCategoryNames[category.categoryName]
  }));

  //   const docsByDocType = (() => {
  //     const map: Record<string, number> = {};

  //     documents?.forEach((doc) => {
  //       const type = doc.cmsDocType.documentType;
  //       if (!type) return; // skip nulls
  //       map[type] = (map[type] ?? 0) + 1;
  //     });

  //     return map;
  //   })();

  return (
    <FilterForm
      onSubmit={handleFiltersSubmit}
      onReset={resetFilters}
      onSearchChange={handleSearchChange}
      searchLabel="Search materials"
      defaultSearchValue={filters?.search || ''}
    >
      <div className="govuk-form-group">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-bottom-1">
              <h3 className="govuk-heading-s small-heading-spacing">
                New materials
              </h3>
            </legend>
            <Checkbox
              id="readStatus"
              label="Show unread"
              checked={
                shallowFilters?.filters?.status?.includes('New') || false
              }
              onChange={(event) => handleCheckboxChange('status', event)}
              value={'New'}
            />
          </fieldset>
        </div>
      </div>

      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
            <h3 className="govuk-heading-s small-heading-spacing">Category</h3>
          </legend>

          {categoriesList.map((category) => (
            <Checkbox
              id={`category-${category.key}`}
              label={category.label}
              checked={
                shallowFilters?.filters?.category?.includes(category.key) ||
                false
              }
              onChange={(event) => handleCheckboxChange('category', event)}
              value={category.key}
              key={category.key}
            />
          ))}
        </fieldset>
      </div>
    </FilterForm>
  );
};
