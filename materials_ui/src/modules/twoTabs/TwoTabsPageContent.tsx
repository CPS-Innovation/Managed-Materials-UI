import { useState } from 'react';
import { Layout, TwoCol } from '../../components';
import { useGetDocumentList } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { TwoTabsDocumentsDisplay } from './TwoTabsDocumentsDisplay';

export const TwoTabsPageContent = (p: { urn: string; caseId: number }) => {
  const { state: documentListState } = useGetDocumentList({
    populateOnMount: true,
    caseId: p.caseId,
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [openDocumentIds, setOpenDocumentIds] = useState<string[]>([]);

  const activeDocument =
    documentListState.status === 'success'
      ? documentListState.data?.find((doc) => doc.parentId === activeDocumentId)
      : null;

  const openDocuments =
    documentListState.status === 'success'
      ? documentListState.data?.filter((doc) => openDocumentIds.includes(doc.parentId))
      : [];

  return (
    <Layout title="Two Tabs" caseId={p.caseId}>
      <TwoCol sidebar={<div>blah</div>}>
        {documentListState.status === 'success' && (
          <div className="flex gap-16">
            <TwoTabsDocumentsDisplay
              documents={documentListState.data}
              activeDocumentId={activeDocumentId}
              openDocumentIds={openDocumentIds}
              onDocumentSelect={({ documentId: newDocumentId }) => {
                setOpenDocumentIds((prev) => Array.from(new Set([...prev, newDocumentId])));
              }}
              onDocumentClose={({ documentId: newDocumentId }) => {
                setOpenDocumentIds((prev) => prev.filter((id) => id !== newDocumentId));
              }}
              onDocumentActive={({ documentId: newDocumentId }) => {
                setActiveDocumentId(newDocumentId);
              }}
            />

            <pre>{JSON.stringify({ activeDocument, openDocuments }, null, 2)}</pre>
          </div>
        )}
        <pre>
          {JSON.stringify(
            {
              props: p,
              documentListState,
              activeDocument,
              openDocuments,
              setActiveDocumentId,
              setOpenDocumentIds,
            },
            null,
            2,
          )}
        </pre>
      </TwoCol>
    </Layout>
  );
};
