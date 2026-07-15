import { GovUkBanner } from '../../../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import { Button } from '../../components/button';
import { Modal } from './Modal';

export const FileTooLargeToRedactModal = (p: { onReturnClick: () => void }) => {
  return (
    <Modal onBackgroundClick={p.onReturnClick} onEscPress={p.onReturnClick}>
      <GovUkBanner
        variant="error"
        headerTitle="Error"
        contentHeading="File is too large for redaction"
        contentBody={
          <>
            <p className="govuk-body">This file is larger than 15MB and cannot be redacted.</p>

            <p className="govuk-body">Compress the file and try again.</p>

            <p className="govuk-body">
              If the file is still too large, ask the investigating authority to send a smaller
              file.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button variant="primary" onClick={p.onReturnClick}>
                Return to case file
              </Button>
            </div>
          </>
        }
      />
    </Modal>
  );
};
