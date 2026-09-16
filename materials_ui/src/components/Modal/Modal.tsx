import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useFocusTrap } from '../../caseWorkApp/hooks/useFocusTrap';
import { useLastFocus } from '../../caseWorkApp/hooks/useLastFocus';
import './Modal.scss';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  title?: string;
  children: React.ReactNode;
};

const ModalContent = ({
  onClose,
  ariaLabel,
  ariaDescribedBy,
  title,
  children,
}: Omit<ModalProps, 'open'>) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap();
  useLastFocus();

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        id="modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>

        <button className="modal-close-btn" type="button" aria-label="Close" onClick={onClose}>
          x
        </button>
      </div>
    </div>,
    document.body,
  );
};

export const Modal = ({ open, ...props }: ModalProps) =>
  open ? <ModalContent {...props} /> : null;
