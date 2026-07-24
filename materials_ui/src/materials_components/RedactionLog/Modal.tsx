import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFocusTrap } from '../../caseWorkApp/hooks/useFocusTrap';
import { useLastFocus } from '../../caseWorkApp/hooks/useLastFocus';
import styles from './RedactionLogModal.module.scss';

type ModalProps = { children: React.ReactNode; onClose: () => void; ariaLabel: string };

export const Modal = ({ children, onClose, ariaLabel }: ModalProps) => {
  useFocusTrap('#redaction-log-modal');
  useLastFocus();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        id="redaction-log-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
