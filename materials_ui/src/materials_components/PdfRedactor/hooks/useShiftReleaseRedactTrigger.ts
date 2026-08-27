import { RefObject, useEffect, useRef } from 'react';
import { isRedactionEnabledMode, TMode } from '../utils/modeUtils';
import { isExtendSelectionByWordKey } from './useDocumentFocusHelpers';

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

const SELECTION_SETTLE_MS = 600;

const isShiftArrowKey = (e: KeyboardEvent) => e.shiftKey && !e.altKey && ARROW_KEYS.has(e.key);

export const useShiftReleaseRedactTrigger = (p: {
  modeRef: RefObject<TMode>;
  containerRef: RefObject<HTMLElement | null>;
  fire: () => void;
}) => {
  const shiftExtendedRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearSettleTimer = () => {
      if (settleTimerRef.current === null) return;
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    };

    const isContainerVisible = () => {
      const container = p.containerRef.current;
      if (!container) return false;
      return window.getComputedStyle(container).visibility !== 'hidden';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSettleTimer();
        shiftExtendedRef.current = false;
        return;
      }
      if (e.key === 'Shift') {
        clearSettleTimer();
        return;
      }
      if (
        (isShiftArrowKey(e) || isExtendSelectionByWordKey(e)) &&
        isRedactionEnabledMode(p.modeRef.current) &&
        isContainerVisible()
      ) {
        shiftExtendedRef.current = true;
        clearSettleTimer();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Shift') return;
      if (!shiftExtendedRef.current) return;

      clearSettleTimer();
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        shiftExtendedRef.current = false;

        if (!isRedactionEnabledMode(p.modeRef.current)) return;
        if (!isContainerVisible()) return;
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        p.fire();
      }, SELECTION_SETTLE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearSettleTimer();
    };
  }, [p.modeRef, p.containerRef, p.fire]);
};
