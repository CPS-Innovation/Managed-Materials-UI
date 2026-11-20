import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePagePlaceholders } from '../../materials_components/PdfRedactor/hooks/usePagePlaceholders';

describe('usePagePlaceholders', () => {
  it('has no placeholders before any page has drawn', () => {
    const { result } = renderHook(() => usePagePlaceholders());

    expect(result.current.documentStyle).toBeUndefined();
    expect(result.current.getPageSize(0)).toBeUndefined();
  });

  it('sizes the document placeholder to the total height and the widest page', () => {
    const { result, rerender } = renderHook(() => usePagePlaceholders());

    result.current.recordDrawnSize(0, { width: 600, height: 800.5 });
    result.current.recordDrawnSize(1, { width: 900, height: 600.25 });
    rerender();

    expect(result.current.documentStyle).toEqual({ height: 1400.75, minWidth: 900 });
  });

  it('sizes each page placeholder to the size it last drew at', () => {
    const { result } = renderHook(() => usePagePlaceholders());

    result.current.recordDrawnSize(0, { width: 600, height: 800 });
    result.current.recordDrawnSize(0, { width: 1200, height: 1600 });

    expect(result.current.getPageSize(0)).toEqual({ width: 1200, height: 1600 });
    expect(result.current.getPageSize(1)).toBeUndefined();
  });

  it('only counts the pages that have drawn', () => {
    const { result, rerender } = renderHook(() => usePagePlaceholders());

    result.current.recordDrawnSize(2, { width: 600, height: 800 });
    rerender();

    expect(result.current.documentStyle).toEqual({ height: 800, minWidth: 600 });
  });

  it('forgets pages that no longer exist', () => {
    const { result, rerender } = renderHook(() => usePagePlaceholders());

    result.current.recordDrawnSize(0, { width: 600, height: 800 });
    result.current.recordDrawnSize(1, { width: 900, height: 600 });
    result.current.setPageCount(1);
    rerender();

    expect(result.current.documentStyle).toEqual({ height: 800, minWidth: 600 });
    expect(result.current.getPageSize(1)).toBeUndefined();
  });
});
