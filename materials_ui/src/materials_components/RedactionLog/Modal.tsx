import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './RedactionLogModal.module.scss';

type ModalProps = { children: React.ReactNode; onClose: () => void };

export const Modal = ({ children, onClose }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
};
