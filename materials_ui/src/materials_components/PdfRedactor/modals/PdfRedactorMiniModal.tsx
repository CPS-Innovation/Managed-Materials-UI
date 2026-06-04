import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useFocusTrap } from '../../../caseWorkApp/hooks/useFocusTrap';
import { useLastFocus } from '../../../caseWorkApp/hooks/useLastFocus';

const GAP_PX = 10;

const computePosition = (p: {
  coordX: number;
  coordY: number;
  width: number;
  height: number;
  placement: 'auto' | 'above';
}) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left: number;
  let top: number;

  if (p.placement === 'above') {
    left = p.coordX - p.width / 2;
    const roomAbove = p.coordY - GAP_PX;
    top =
      roomAbove >= p.height ? p.coordY - GAP_PX - p.height : p.coordY + GAP_PX;
  } else {
    left = p.coordX + p.width > vw ? p.coordX - p.width : p.coordX;
    top = p.coordY + p.height > vh ? p.coordY - p.height : p.coordY;
  }

  return {
    left: Math.min(Math.max(GAP_PX, left), vw - p.width - GAP_PX),
    top: Math.min(Math.max(GAP_PX, top), vh - p.height - GAP_PX)
  };
};

export const PdfRedactorMiniModal = (p: {
  coordX: number;
  coordY: number;
  children: ReactNode;
  onBackgroundClick: () => void;
  onEscPress: () => void;
  ariaLabel: string;
  dimBackground?: boolean;
  placement?: 'auto' | 'above';
}) => {
  const dimBackground = p.dimBackground ?? true;
  const placement = p.placement ?? 'auto';
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useFocusTrap('#pdf-redactor-mini-modal');
  useLastFocus();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'Escape') p.onBackgroundClick();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPosition(
      computePosition({
        coordX: p.coordX,
        coordY: p.coordY,
        width,
        height,
        placement
      })
    );
  }, [p.coordX, p.coordY, placement]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: dimBackground ? '#00000080' : undefined,
          zIndex: 999,
          pointerEvents: 'auto'
        }}
        onClick={p.onBackgroundClick}
      />
      <div
        ref={popupRef}
        id="pdf-redactor-mini-modal"
        role="dialog"
        aria-modal="true"
        aria-label={p.ariaLabel}
        style={{
          position: 'fixed',
          left: `${position?.left ?? p.coordX}px`,
          top: `${position?.top ?? p.coordY}px`,
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 0 5px 5px #0003',
          padding: '16px',
          zIndex: 1000,
          filter: 'drop-shadow(0 1px 2.5px #000)',
          pointerEvents: 'auto'
        }}
      >
        {p.children}
      </div>
    </>
  );
};
