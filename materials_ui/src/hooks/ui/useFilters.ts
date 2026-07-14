import { useContext, useEffect, useState } from 'react';

import { FilterContext } from '../../context/FiltersContext';
import type { FilterItem, FilterKeys } from '../../context/FiltersContext/helpers/types';
import {
  getDefaultState,
  setFilter as setFilterState,
  setSort as setSortState,
} from '../../context/FiltersContext/helpers/utils';

export const useFilters = (filterSetName: FilterKeys, defaultState?: FilterItem) => {
  const { createFilterContext, filters, resetFilterContext, updateFilterContext } =
    useContext(FilterContext);
  const [shallowFilters, setShallowFilters] = useState<FilterItem>(
    () => filters[filterSetName] ?? getDefaultState(defaultState),
  );

  const setSort = (column: string | null) => {
    setShallowFilters((prev) => {
      const newSortDirection =
        !prev.sort?.direction || prev.sort?.direction === 'descending' ? 'ascending' : 'descending';

      const hasSortColumnChanged = prev.sort?.column !== column;

      const newSortState: FilterItem = {
        filters: filters[filterSetName]?.filters ?? {},
        // if someone clicks on a new sort column, we want to change to ascending no matter what
        sort: setSortState(column, hasSortColumnChanged ? 'ascending' : newSortDirection),
      };

      // we want to update context immediately for sorting
      updateFilterContext(filterSetName, newSortState);
      return newSortState;
    });
  };

  const setFilter = (filterGroup: string, name: string, value: boolean) => {
    setShallowFilters((prev) => ({
      ...prev,
      filters: setFilterState(prev.filters, filterGroup, name, value),
    }));
  };

  const setCheckboxFilter = (filterGroup: string, name: string, checked: boolean) => {
    setShallowFilters((prev) => ({
      ...prev,
      filters: setFilterState(prev.filters, filterGroup, name, checked),
    }));
  };

  const setSearch = (query: string) => {
    setShallowFilters((prev) => ({ ...prev, search: query }));
  };

  const saveFiltersToContext = () => {
    updateFilterContext(filterSetName, { ...shallowFilters });
  };

  const resetFilters = () => {
    setShallowFilters((prev) => ({ ...prev, filters: defaultState?.filters || {}, search: '' }));
    resetFilterContext(filterSetName);
  };

  useEffect(() => {
    if (!filters[filterSetName]) {
      createFilterContext(filterSetName, defaultState);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [filters]);

  return {
    shallowFilters,
    filters: filters[filterSetName],
    resetFilters,
    saveFiltersToContext,
    setFilter,
    setCheckboxFilter,
    setSearch,
    setSort,
  };
};
