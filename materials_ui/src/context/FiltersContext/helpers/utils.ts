import type { FilterItem, SortBy } from './types';

export const getDefaultState = (defaultFilters?: FilterItem): FilterItem => {
  return {
    filters: { ...(defaultFilters ? defaultFilters?.filters : {}) },
    search: '',
    sort: { ...(defaultFilters?.sort || { column: null, direction: null }) },
  };
};

// updates a FilterItem with new sort criteria
export const setSort = (column: string | null, direction: SortBy): FilterItem['sort'] => ({
  column,
  direction,
});

// updates a FilterItem with new filter criteria
export const setFilter = (
  currentFilters: FilterItem['filters'],
  fieldGroup: string,
  name: string,
  checked: boolean,
): FilterItem['filters'] => {
  // if this filter hasn't been checked, create it if checked
  if (!Object.prototype.hasOwnProperty.call(currentFilters, fieldGroup) && checked) {
    return { ...currentFilters, [fieldGroup]: [name] };
  }

  const newFilterValues = checked
    ? [...(currentFilters?.[fieldGroup] || []), name]
    : currentFilters?.[fieldGroup]?.filter((existingFilterName) => existingFilterName !== name) ||
      [];

  if (!newFilterValues?.length) {
    delete currentFilters?.[fieldGroup];

    return currentFilters;
  }

  return { ...currentFilters, [fieldGroup]: newFilterValues };
};
