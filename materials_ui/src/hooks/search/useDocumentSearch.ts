import useSWR from 'swr';
import { useCaseInfoStore, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import {
  DocumentResultType,
  SearchResultType,
  SearchTermResultType
} from '../../schemas/documents';

export const useDocumentSearch = (
  searchTerm: string | null,
  trackerComplete: boolean
) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const urn = caseInfo?.urn;
  const caseId = caseInfo?.id.toString();

  const getSearch = () =>
    request
      .get<
        SearchResultType[]
      >(`/urns/${urn}/cases/${caseId}/search/?query=${encodeURIComponent(searchTerm ?? '')}`)
      .then((res) => res.data);

  const { data, isLoading } = useSWR(
    searchTerm && trackerComplete
      ? [QUERY_KEYS.DOCUMENT_SEARCH, urn, caseId, searchTerm]
      : null,
    getSearch
  );

  return { searchResults: data ?? null, loading: isLoading };
};

export const useDocumentSearchResults = (
  documents: DocumentResultType = [],
  searchResults: SearchResultType[] = []
) => {
  if (!documents || !searchResults) return [];

  const combinedSearchResults: SearchTermResultType[] = [];

  for (const doc of documents) {
    const matches = searchResults.filter((sr) => sr.parentId === doc.parentId);

    const resultsPerDocumentCount = matches.reduce((acc, curr) => {
      const count = curr.words.filter((w) =>
        w.matchType?.includes('Exact')
      ).length;

      return acc + count;
    }, 0);

    if (matches.length > 0) {
      combinedSearchResults.push({
        parentId: doc.parentId,
        documentTitle: doc.presentationTitle ?? '',
        cmsFileCreatedDate: doc.cmsFileCreatedDate,
        cmsDocType: doc.cmsDocType,
        status: doc.status,
        presentationTitle: doc.presentationTitle,
        isUnused: doc.isUnused,
        cmsOriginalFileName: doc.cmsOriginalFileName,
        conversionStatus: doc.conversionStatus,
        matches: matches.map((match) => ({
          text: match.text,
          pageIndex: match.pageIndex,
          lineIndex: match.lineIndex,
          pageHeight: match.pageHeight,
          pageWidth: match.pageWidth,
          words: match.words
        })),
        resultsPerDocumentCount
      });
    }
  }

  return combinedSearchResults;
};
