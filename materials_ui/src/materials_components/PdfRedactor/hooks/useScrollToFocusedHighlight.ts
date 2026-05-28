import { RefObject, useEffect } from 'react';
import type { TSearchHighlight } from '../utils/searchHighlightUtils';

export const useScrollToFocusedHighlight = (
  highlights: TSearchHighlight[] | undefined,
  focusedId: string | undefined,
  pageDimensions: { width: number; height: number } | null,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    if (!pageDimensions || !focusedId) return;
    const focusedIsOnThisPage = highlights?.some((hl) => hl.id === focusedId);
    if (!focusedIsOnThisPage) return;
    const elm = containerRef.current?.querySelector(
      `[data-text-highlight-id="${focusedId}"]`
    );
    elm?.scrollIntoView({
      behavior: 'instant',
      block: 'center',
      inline: 'center'
    });
  }, [focusedId, pageDimensions, highlights]);
};
