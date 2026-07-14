import { FilterItem, SortBy } from '../context/FiltersContext/helpers/types';
import { isObjectEmpty } from './object';

export type ColumnSortFn<T> = (a: T, b: T, direction: SortBy) => number;

/**
 * Resolves the sort comparator for the current sort column.
 * Uses the column's custom sortFn if defined, otherwise falls back to defaultSortFn.
 */
export const getSortFn = <T>(
  columns: { key: string; sortFn?: ColumnSortFn<T> }[],
  sort: FilterItem['sort'],
  fallbackSortFn: (s: FilterItem['sort']) => (a: T, b: T) => number,
): ((a: T, b: T) => number) => {
  if (!sort?.column || !sort?.direction) {
    return fallbackSortFn(sort);
  }

  const column = columns.find((column) => column.key === sort.column);

  const columnSortFn = column?.sortFn;
  if (columnSortFn) {
    const direction = sort.direction;
    return (a, b) => columnSortFn(a, b, direction);
  }

  return fallbackSortFn(sort);
};

export const defaultSortFn = <T>(sort: FilterItem['sort']) => {
  return (a: T, b: T) => {
    // @ts-expect-error need to figure out dynamic typing here
    const comparatorA = (a[sort?.column] || '').toLowerCase();
    // @ts-expect-error need to figure out dynamic typing here
    const comparatorB = (b[sort?.column] || '').toLowerCase();

    if (comparatorA < comparatorB) return sort?.direction === 'ascending' ? -1 : 1;

    if (comparatorA > comparatorB) return sort?.direction === 'ascending' ? 1 : -1;

    return 0;
  };
};

export const defaultFilterFn = <T>(filters: FilterItem['filters'] = {}) => {
  return (item: T) => {
    if (isObjectEmpty(filters)) {
      return true;
    }

    for (const [filterName, filterValue] of Object.entries(filters)) {
      if (
        // @ts-expect-error dynamic object index causing TS error
        !filterValue.includes(item[filterName])
      ) {
        return false;
      }
    }

    return true;
  };
};

export const defaultSearchFn = <T>(fieldName: string, searchTerm?: string) => {
  return (item: T) => {
    if (!searchTerm) {
      return true;
    }

    // @ts-expect-error dynamic object index causing TS error
    return (item[fieldName] as string)?.toLowerCase().includes(searchTerm?.toLowerCase() || '');
  };
};
