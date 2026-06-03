import { ChangeEvent } from 'react';
import { materialsCategoryList } from '../../constants/categoryList';
import { READ_STATUS } from '../../constants/readStatus';
import { useFeatureFlag, useFilters } from '../../hooks';
import Checkbox from '../Checkbox/Checkbox';
import { FilterForm } from './FilterForm';

export const MaterialsFilters = () => {
  const {
    filters,
    resetFilters,
    shallowFilters,
    setCheckboxFilter,
    setSearch,
    saveFiltersToContext
  } = useFilters('materials');
  const hasAccess = useFeatureFlag();

  const handleCheckboxChange = (
    filterGroup: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { checked, value } = event.target;

    setCheckboxFilter(filterGroup, value, checked);
  };

  const handleFiltersSubmit = () => {
    saveFiltersToContext();
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const categories = materialsCategoryList;
  const statusList = ['Used', 'Unused'];

  return (
    <FilterForm
      onSubmit={handleFiltersSubmit}
      onReset={resetFilters}
      onSearchChange={handleSearchChange}
      searchLabel="Search materials"
      defaultSearchValue={filters?.search || ''}
    >
      {hasAccess([2, 3, 4, 5]) && (
        <div className="govuk-form-group">
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h3 className="govuk-heading-s small-heading-spacing">
                  New material
                </h3>
              </legend>
              <Checkbox
                id="readStatus"
                label="Show only new material (unread)"
                checked={
                  shallowFilters?.filters?.readStatus?.includes(
                    READ_STATUS.UNREAD
                  ) || false
                }
                onChange={(event) => handleCheckboxChange('readStatus', event)}
                value={READ_STATUS.UNREAD}
              />
            </fieldset>
          </div>
        </div>
      )}

      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
            <h3 className="govuk-heading-s small-heading-spacing">Status</h3>
          </legend>
          {statusList.map((status) => (
            <Checkbox
              id={`status-${status}`}
              label={status}
              checked={
                shallowFilters?.filters?.status?.includes(status) || false
              }
              onChange={(event) => handleCheckboxChange('status', event)}
              value={status}
              key={status}
            />
          ))}
        </fieldset>
      </div>

      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
            <h3 className="govuk-heading-s small-heading-spacing">Category</h3>
          </legend>

          {categories.map((category) => (
            <Checkbox
              id={`category-${category}`}
              label={category}
              checked={
                shallowFilters?.filters?.category?.includes(category) || false
              }
              onChange={(event) => handleCheckboxChange('category', event)}
              value={category}
              key={category}
            />
          ))}
        </fieldset>
      </div>
    </FilterForm>
  );
};
