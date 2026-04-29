import { RefObject, useEffect, useRef } from 'react';
import {
  getOrderedTextSpans,
  getWordStartingIndices
} from './useDocumentFocusHelpers';

type WordPosition = { span: Element; offset: number };

export const useDocumentFocus = (p: {
  containerRef: RefObject<HTMLElement | null>;
}) => {
  const currentWordIndex = useRef(-1);

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

      const words = collectWordPositions(container);
      if (!words.length) return;

      const step = isBackward ? -1 : 1;
      currentWordIndex.current = clamp(
        currentWordIndex.current + step,
        0,
        words.length - 1
      );

      placeCaretAt(words[currentWordIndex.current]!, container);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [p.containerRef]);
};

const collectWordPositions = (container: HTMLElement): WordPosition[] => {
  const textLayers = container.querySelectorAll('.textLayer');
  const spans = Array.from(textLayers).flatMap((tl) =>
    getOrderedTextSpans(tl.children)
  );
  return spans.flatMap((span) =>
    getWordStartingIndices(span.textContent ?? '').map((offset) => ({
      span,
      offset
    }))
  );
};

const placeCaretAt = (
  { span, offset }: WordPosition,
  container: HTMLElement
) => {
  const textNode = span.firstChild;
  if (!textNode) return;

  span.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const range = document.createRange();
  const textLength = textNode.textContent?.length ?? 0;
  range.setStart(textNode, offset);
  range.setEnd(textNode, Math.min(offset + 1, textLength));

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  container.focus({ preventScroll: true });
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));
