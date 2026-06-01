import { useEffect } from 'react';
import type { TSearchHighlight } from '../utils/searchHighlightUtils';

export const useScrollToFocusedHighlight = (
  highlights: TSearchHighlight[],
  focusedId: string | undefined
) => {
  useEffect(() => {
    if (!focusedId) return;
    const focusedIsInThisLayer = highlights.some((hl) => hl.id === focusedId);
    if (!focusedIsInThisLayer) return;
    const elm = document.querySelector(
      `[data-text-highlight-id="${focusedId}"]`
    );
    elm?.scrollIntoView({
      behavior: 'instant',
      block: 'center',
      inline: 'center'
    });
  }, [focusedId, highlights]);
};
