import { PdfRedactorMiniModal } from '../PdfRedactor/modals/PdfRedactorMiniModal';
import {
  RedactionDetailsForm,
  TBulkProps,
  TRedactionType
} from '../PdfRedactor/PdfRedactionTypeForm';

// Position and the manual selection (if any) that opened the popover. The
// document/urn/case identifiers are supplied separately by useBulkRedactionFlow,
// which already holds them.
export type TRedactionPopupProps = {
  x: number;
  y: number;
  redactionIds: string[];
  highlightedText?: string;
};

export const RedactionPopover = (p: {
  popupProps: TRedactionPopupProps;
  documentId: string;
  urn: string;
  caseId: string;
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
        documentId={p.documentId}
        urn={p.urn}
        caseId={p.caseId}
        highlightedText={p.popupProps.highlightedText}
        bulkProps={p.bulkProps}
        onCancelClick={p.onClose}
        onSaveSuccess={p.onSaveSingle}
      />
    </PdfRedactorMiniModal>
  );
};
