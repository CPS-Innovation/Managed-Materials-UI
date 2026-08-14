import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLastFocus } from '../../hooks/useLastFocus';

export type ModalProps = {
  children: React.ReactNode;
  ariaLabel: string;
  onBackgroundClick: () => void;
  onEscPress: () => void;
};

export const Modal = ({ children, ariaLabel, onBackgroundClick, onEscPress }: ModalProps) => {
  useFocusTrap('#review-redact-modal');
  useLastFocus();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onEscPress();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onEscPress]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return ReactDOM.createPortal(
    <div
      role="presentation"
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
        alignItems: 'center',
      }}
      onClick={onBackgroundClick}
    >
      <div
        id="review-redact-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          position: 'relative',
          borderRadius: '8px',
          boxShadow: '0 0 5px 5px #0003',
          zIndex: 1000,
          filter: 'drop-shadow(0 1px 2.5px #000)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
