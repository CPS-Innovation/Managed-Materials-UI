import { ChangeEvent } from 'react';
import {
  communicationsCategoryList,
  communicationsWithList,
  typeList
} from '../../constants/categoryList';
import { READ_STATUS } from '../../constants/readStatus';
import { useFeatureFlag, useFilters } from '../../hooks';
import Checkbox from '../Checkbox/Checkbox';
import { FilterForm } from './FilterForm';

export const CommsFilters = () => {
  const {
    filters,
    resetFilters,
    shallowFilters,
    setCheckboxFilter,
    setSearch,
    saveFiltersToContext
  } = useFilters('communications');
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

  const formGroups = [
    {
      heading: 'In/Out',
      data: ['Incoming', 'Outgoing'],
      filterGroup: 'direction'
    },
    {
      heading: 'Comms type',
      data: communicationsCategoryList,
      filterGroup: 'method'
    },
    {
      heading: 'Comms with',
      data: communicationsWithList,
      filterGroup: 'party'
    },
    { heading: 'Type', data: typeList, filterGroup: 'type' }
  ];

  return (
    <FilterForm
      onSubmit={handleFiltersSubmit}
      onReset={resetFilters}
      onSearchChange={handleSearchChange}
      searchLabel="Search communications"
      defaultSearchValue={filters?.search || ''}
    >
      {hasAccess([1, 2, 3, 4, 5]) && (
        <div className="govuk-form-group">
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h3 className="govuk-heading-s small-heading-spacing">
                  New communication
                </h3>
              </legend>
              <Checkbox
                id="readStatus"
                label="Show only new communications (unread)"
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

      {formGroups.map(({ heading, data, filterGroup }, index) => (
        <div className="govuk-form-group" key={index}>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
              <h3 className="govuk-heading-s small-heading-spacing">
                {heading}
              </h3>
            </legend>
            {data.map((value) => (
              <Checkbox
                id={`${filterGroup}-${value}`}
                label={value}
                checked={
                  shallowFilters?.filters?.[filterGroup]?.includes(value) ||
                  false
                }
                onChange={(event) =>
                  handleCheckboxChange(`${filterGroup}`, event)
                }
                value={value}
                key={value}
              />
            ))}
          </fieldset>
        </div>
      ))}
    </FilterForm>
  );
};
