import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from 'react-use-pagination';

type UsePagerOptions = { totalItems?: number; initialPage?: number; initialPageSize?: number };

export const usePager = (options?: UsePagerOptions) => {
  const usePaginationData = usePagination(options);
  const [queryParams, setQueryParams] = useSearchParams();
  const newQueryCommands: URLSearchParams = new URLSearchParams(queryParams);

  useEffect(() => {
    if (usePaginationData.currentPage === 0) {
      newQueryCommands.delete('page');
    } else {
      newQueryCommands.set('page', (usePaginationData.currentPage + 1 || '').toString());
    }
    setQueryParams(newQueryCommands);
  }, [usePaginationData.currentPage]);

  return usePaginationData;
};
