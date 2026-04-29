import { RefObject, useEffect, useRef } from 'react';
import { TMode } from '../utils/modeUtils';

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

export const useShiftReleaseRedactTrigger = (p: {
  modeRef: RefObject<TMode>;
  containerRef: RefObject<HTMLElement | null>;
  fire: () => void;
}) => {
  const shiftExtendedRef = useRef(false);

  useEffect(() => {
    const isContainerVisible = () => {
      const container = p.containerRef.current;
      if (!container) return false;
      return window.getComputedStyle(container).visibility !== 'hidden';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey &&
        ARROW_KEYS.has(e.key) &&
        p.modeRef.current === 'textRedact' &&
        isContainerVisible()
      ) {
        shiftExtendedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Shift') return;
      if (!shiftExtendedRef.current) return;
      shiftExtendedRef.current = false;

      if (p.modeRef.current !== 'textRedact') return;
      if (!isContainerVisible()) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      p.fire();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [p.modeRef, p.containerRef, p.fire]);
};
