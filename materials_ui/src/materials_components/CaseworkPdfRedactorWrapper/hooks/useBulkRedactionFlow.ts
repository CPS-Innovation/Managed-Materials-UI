import { AxiosInstance } from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import type {
  TBulkProps,
  TRedactionType
} from '../../PdfRedactor/PdfRedactionTypeForm';
import { convertCandidatesToSearchHighlights } from '../../PdfRedactor/utils/bulkRedactionUtils';
import type { TRedaction } from '../../PdfRedactor/utils/coordUtils';
import type { THighlightLayer } from '../../PdfRedactor/utils/searchHighlightUtils';
import { TRedactionPopupProps } from '../RedactionPopover';
import { useBulkSearch } from './useBulkSearch';

// Owns the redaction popover and the bulk-search-from-selection flow. The
// wrapper calls openPopover() after a redaction is drawn and renders the
// returned popoverProps; everything else (search, navigation, committing
// candidates as redactions) lives here.
export const useBulkRedactionFlow = (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  versionId: number;
  documentId: string;
  setRedactions: Dispatch<SetStateAction<TRedaction[]>>;
  setSelectedRedactionTypes: Dispatch<SetStateAction<TRedactionType[]>>;
}) => {
  const [popupProps, setPopupProps] = useState<TRedactionPopupProps | null>(
    null
  );

  const removeRedactions = (ids: string[]) =>
    p.setRedactions((prev) => prev.filter((r) => !ids.includes(r.id)));

  const bulkSearch = useBulkSearch({
    axiosInstance: p.axiosInstance,
    urn: p.urn,
    caseId: p.caseId,
    versionId: p.versionId,
    documentId: p.documentId
  });

  // drop the user's manual selection once the bulk search returns with matches;
  // the candidates (which include it) take over the highlight display
  useEffect(() => {
    if (bulkSearch.state.status !== 'done') return;
    if (bulkSearch.candidates.length < 1) return;
    if (!popupProps || popupProps.redactionIds.length === 0) return;

    const idsToRemove = popupProps.redactionIds;
    p.setRedactions((prev) => prev.filter((r) => !idsToRemove.includes(r.id)));
    setPopupProps((prev) => (prev ? { ...prev, redactionIds: [] } : prev));
  }, [bulkSearch.state.status, bulkSearch.candidates.length, popupProps]);

  // pin the popover above whichever match is currently focused
  useEffect(() => {
    const focusedId = bulkSearch.focusedCandidate?.id;
    if (!focusedId) return;

    const elm = document.querySelector(
      `[data-text-highlight-id="${focusedId}"]`
    );
    if (!elm) return;
    const matchTop = elm.getBoundingClientRect().top;
    setPopupProps((prev) =>
      prev ? { ...prev, x: window.innerWidth / 2, y: matchTop } : prev
    );
  }, [bulkSearch.focusedCandidate?.id]);

  const trimmedSearchText = popupProps?.highlightedText?.trim() ?? '';

  const closePopover = () => {
    setPopupProps(null);
    bulkSearch.clear();
  };

  const onClose = () => {
    if (popupProps) removeRedactions(popupProps.redactionIds);
    closePopover();
  };

  const onSaveSingle = (currentType: TRedactionType) => {
    p.setSelectedRedactionTypes((prev) => [
      ...prev,
      { id: currentType.id, name: currentType.name }
    ]);
    closePopover();
  };

  const bulkProps: TBulkProps | undefined = trimmedSearchText
    ? {
        search:
          bulkSearch.state.status === 'done'
            ? { status: 'done', count: bulkSearch.candidates.length }
            : bulkSearch.state,
        onFindMatchingText: () => void bulkSearch.run(trimmedSearchText),
        onViewPrevious: bulkSearch.goPrev,
        onViewNext: bulkSearch.goNext,
        onRedactFocused: (currentType) => {
          const focused = bulkSearch.focusedCandidate;
          if (!focused) return;
          p.setRedactions((prev) => [...prev, focused]);
          p.setSelectedRedactionTypes((prev) => [
            ...prev,
            { id: currentType.id, name: currentType.name }
          ]);
          const willBeEmpty = bulkSearch.candidates.length === 1;
          bulkSearch.removeFocused();
          if (willBeEmpty) closePopover();
        },
        onRedactAll: (currentType) => {
          if (bulkSearch.candidates.length === 0) return;
          p.setRedactions((prev) => [...prev, ...bulkSearch.candidates]);
          p.setSelectedRedactionTypes((prev) => [
            ...prev,
            ...Array(bulkSearch.candidates.length).fill({
              id: currentType.id,
              name: currentType.name
            })
          ]);
          closePopover();
        }
      }
    : undefined;

  const highlightLayer: THighlightLayer = {
    highlights: convertCandidatesToSearchHighlights(bulkSearch.candidates),
    focusedId: bulkSearch.focusedCandidate?.id
  };

  return {
    highlightLayer,
    popupProps,
    openPopover: (props: TRedactionPopupProps) => setPopupProps(props),
    popoverProps: {
      documentId: p.documentId,
      urn: p.urn,
      caseId: `${p.caseId}`,
      onClose,
      onSaveSingle,
      bulkProps
    }
  };
};
