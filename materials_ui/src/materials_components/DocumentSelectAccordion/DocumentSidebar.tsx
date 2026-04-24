import { useEffect, useState } from 'react';
import { useTriggerListener } from '../PdfRedactor/utils/useTriggger';
import { DocumentSidebarAccordion } from './DocumentSidebarAccordion';
import { DocumentSidebarNotes } from './DocumentSidebarNotes';
import { TDocument, useGetDocumentList } from './getters/getDocumentList';

export const DocumentSidebar = (p: {
  urn: string;
  caseId: number;
  openDocumentIds: string[];
  activeDocumentId: string | null | undefined;
  newVersionDocumentId: string | null | undefined;
  onDocumentsChange: (doc: TDocument[] | null | undefined) => void;
  onSetDocumentOpenIds: (docIds: string[]) => void;
  reloadTriggerData: [] | undefined;
  onDocumentClick?: (docId: string) => void;
  ActionComponent?: (p: { document: TDocument }) => React.ReactNode;
}) => {
  const { caseId, urn } = p;
  const [status, setStatus] = useState<
    { mode: 'accordion' } | { mode: 'notes'; documentId: string }
  >({ mode: 'accordion' });

  useTriggerListener({
    triggerData: p.reloadTriggerData,
    fn: () => documentList.load()
  });

  const documentList = useGetDocumentList({ urn, caseId });
  useEffect(() => {
    p.onDocumentsChange(documentList.data);
  }, [documentList.data]);

  useEffect(() => {
    if (status.mode === 'accordion') documentList.load();
  }, [status]);

  if (status.mode === 'accordion') {
    if (documentList.data === null) return <div>error</div>;
    if (documentList.data === undefined) return <></>; //loading state
    return (
      <div>
        <DocumentSidebarAccordion
          caseId={caseId}
          urn={urn}
          documentList={documentList.data}
          activeDocumentId={p.activeDocumentId}
          newVersionDocumentId={p.newVersionDocumentId}
          openDocumentIds={p.openDocumentIds}
          onSetActiveDocumentIds={(docIds) => p.onSetDocumentOpenIds(docIds)}
          onDocumentClick={p.onDocumentClick}
          onNotesClick={(docId: string) =>
            setStatus({ mode: 'notes', documentId: docId })
          }
          ActionComponent={p.ActionComponent}
        />
      </div>
    );
  }
  if (status.mode === 'notes') {
    const documentId = status.documentId;

    return (
      <DocumentSidebarNotes
        documentId={documentId}
        caseId={caseId}
        urn={urn}
        onBackButtonClick={() => setStatus({ mode: 'accordion' })}
        onNoteSavedSuccess={() => setStatus({ mode: 'accordion' })}
      />
    );
  }
};
