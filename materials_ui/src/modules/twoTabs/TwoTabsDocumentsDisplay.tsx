import { useValueHistory } from '../../hooks/useValueHistory';
import { TDocument } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';

export const TwoTabsDocumentsDisplay = (p: {
  documents: TDocument[];
  onDocumentSelect: (P: { documentId: string }) => void;
  onDocumentClose: (P: { documentId: string }) => void;
  onDocumentActive: (P: { documentId: string | null }) => void;
  activeDocumentId: string | null;
  openDocumentIds: string[];
}) => {
  const { history: activeDocumentIdHistory } = useValueHistory(p.activeDocumentId);
  const getMostRecentOpenDocumentId = () => {
    const [_, ...rest] = activeDocumentIdHistory;
    return rest.find((id) => (id ? p.openDocumentIds.includes(id) : false));
  };

  return (
    <div>
      <h1>Two Tabs Document Display</h1>
      <pre>{JSON.stringify({ activeDocumentIdHistory }, undefined, 2)}</pre>
      <div className="flex flex-col gap-4">
        {p.documents.map((document) => (
          <div
            key={`${document.parentId}-${document.childId}`}
            className="flex gap-4 min-w-[300px]"
          >
            <div
              onClick={() => {
                p.onDocumentSelect({ documentId: document.parentId });
                p.onDocumentActive({ documentId: document.parentId });
              }}
            >
              {document.parentId}, {document.childId}
              {p.activeDocumentId === document.parentId ? ' (active)' : ''}
            </div>
            {p.openDocumentIds.includes(document.parentId) && (
              <span
                onClick={() => {
                  p.onDocumentClose({ documentId: document.parentId });
                  const mostRecentOpenDocumentId = getMostRecentOpenDocumentId();
                  if (mostRecentOpenDocumentId)
                    p.onDocumentActive({ documentId: mostRecentOpenDocumentId });
                }}
              >
                X
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
