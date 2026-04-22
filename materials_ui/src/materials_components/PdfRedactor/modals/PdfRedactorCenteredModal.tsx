import { useEffect, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '../../../caseWorkApp/hooks/useFocusTrap';
import { useLastFocus } from '../../../caseWorkApp/hooks/useLastFocus';

export const PdfRedactorCenteredModal = (p: {
  children: ReactNode;
  onBackgroundClick: () => void;
  onEscPress: () => void;
  ariaLabel: string;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useFocusTrap('#pdf-redactor-modal');
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

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#00000080',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={p.onBackgroundClick}
      >
        <div
          ref={popupRef}
          id="pdf-redactor-modal"
          role="dialog"
          aria-modal="true"
          aria-label={p.ariaLabel}
          style={{
            position: 'relative',
            borderRadius: '8px',
            boxShadow: '0 0 5px 5px #0003',
            zIndex: 1000,
            filter: 'drop-shadow(0 1px 2.5px #000)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {p.children}
        </div>
      </div>
    </>
  );
};
