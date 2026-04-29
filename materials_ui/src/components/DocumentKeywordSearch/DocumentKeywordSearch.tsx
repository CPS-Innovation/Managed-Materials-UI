import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAppRoute,
  useDocuments,
  useDocumentSearch,
  useDocumentSearchResults,
  useFilters,
  usePager,
  useSearchTracker
} from '../../hooks';

import {
  Banner,
  LoadingSpinner,
  Modal,
  Pagination,
  SearchInput,
  SectionBreak,
  TwoCol
} from '..';

import { categoriseDocument } from '../../materials_components/DocumentSelectAccordion/utils/categoriseDocument';
import { SearchTermResultType } from '../../schemas/documents';
import { formatDateLong } from '../../utils/date';
import { defaultSortFn } from '../../utils/filtering';
import { DocumentKeywordSearchFilters } from '../Filters/DocumentKeywordSearchFilters';

import { DEFAULT_RESULTS_PER_PAGE } from '../../constants/query';
import './DocumentKeywordSearch.scss';

type DocumentKeywordSearchProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

export const DocumentKeywordSearch = ({
  modalOpen,
  setModalOpen
}: DocumentKeywordSearchProps) => {
  const { getRoute } = useAppRoute();
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [expandedDocuments, setExpandedDocuments] = useState<
    Record<string, boolean>
  >({});
  const [selectedSort, setSelectedSort] = useState('date');

  const { isComplete: trackerComplete, failedToConvert } =
    useSearchTracker(searchTerm);

  const { searchResults, loading } = useDocumentSearch(
    searchTerm,
    trackerComplete
  );

  const { documents } = useDocuments();

  const combinedSearchResults = useDocumentSearchResults(
    documents ?? [],
    searchResults ?? []
  );

  const { filters, resetFilters } = useFilters('documents');

  const toggleDocumentExpand = (docId: string) => {
    setExpandedDocuments((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleSearchSubmit = (term: string) => {
    setSearchTerm(term);
    setExpandedDocuments({});
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    if (!modalOpen) resetFilters();
  }, [modalOpen]);

  const filteredResults = useMemo(() => {
    const selectedCategories = filters?.filters?.category ?? [];
    const selectedStatus = filters?.filters?.status ?? [];

    const newStatus = selectedStatus.includes('New');

    const sortColumn =
      selectedSort === 'date'
        ? 'cmsFileCreatedDate'
        : 'resultsPerDocumentCount';

    const sortFn = defaultSortFn<SearchTermResultType>({
      column: sortColumn,
      direction: 'descending'
    });

    return combinedSearchResults
      .filter((doc) => {
        const category = categoriseDocument(doc);

        if (newStatus) {
          return true;
        }

        return (
          selectedCategories.length === 0 ||
          selectedCategories.includes(category)
        );
      })
      .map((item) => ({
        ...item,
        [sortColumn]: String(item[sortColumn] ?? '')
      }))
      .sort(sortFn);
  }, [
    combinedSearchResults,
    filters?.filters?.category,
    filters?.filters?.status,
    selectedSort
  ]);

  const highlightExactMatches = (
    text: string,
    words: { boundingBox: number[] | null; text: string; matchType: string[] }[]
  ) => {
    const exactWords = words
      .filter((w) => w.matchType.includes('Exact'))
      .map((w) => w.text);

    if (!text || exactWords.length === 0) return text;

    const escaped = exactWords.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, i) =>
      exactWords.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
        <strong key={i}>{part}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    setNextPage,
    setPage,
    setPreviousPage
  } = usePager({
    totalItems: filteredResults ? filteredResults.length : 0,
    initialPageSize: DEFAULT_RESULTS_PER_PAGE,
    initialPage: 0
  });

  return (
    <div style={{ marginBottom: '20px' }}>
      <SearchInput
        id="search-within-case"
        label="Search within material"
        onSearch={handleSearchSubmit}
        placeholder="Enter search term"
        hideButton={false}
      />

      <Modal open={modalOpen} onClose={handleModalClose}>
        <LoadingSpinner
          isLoading={!trackerComplete}
          textContent="Loading search results"
        />
        {trackerComplete && (
          <TwoCol
            sidebar={
              <DocumentKeywordSearchFilters
                onSearchSubmit={(term) => setSearchTerm(term)}
              />
            }
          >
            {loading && <p>Searching…</p>}

            {!loading && filteredResults && (
              <div className="search-results-message">
                <div>
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    <strong>{filteredResults.length}</strong> results in{' '}
                    <strong>{documents?.length}</strong> documents in this case
                  </p>
                  <p className="govuk-body">
                    Search may not have found all instances of "{searchTerm}" in
                    this case
                  </p>
                </div>

                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-visually-hidden"
                    htmlFor="sort"
                  >
                    Sort by
                  </label>
                  <select
                    className="govuk-select"
                    id="sort"
                    name="sort"
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                  >
                    <option value="date" defaultValue="date">
                      Date added
                    </option>
                    <option value="resultsPerDocument">
                      Results per document
                    </option>
                  </select>
                </div>
              </div>
            )}

            {failedToConvert.length > 0 && (
              <Banner
                type="important"
                header="Technical problems stopped us from searching these documents:"
                content={failedToConvert.map((doc: SearchTermResultType) => (
                  <p
                    key={doc.documentId}
                    style={{ fontStyle: 'italic', color: '#505a5f' }}
                  >
                    {doc.presentationTitle}
                  </p>
                ))}
              ></Banner>
            )}

            {!loading &&
              filteredResults &&
              filteredResults.slice(startIndex, endIndex + 1).map((doc) => {
                const isExpanded = expandedDocuments[doc.documentId] ?? false;
                const first = doc.matches[0];
                const remainingCount = doc.matches.length - 1;

                return (
                  <div key={doc.documentId} style={{ marginBottom: 20 }}>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                      <Link
                        to={getRoute('REVIEW_REDACT')}
                        state={{
                          materialId: doc.documentId,
                          searchTerm,
                          searchMatches: doc.matches
                        }}
                        onClick={handleModalClose}
                      >
                        {doc.documentTitle}
                      </Link>
                    </h2>

                    <p className="govuk-body-s">
                      Uploaded: {formatDateLong(doc.cmsFileCreatedDate)} Type{' '}
                      {doc.cmsDocType.documentType}
                    </p>

                    <div className="govuk-inset-text">
                      <p>
                        {first &&
                          highlightExactMatches(first.text, first.words)}
                      </p>

                      {isExpanded && remainingCount > 0 && (
                        <>
                          {doc.matches.slice(1).map((match, index) => (
                            <div key={index} style={{ marginTop: '1rem' }}>
                              <p>
                                {highlightExactMatches(match.text, match.words)}
                              </p>
                            </div>
                          ))}
                        </>
                      )}

                      {remainingCount > 0 && (
                        <span
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            display: 'inline-block',
                            marginTop: 8
                          }}
                          onClick={() => toggleDocumentExpand(doc.documentId)}
                        >
                          {isExpanded
                            ? 'Hide additional results'
                            : `View ${remainingCount} more`}
                        </span>
                      )}
                    </div>

                    <SectionBreak />
                  </div>
                );
              })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setNextPage={setNextPage}
              setPreviousPage={setPreviousPage}
              setPage={setPage}
            />

            {!loading && filteredResults?.length === 0 && searchTerm && (
              <p className="govuk-body">No results.</p>
            )}
          </TwoCol>
        )}
      </Modal>
    </div>
  );
};
