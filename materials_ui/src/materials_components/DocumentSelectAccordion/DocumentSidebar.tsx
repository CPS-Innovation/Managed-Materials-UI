import { useEffect, useState } from 'react';
import { DocumentSidebarAccordion } from './DocumentSidebarAccordion';
import { DocumentSidebarNotes } from './DocumentSidebarNotes';
import { TDocument, useGetDocumentList } from './getters/getDocumentList';

export const DocumentSidebar = (p: {
  urn: string;
  caseId: number;
  openDocumentIds: string[];
  activeDocumentId: string | null | undefined;
  newVersionDocumentId: string | null | undefined;
  onChangeSidebarModeView: (x: 'accordion' | 'notes') => void;
  onSetDocumentOpenIds: (docIds: string[]) => void;
  documentListState: ReturnType<typeof useGetDocumentList>['state'];
  onDocumentClick?: (docId: string) => void;
  ActionComponent?: (p: { document: TDocument }) => React.ReactNode;
}) => {
  const { caseId, urn } = p;
  const [mode, setMode] = useState<{ view: 'accordion' } | { view: 'notes'; documentId: string }>({
    view: 'accordion',
  });

  useEffect(() => {
    p.onChangeSidebarModeView(mode.view);
  }, [mode]);

  if (mode.view === 'accordion' && p.documentListState.status === 'success') {
    return (
      <div>
        <DocumentSidebarAccordion
          caseId={caseId}
          urn={urn}
          documentList={p.documentListState.data}
          activeDocumentId={p.activeDocumentId}
          newVersionDocumentId={p.newVersionDocumentId}
          openDocumentIds={p.openDocumentIds}
          onSetActiveDocumentIds={(docIds) => p.onSetDocumentOpenIds(docIds)}
          onDocumentClick={p.onDocumentClick}
          onNotesClick={(docId: string) => setMode({ view: 'notes', documentId: docId })}
          ActionComponent={p.ActionComponent}
        />
      </div>
    );
  }
  if (mode.view === 'notes') {
    const documentId = mode.documentId;

    return (
      <DocumentSidebarNotes
        documentId={documentId}
        caseId={caseId}
        urn={urn}
        onBackButtonClick={() => setMode({ view: 'accordion' })}
        onNoteSavedSuccess={() => setMode({ view: 'accordion' })}
      />
    );
  }
};
