import { PdfRedactorMiniModal } from '../PdfRedactor/modals/PdfRedactorMiniModal';
import {
  RedactionDetailsForm,
  TBulkProps,
  TRedactionType
} from '../PdfRedactor/PdfRedactionTypeForm';

export type TRedactionPopupProps = {
  x: number;
  y: number;
  redactionIds: string[];
  documentId: string;
  urn: string;
  caseId: string;
  highlightedText?: string;
};

export const RedactionPopover = (p: {
  popupProps: TRedactionPopupProps;
  onClose: () => void;
  onSaveSingle: (currentType: TRedactionType) => void;
  bulkProps?: TBulkProps;
}) => {
  const hasHighlightedText = !!p.popupProps.highlightedText?.trim();

  return (
    <PdfRedactorMiniModal
      coordX={p.popupProps.x}
      coordY={p.popupProps.y}
      onBackgroundClick={p.onClose}
      onEscPress={p.onClose}
      ariaLabel="Redaction details"
      dimBackground={false}
      placement={hasHighlightedText ? 'above' : 'auto'}
    >
      <RedactionDetailsForm
        redactionIds={p.popupProps.redactionIds}
        documentId={p.popupProps.documentId}
        urn={p.popupProps.urn}
        caseId={p.popupProps.caseId}
        highlightedText={p.popupProps.highlightedText}
        bulkProps={p.bulkProps}
        onCancelClick={p.onClose}
        onSaveSuccess={p.onSaveSingle}
      />
    </PdfRedactorMiniModal>
  );
};
