import { ManualRedactionForm } from '../PdfRedactor/ManualRedactionForm';
import { PdfRedactorMiniModal } from '../PdfRedactor/modals/PdfRedactorMiniModal';
import { TRedactionType } from '../PdfRedactor/RedactionTypeSelect';
import { BulkRedactionForm, TBulkProps } from './BulkRedactionForm';

export type TRedactionPopupProps = {
  x: number;
  y: number;
  redactionIds: string[];
  highlightedText?: string;
};

export const RedactionPopover = (p: {
  popupProps: TRedactionPopupProps;
  onClose: () => void;
  onSaveSingle: (currentType: TRedactionType) => void;
  bulkProps?: TBulkProps;
}) => {
  return (
    <PdfRedactorMiniModal
      coordX={p.popupProps.x}
      coordY={p.popupProps.y}
      onBackgroundClick={p.onClose}
      onEscPress={p.onClose}
      ariaLabel="Redaction details"
      dimBackground={false}
      placement={p.bulkProps ? 'above' : 'auto'}
    >
      {p.bulkProps ? (
        <BulkRedactionForm bulkProps={p.bulkProps} onRedact={p.onSaveSingle} />
      ) : (
        <ManualRedactionForm onCancel={p.onClose} onRedact={p.onSaveSingle} />
      )}
    </PdfRedactorMiniModal>
  );
};
