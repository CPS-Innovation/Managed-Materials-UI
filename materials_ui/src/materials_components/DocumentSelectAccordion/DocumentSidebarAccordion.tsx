import React, { useEffect, useState } from 'react';
import {
  DocumentSidebarAccordionDocument,
  DocumentSidebarAccordionNoDocumentsAvailable
} from './DocumentSidebarAccordionDocument';
import { DocumentSidebarWrapper } from './DocumentSidebarWrapper';
import { TDocument, TDocumentList } from './getters/getDocumentList';
import {
  GovUkAccordionOpenCloseLinkTemplate,
  GovUkAccordionSectionTemplate,
  GovUkAccordionTemplate
} from './templates/GovUkAccordion';
import { categoriseDocument } from './utils/categoriseDocument';
import {
  categoryDetails,
  initDocsOnDocCategoryNamesMap
} from './utils/categoriseDocumentHelperUtils';
import {
  safeGetDocumentSidebarReadDocIdsFromLocalStorage,
  safeSetDocumentSidebarReadDocIdsFromLocalStorage
} from './utils/DocumentSidebarLocalStorageUtils';
import { areSetsEqual } from './utils/generalUtils';

const createOpenDocumentAccordionSectionKey = (p: {
  caseId: number;
  sectionTitle: string;
}) => `openDocumentAccordionSection-${p.caseId}-${p.sectionTitle}`;

export const DocumentSidebarAccordion = (p: {
  caseId: number;
  urn: string;
  documentList: TDocumentList;
  openDocumentIds: string[];
  activeDocumentId: string | undefined | null;
  newVersionDocumentId: string | undefined | null;
  onNotesClick: (docId: string) => void;
  onSetActiveDocumentIds: (docIds: string[]) => void;
  onDocumentClick?: (docId: string) => void;
  ActionComponent?: (p: { document: TDocument }) => React.ReactNode;
}) => {
  const { caseId } = p;

  const [openDocumentIds, setOpenDocumentIds] = useState<string[]>(
    p.openDocumentIds
  );

  const isNoChangeInActiveDocIds = () =>
    areSetsEqual(new Set(openDocumentIds), new Set(p.openDocumentIds));

  //handle two-way binding: parent to child
  useEffect(() => {
    if (!isNoChangeInActiveDocIds()) setOpenDocumentIds(p.openDocumentIds);
  }, [p.openDocumentIds]);
  //handle two-way binding: child to parent
  useEffect(() => {
    if (!isNoChangeInActiveDocIds()) p.onSetActiveDocumentIds(openDocumentIds);
  }, [openDocumentIds]);

  const [readDocumentIds, setReadDocumentIds] = useState<string[]>(
    safeGetDocumentSidebarReadDocIdsFromLocalStorage(p.caseId)
  );

  useEffect(() => {
    const newReadDocIds = [
      ...new Set([...readDocumentIds, ...p.openDocumentIds])
    ];
    safeSetDocumentSidebarReadDocIdsFromLocalStorage({ caseId, newReadDocIds });
  }, [readDocumentIds]);

  const docsOnDocCategoryNames = initDocsOnDocCategoryNamesMap();
  p.documentList.forEach((doc) => {
    const categoryName = categoriseDocument(doc);
    docsOnDocCategoryNames[categoryName].push(doc);
  });
  const cleanDocData = categoryDetails
    .map((x) => ({
      key: x.label,
      label: x.label,
      categoryName: x.categoryName,
      documents: docsOnDocCategoryNames[x.categoryName]
    }))
    .filter((x) => x.categoryName !== 'communication')
    .filter(
      (x) => !(x.categoryName === 'uncategorised' && x.documents.length === 0)
    );

  const [isExpandedController, setIsExpandedController] = useState(false);
  const [isExpandedSectionsTracker, setIsExpandedSectionsTracker] = useState<
    boolean[]
  >([]);
  useEffect(() => {
    if (isExpandedSectionsTracker.length === 0) return;
    const allSectionsExpanded = isExpandedSectionsTracker.every((x) => x);
    const allSectionsClosed = isExpandedSectionsTracker.every((x) => !x);

    if (allSectionsExpanded) setIsExpandedController(true);
    if (allSectionsClosed) setIsExpandedController(false);
  }, [isExpandedSectionsTracker]);

  return (
    <div>
      <GovUkAccordionOpenCloseLinkTemplate
        isExpandedController={isExpandedController}
        onClick={() => setIsExpandedController((x) => !x)}
      />
      <DocumentSidebarWrapper>
        <GovUkAccordionTemplate>
          {cleanDocData.map((item, j) => (
            <GovUkAccordionSectionTemplate
              key={item.key}
              title={`${item.label} (${item.documents.length})`}
              isExpandedController={isExpandedController}
              onIsExpandedToggle={(newIsExpanded) => {
                console.log({ newIsExpanded });
                setIsExpandedSectionsTracker((prev) => {
                  const newArr = [...prev];
                  newArr[j] = newIsExpanded;
                  return newArr;
                });
              }}
              localStorageKey={createOpenDocumentAccordionSectionKey({
                caseId: p.caseId,
                sectionTitle: item.label
              })}
            >
              {item.documents.length === 0 ? (
                <DocumentSidebarAccordionNoDocumentsAvailable />
              ) : (
                item.documents.map((document) => (
                  <DocumentSidebarAccordionDocument
                    key={`${item.key}-${document.documentId}`}
                    document={document}
                    activeDocumentId={p.activeDocumentId}
                    newVersionDocumentId={p.newVersionDocumentId}
                    openDocumentIds={openDocumentIds}
                    readDocumentIds={readDocumentIds}
                    onDocumentClick={() => {
                      p.onDocumentClick?.(document.documentId);
                      setReadDocumentIds((docIds) => [
                        ...new Set([...docIds, document.documentId])
                      ]);
                      const docSet = new Set([
                        ...openDocumentIds,
                        document.documentId
                      ]);
                      setOpenDocumentIds([...docSet]);
                    }}
                    onNotesClick={() => p.onNotesClick(document.documentId)}
                    ActionComponent={
                      p.ActionComponent ? (
                        <p.ActionComponent document={document} />
                      ) : null
                    }
                    urn={p.urn}
                    caseId={p.caseId}
                  />
                ))
              )}
            </GovUkAccordionSectionTemplate>
          ))}
        </GovUkAccordionTemplate>
      </DocumentSidebarWrapper>
    </div>
  );
};
