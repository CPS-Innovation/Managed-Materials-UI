import { RefObject, useEffect, useRef } from 'react';
import {
  getOrderedTextSpans,
  getWordStartingIndices
} from './useDocumentFocusHelpers';

export const useDocumentFocus = (p: {
  containerRef: RefObject<HTMLElement | null>;
}) => {
  const activeSpanIndex = useRef(-1);
  const wordStartOffset = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isForward =
        e.ctrlKey && !e.shiftKey && !e.altKey && e.code === 'Comma';
      const isBackward = e.ctrlKey && e.key === 'Shift' && !e.altKey;
      if (!isForward && !isBackward) return;

      const container = p.containerRef.current;
      if (!container) return;

      if (window.getComputedStyle(container).visibility === 'hidden') return;

      e.preventDefault();

      const textLayers = container.querySelectorAll('.textLayer');
      if (!textLayers.length) return;

      const spans = Array.from(textLayers).flatMap((tl) =>
        getOrderedTextSpans(tl.children)
      );
      if (!spans.length) return;

      const direction: 'forward' | 'backward' = isBackward
        ? 'backward'
        : 'forward';

      const advancedWithinSpan = tryAdvanceWordWithinSpan(
        spans,
        activeSpanIndex,
        wordStartOffset,
        direction
      );

      if (!advancedWithinSpan) {
        moveToNextSpan(spans, activeSpanIndex, direction);
      }

      const targetSpan = spans[activeSpanIndex.current];
      if (!targetSpan?.firstChild) return;

      (targetSpan as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      const range = document.createRange();
      const textNode = targetSpan.firstChild;
      const textLength = textNode.textContent?.length ?? 0;
      const start = Math.min(
        wordStartOffset.current,
        Math.max(0, textLength - 1)
      );
      range.setStart(textNode, start);
      range.setEnd(textNode, Math.min(start + 1, textLength));

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      container.focus({ preventScroll: true });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [p.containerRef]);
};

const tryAdvanceWordWithinSpan = (
  spans: Element[],
  activeSpanIndex: { current: number },
  wordStartOffset: { current: number },
  direction: 'forward' | 'backward'
): boolean => {
  const currentSpan = spans[activeSpanIndex.current];
  const wordStarts = getWordStartingIndices(currentSpan?.textContent ?? '');
  const currentWordIdx = wordStarts.findIndex(
    (idx) => idx === wordStartOffset.current
  );

  if (direction === 'forward') {
    if (currentWordIdx !== -1 && currentWordIdx < wordStarts.length - 1) {
      wordStartOffset.current = wordStarts[currentWordIdx + 1]!;
      return true;
    }
    wordStartOffset.current = 0;
    return false;
  }

  if (currentWordIdx > 0) {
    wordStartOffset.current = wordStarts[currentWordIdx - 1]!;
    return true;
  }
  const prevSpanWords = getWordStartingIndices(
    spans[activeSpanIndex.current - 1]?.textContent ?? ''
  );
  wordStartOffset.current = prevSpanWords.length
    ? prevSpanWords[prevSpanWords.length - 1]!
    : 0;
  return false;
};

const moveToNextSpan = (
  spans: Element[],
  activeSpanIndex: { current: number },
  direction: 'forward' | 'backward'
) => {
  if (direction === 'forward') {
    activeSpanIndex.current = Math.min(
      activeSpanIndex.current + 1,
      spans.length - 1
    );
  } else {
    activeSpanIndex.current = Math.max(activeSpanIndex.current - 1, 0);
  }
};
