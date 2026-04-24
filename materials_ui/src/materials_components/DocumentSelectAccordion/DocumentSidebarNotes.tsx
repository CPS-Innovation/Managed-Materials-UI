import { useState } from 'react';
import { LoadingSpinner } from '../../components';
import { DocumentSidebarWrapper } from './DocumentSidebarWrapper';
import { useAxiosInstance } from './getters/getAxiosInstance';
import {
  postDocumentNotesFromAxiosInstance,
  useGetDocumentNotes
} from './getters/getDocumentNotes';
import { CloseIconButton } from './templates/CloseIconButton';
import { GovUkBanner } from './templates/GovUkBanner';
import { GovUkButton } from './templates/GovUkButton';
import { GovUkLink } from './templates/GovUkLink';
import { GovUkTextarea } from './templates/GovUkTextarea';
import { formatDate } from './utils/dateUtils';

const NOTES_CHAR_COUNT_MAX_LENGTH = 500;

export const DocumentSidebarNotes = (p: {
  urn: string;
  caseId: number;
  documentId: string;
  onBackButtonClick: () => void;
  onNoteSavedSuccess: () => void;
}) => {
  const [text, setText] = useState('');
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const remainingCharacters = NOTES_CHAR_COUNT_MAX_LENGTH - text.length;

  const axiosInstance = useAxiosInstance();
  const documentNotes = useGetDocumentNotes({
    urn: p.urn,
    caseId: p.caseId,
    documentId: p.documentId
  });

  return (
    <DocumentSidebarWrapper>
      <div
        style={{
          borderBottom: 'solid 1px #b1b4b6',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 700, padding: '10px' }}>
          Notes
        </div>
        <CloseIconButton onClick={() => p.onBackButtonClick()} />
      </div>
      {savedSuccessfully && (
        <GovUkBanner
          variant="success"
          headerTitle="Success"
          contentBody="Document note successfully saved to CMS"
        />
      )}
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="notes-textarea"
            className="govuk-label"
            style={{ fontWeight: 700 }}
          >
            Add a note to the document
          </label>
          <GovUkTextarea
            initFocus
            id="notes-textarea"
            value={text}
            onInput={(x) => setText(x)}
            aria-describedby="notes-char-count"
            maxLength={NOTES_CHAR_COUNT_MAX_LENGTH}
            rows={5}
          />
          <span
            id="notes-char-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            You have {remainingCharacters} characters remaining
          </span>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <GovUkButton
              onClick={async () => {
                await postDocumentNotesFromAxiosInstance({
                  axiosInstance,
                  urn: p.urn,
                  documentId: p.documentId,
                  caseId: p.caseId,
                  text
                });
                setSavedSuccessfully(true);
                documentNotes.mutate();
                p.onNoteSavedSuccess();
              }}
            >
              Save
            </GovUkButton>
            <GovUkLink onClick={() => p.onBackButtonClick()}>Cancel</GovUkLink>
          </div>
        </div>
        <br />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <LoadingSpinner isLoading={documentNotes.data === undefined} />
          {documentNotes.data === null && <div>error</div>}
          {documentNotes.data && (
            <div
              style={{
                borderLeft: 'solid 4px #0066cc',
                display: 'flex',
                gap: '10px',
                flexDirection: 'column'
              }}
            >
              {documentNotes.data.map((note) => (
                <div
                  style={{ display: 'flex', gap: '10px' }}
                  key={`${note.date}-${note.text}`}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '6px',
                      borderBottom: 'solid 4px #0066cc'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{note.createdByName}</div>
                    <div>{formatDate(note.date)}</div>
                    <div>{note.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {documentNotes.data?.length === 0 && <div>No notes to display</div>}
        </div>
      </div>
    </DocumentSidebarWrapper>
  );
};
