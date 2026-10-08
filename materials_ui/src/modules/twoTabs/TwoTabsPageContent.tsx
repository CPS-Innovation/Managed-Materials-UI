import { useState } from 'react';
import { TwoCol } from '../../components';
import {
  LayoutErrorTemplate,
  LayoutLoadedTemplate,
  LayoutLoadingTemplate,
} from '../../components/Layout/Layout';
import { useCaseInfo } from '../../hooks';
import { useGetDocumentList } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { TwoTabsDocumentsDisplay } from './TwoTabsDocumentsDisplay';

export const TwoTabsPageContent = (p: { caseId: number }) => {
  const { caseInfo } = useCaseInfo({ caseId: p.caseId });
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

  if (documentListState.status === 'loading' || caseInfo === undefined)
    return <LayoutLoadingTemplate title="Two Tabs" />;
  if (documentListState.status === 'error' || caseInfo === null)
    return (
      <LayoutErrorTemplate
        bannerError={{
          header: 'Error loading documents',
          type: 'error',
          content: (() => {
            if (documentListState.status === 'error')
              return documentListState.errorMessages.join(', ');
            return 'Case info not found';
          })(),
        }}
      />
    );

  return (
    <LayoutLoadedTemplate title="Two Tabs" caseInfo={caseInfo}>
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
    </LayoutLoadedTemplate>
  );
};
