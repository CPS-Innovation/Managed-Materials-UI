import { GovUkBanner } from '../../../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import { TRedaction } from '../../../materials_components/PdfRedactor/utils/coordUtils';
import { Button } from '../../components/button';
import { Modal } from './Modal';

export const CloseTabUnsavedRedactionsModal = (p: {
  redactions?: TRedaction[];
  onReturnClick: () => void;
  onIgnoreClick: () => void;
}) => {
  const isPlural = p.redactions?.length !== 1;

  return (
    <Modal onBackgroundClick={p.onIgnoreClick} onEscPress={p.onIgnoreClick}>
      <GovUkBanner
        variant="error"
        headerTitle="Error"
        contentHeading="You have unsaved redactions"
        contentBody={
          <>
            <p className="govuk-body">
              {`You have ${p.redactions?.length ?? 0} unsaved redaction ${isPlural ? 's' : ''}`}
            </p>
            <p className="govuk-body">
              Return to the document to save your redactions
            </p>
            <p className="govuk-body">
              If you select Ignore your redactions will not be applied.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button variant="primary" onClick={p.onReturnClick}>
                Return to case file
              </Button>
              <Button variant="inverse" onClick={p.onIgnoreClick}>
                Ignore
              </Button>
            </div>
          </>
        }
      />
    </Modal>
  );
};
