import { useRef } from 'react';
import type { TPageSize } from '../PdfRedactorPage';

export const usePagePlaceholders = () => {
  const lastDrawnSizesRef = useRef<TPageSize[]>([]);
  const sizes = lastDrawnSizesRef.current;

  return {
    documentStyle:
      sizes.length > 0
        ? {
            height: sizes.reduce((total, size) => total + size.height, 0),
            minWidth: sizes.reduce((widest, size) => Math.max(widest, size.width), 0),
          }
        : undefined,
    getPageSize: (pageIndex: number): TPageSize | undefined => lastDrawnSizesRef.current[pageIndex],
    recordDrawnSize: (pageIndex: number, size: TPageSize) => {
      lastDrawnSizesRef.current[pageIndex] = size;
    },
    setPageCount: (pageCount: number) => {
      lastDrawnSizesRef.current = lastDrawnSizesRef.current.slice(0, pageCount);
    },
  };
};
