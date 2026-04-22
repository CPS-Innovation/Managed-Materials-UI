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

  const [isExpandedController, setIsExpandedController] = useState(false);
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
  const newData = categoryDetails.map((x) => ({
    key: x.label,
    label: x.label,
    categoryName: x.categoryName,
    documents: docsOnDocCategoryNames[x.categoryName]
  }));

  return (
    <div>
      <GovUkAccordionOpenCloseLinkTemplate
        isExpandedController={isExpandedController}
        onClick={() => setIsExpandedController((x) => !x)}
      />
      <DocumentSidebarWrapper>
        <GovUkAccordionTemplate>
          {newData.map((item) => {
            if (item.categoryName === 'communication') return;
            if (
              item.categoryName === 'uncategorised' &&
              item.documents.length === 0
            )
              return;

            return (
              <GovUkAccordionSectionTemplate
                key={item.key}
                title={`${item.label} (${item.documents.length})`}
                isExpandedController={isExpandedController}
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
            );
          })}
        </GovUkAccordionTemplate>
      </DocumentSidebarWrapper>
    </div>
  );
};
