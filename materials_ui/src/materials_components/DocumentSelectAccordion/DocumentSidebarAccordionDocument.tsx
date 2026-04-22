import React, { useState } from 'react';
import { DocumentSidebarTag } from './DocumentSidebarTag';
import { TDocument } from './getters/getDocumentList';
import { useGetDocumentNotes } from './getters/getDocumentNotes';
import './templates/GovUkAccordion.scss';
import {
  NOTES_ARIA_LABELS,
  NOTES_STATUS,
  NotesIcon,
  NotesStatus
} from './templates/NotesIcon';
import { formatShortDate } from './utils/dateUtils';

export const DocumentSidebarAccordionNoDocumentsAvailable = () => {
  return (
    <div
      style={{
        borderTop: 'solid 1px #b1b4b6',
        background: '#ffffff',
        height: '60px',
        padding: '12px'
      }}
    >
      There are no documents available.
    </div>
  );
};

const Tooltip = (p: { text: string }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          backgroundColor: '#3d3d3d',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {p.text}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #3d3d3d'
          }}
        />
      </div>
    </div>
  );
};

export const DocumentSidebarAccordionDocument = (p: {
  urn: string;
  caseId: number;
  document: TDocument;
  activeDocumentId: string | null | undefined;
  newVersionDocumentId: string | null | undefined;
  openDocumentIds: string[];
  readDocumentIds: string[];
  onDocumentClick: () => void;
  onNotesClick: () => void;
  ActionComponent?: React.ReactNode;
}) => {
  const documentNotes = useGetDocumentNotes({
    urn: p.urn,
    caseId: p.caseId,
    documentId: p.document.documentId,
    revalidateOnMount: false
  });

  const tooltipText = (() => {
    if (documentNotes.data === undefined) return 'loading...';
    if (documentNotes.data === null) return 'error';
    if (documentNotes.data.length === 0) return 'No messages';

    const firstNote = documentNotes.data[0];

    return firstNote
      ? `${firstNote.text} (+${documentNotes.data.length - 1} more)`
      : '';
  })();

  return (
    <DocumentSidebarAccordionDocumentTemplate
      documentName={p.document.presentationTitle}
      documentDate={formatShortDate(p.document.cmsFileCreatedDate)}
      ActiveDocumentTag={p.activeDocumentId === p.document.documentId}
      NewTag={!p.readDocumentIds.includes(p.document.documentId)}
      NewVersionTag={p.newVersionDocumentId === p.document.documentId}
      showLeftBorder={p.activeDocumentId === p.document.documentId}
      showRightBorder={p.openDocumentIds.includes(p.document.documentId)}
      backgroundColor={
        p.readDocumentIds.includes(p.document.documentId) ? 'white' : 'blue'
      }
      // backgroundColor="blue"
      notesStatus={(() => {
        if (
          p.document.cmsDocType.documentType === 'PCD' ||
          p.document.cmsDocType.documentCategory === 'Review'
        )
          return NOTES_STATUS.DISABLED;
        return p.document.hasNotes ? NOTES_STATUS.NEW_NOTES : NOTES_STATUS.NONE;
      })()}
      onDocumentClick={p.onDocumentClick}
      onNotesClick={p.onNotesClick}
      ActionComponent={p.ActionComponent}
      tooltipText={tooltipText}
      onShowNotes={() => {
        if (documentNotes.data === undefined) documentNotes.mutate();
      }}
    />
  );
};
export const DocumentSidebarAccordionDocumentTemplate = (p: {
  documentName: string;
  documentDate: string;
  ActiveDocumentTag?: boolean;
  NewVersionTag?: boolean;
  NewTag?: boolean;
  ReclassifiedTag?: boolean;
  UpdatedTag?: boolean;
  notesStatus: NotesStatus;
  showLeftBorder?: boolean;
  showRightBorder: boolean;
  backgroundColor: 'blue' | 'white';
  onDocumentClick: () => void;
  onNotesClick: () => void;
  ActionComponent?: React.ReactNode;
  tooltipText: string;
  onShowNotes: () => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`document-select-accordion-document ${p.backgroundColor === 'blue' ? 'bg-blue' : 'bg-white'} ${p.showLeftBorder ? 'show-left-border' : ''} ${p.showRightBorder ? 'show-right-border' : ''}`}
    >
      <div className="document-select-accordion-document--inner-wrapper">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {p.ActiveDocumentTag && (
              <DocumentSidebarTag tagName="ActiveDocument" />
            )}
            {p.NewTag && <DocumentSidebarTag tagName="New" />}
            {p.NewVersionTag && <DocumentSidebarTag tagName="NewVersion" />}
            {p.ReclassifiedTag && <DocumentSidebarTag tagName="Reclassified" />}
            {p.UpdatedTag && <DocumentSidebarTag tagName="Updated" />}
          </div>
          {p.ActionComponent && <div>{p.ActionComponent}</div>}
        </div>
        <div>
          <button
            type="button"
            className="govuk-link button-as-link"
            onClick={() => p.onDocumentClick()}
          >
            {p.documentName}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date: {p.documentDate}</span>

          <span
            onMouseEnter={() => {
              p.onShowNotes();
              setShowTooltip(true);
            }}
            onMouseLeave={() => setShowTooltip(false)}
            style={{ position: 'relative' }}
          >
            {showTooltip && (
              <span
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <Tooltip text={p.tooltipText} />
              </span>
            )}
            <button
              type="button"
              className={`notes-icon-button${p.notesStatus === NOTES_STATUS.DISABLED ? ' notes-icon-button--disabled' : ''}`}
              aria-label={NOTES_ARIA_LABELS[p.notesStatus]}
              disabled={p.notesStatus === NOTES_STATUS.DISABLED}
              onClick={() => {
                p.onNotesClick();
              }}
            >
              <NotesIcon width={20} notesStatus={p.notesStatus} />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};
