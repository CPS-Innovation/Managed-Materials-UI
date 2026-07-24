import { createContext, PropsWithChildren, useState } from 'react';

import type { FilterItem, FilterKeys, FiltersContextState } from './helpers/types';
import { getDefaultState } from './helpers/utils';

// DATA STRUCTURE
// {
//   materials: {
//     sort: { column: 'subject', direction: 'ascending' },
//     filters: { status: ['Unused', 'Used'] }
//   },
//   ...
// }

export type FiltersContext = {
  filters: FiltersContextState;
  createFilterContext: (filterSet: FilterKeys, defaultState?: FilterItem) => void;
  updateFilterContext: (filterSet: FilterKeys, newFilterSet: FilterItem) => void;
  resetFilterContext: (filterSet: FilterKeys) => void;
  resetAllFilters: () => void;
};

export const FilterContext = createContext<FiltersContext>({
  filters: { materials: {}, communications: {}, documents: {} },
  createFilterContext: () => null,
  updateFilterContext: () => null,
  resetFilterContext: () => null,
  resetAllFilters: () => null,
});

export const FilterProvider = ({ children }: PropsWithChildren) => {
  const [filters, setFilters] = useState<FiltersContextState>({});

  const createFilterContext = (filterSet: string, defaultState?: FilterItem) => {
    setFilters((prev) => ({ ...prev, [filterSet]: getDefaultState(defaultState) }));
  };

  const updateFilterContext = (filterSet: FilterKeys, newFilterSet: FilterItem) => {
    setFilters((prev) => ({
      ...prev,
      [filterSet]: {
        filters: { ...(newFilterSet.filters ?? {}) },
        search: newFilterSet.search ?? '',
        sort: newFilterSet.sort ?? prev[filterSet]?.sort,
      },
    }));
  };

  const resetFilterContext = (filterSet: FilterKeys) => {
    setFilters((prev) => ({
      ...prev,
      [filterSet]: { sort: prev[filterSet]?.sort, filters: {}, search: '' },
    }));
  };

  const resetAllFilters = () => setFilters({});

  return (
    <FilterContext.Provider
      value={{
        filters,
        resetAllFilters,
        createFilterContext,
        resetFilterContext,
        updateFilterContext,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
