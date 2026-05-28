import { useEffect, type ReactNode } from 'react';
import { useFocusTrap } from '../../../caseWorkApp/hooks/useFocusTrap';
import { useLastFocus } from '../../../caseWorkApp/hooks/useLastFocus';

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

  const transform =
    p.placement === 'above'
      ? 'translate(-50%, -100%)'
      : `translate(${p.coordX > window.innerWidth / 2 ? '-100%' : '0'}, ${p.coordY > window.innerHeight / 2 ? '-100%' : '0'})`;

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
        id="pdf-redactor-mini-modal"
        role="dialog"
        aria-modal="true"
        aria-label={p.ariaLabel}
        style={{
          position: 'fixed',
          left: `${p.coordX}px`,
          top: `${p.coordY}px`,
          transform,
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
