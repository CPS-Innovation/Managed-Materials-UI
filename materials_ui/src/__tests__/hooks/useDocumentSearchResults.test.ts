import { describe, expect, it } from 'vitest';
import { useDocumentSearchResults } from '../../hooks/search/useDocumentSearch';
import { DocumentSchema, SearchResultSchema } from '../../schemas/documents';

describe('useDocumentSearchResults', () => {
  it('maps endpoint document fields to the established search result fields', () => {
    const document = DocumentSchema.parse({
      parentId: 'parent-1',
      status: 'Ready',
      documentId: 1,
      cmsDocType: {
        documentTypeId: 1,
        documentType: 'Statement',
        documentCategory: 'Evidence',
      },
      originalFileName: 'statement.pdf',
      subject: 'Witness statement',
      date: '2026-01-02T03:04:05Z',
      isOcrProcessed: true,
      categoryListOrder: 0,
      presentationFlags: { read: 'Ok', write: 'Ok' },
      parentDocumentId: null,
      witnessId: null,
      hasFailedAttachments: false,
      hasNotes: false,
      conversionStatus: 'Converted',
      piiVersionId: null,
      isUnused: false,
      isInbox: false,
      classification: 'STATEMENT',
      isWitnessManagement: false,
      canReclassify: false,
      canRename: false,
      renameStatus: '',
      reference: null,
    });
    const searchResult = SearchResultSchema.parse({
      id: 'result-1',
      documentId: 'parent-1',
      versionId: 1,
      fileName: 'statement.pdf',
      pageIndex: 0,
      lineIndex: 0,
      pageHeight: 100,
      pageWidth: 100,
      text: 'Witness statement',
      words: [{ boundingBox: null, text: 'Witness', matchType: 'Exact' }],
    });

    expect(useDocumentSearchResults([document], [searchResult])[0]).toMatchObject({
      documentTitle: 'Witness statement',
      presentationTitle: 'Witness statement',
      cmsFileCreatedDate: '2026-01-02T03:04:05Z',
      cmsOriginalFileName: 'statement.pdf',
    });
  });
});
