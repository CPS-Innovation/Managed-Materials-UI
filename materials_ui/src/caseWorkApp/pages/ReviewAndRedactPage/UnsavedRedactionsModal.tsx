import { TDocument } from '../../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { GovUkBanner } from '../../../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import { TRedaction } from '../../../materials_components/PdfRedactor/utils/coordUtils';
import { Button } from '../../components/button';
import { LinkButton } from '../../components/LinkButton/LinkButton';
import { Modal } from './Modal';

export type UnsavedRedactionsModalProps = {
  redactionsIndexedOnDocumentId: { [k: string]: TRedaction[] };
  documents: TDocument[];
  onReturnClick: () => void;
  onIgnoreClick: () => void;
  onDocumentClick: (documentId: string) => void;
};

export const UnsavedRedactionsModal = ({
  redactionsIndexedOnDocumentId,
  documents,
  onReturnClick,
  onIgnoreClick,
  onDocumentClick,
}: UnsavedRedactionsModalProps) => {
  const documentIdsWithRedactions = Object.keys(redactionsIndexedOnDocumentId).filter(
    (docId) =>
      redactionsIndexedOnDocumentId[docId] && redactionsIndexedOnDocumentId[docId].length > 0,
  );

  const documentsWithRedactions = documents.filter((doc) =>
    documentIdsWithRedactions.includes(doc.parentId),
  );

  const isPluralDocuments = documentsWithRedactions.length !== 1;

  const heading = `You have ${documentsWithRedactions.length} document${isPluralDocuments ? 's' : ''} with unsaved redactions`;

  return (
    <Modal ariaLabel={heading} onBackgroundClick={onReturnClick} onEscPress={onReturnClick}>
      <GovUkBanner
        variant="error"
        headerTitle="Error"
        contentHeading={heading}
        contentBody={
          <>
            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
              {documentsWithRedactions.map((doc) => (
                <LinkButton key={doc.parentId} onClick={() => onDocumentClick(doc.parentId)}>
                  {doc.presentationTitle}
                </LinkButton>
              ))}
            </div>
            <br />
            <div>Return to the case to save your redactions in these documents</div>
            <div>If you select Ignore your redactions will not be applied.</div>
            <br />
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button variant="primary" onClick={onReturnClick}>
                Return to case
              </Button>
              <Button variant="inverse" onClick={onIgnoreClick}>
                Ignore
              </Button>
            </div>
          </>
        }
      />
    </Modal>
  );
};
