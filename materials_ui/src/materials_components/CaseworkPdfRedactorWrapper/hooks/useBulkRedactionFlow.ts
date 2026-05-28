import { AxiosInstance } from 'axios';
import { Dispatch, SetStateAction, useEffect } from 'react';
import type {
  TBulkProps,
  TRedactionType
} from '../../PdfRedactor/PdfRedactionTypeForm';
import { convertCandidatesToSearchHighlights } from '../../PdfRedactor/utils/bulkRedactionUtils';
import type { TRedaction } from '../../PdfRedactor/utils/coordUtils';
import type { TRedactionPopupProps } from '../RedactionPopover';
import { useBulkSearch } from './useBulkSearch';

const POPOVER_GAP_PX = 10;

export const useBulkRedactionFlow = (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  versionId: number;
  documentId: string;
  popupProps: TRedactionPopupProps | null;
  setPopupProps: Dispatch<SetStateAction<TRedactionPopupProps | null>>;
  removeRedactions: (ids: string[]) => void;
  setRedactions: Dispatch<SetStateAction<TRedaction[]>>;
  setSelectedRedactionTypes: Dispatch<SetStateAction<TRedactionType[]>>;
}) => {
  const bulkSearch = useBulkSearch({
    axiosInstance: p.axiosInstance,
    urn: p.urn,
    caseId: p.caseId,
    versionId: p.versionId,
    documentId: p.documentId
  });

  // drop the user's selection once the bulk search returns, search results take over
  useEffect(() => {
    if (bulkSearch.state.status !== 'done') return;
    if (bulkSearch.candidates.length < 1) return;
    if (!p.popupProps || p.popupProps.redactionIds.length === 0) return;

    const idsToRemove = p.popupProps.redactionIds;
    p.setRedactions((prev) => prev.filter((r) => !idsToRemove.includes(r.id)));
    p.setPopupProps((prev) => (prev ? { ...prev, redactionIds: [] } : prev));
  }, [bulkSearch.state.status, bulkSearch.candidates.length, p.popupProps]);

  // pin the popover above whichever match is currently focused
  useEffect(() => {
    const focusedId = bulkSearch.focusedCandidate?.id;
    if (!focusedId) return;

    const elm = document.querySelector(
      `[data-text-highlight-id="${focusedId}"]`
    );
    if (!elm) return;
    const matchTop = elm.getBoundingClientRect().top;
    p.setPopupProps((prev) =>
      prev
        ? { ...prev, x: window.innerWidth / 2, y: matchTop - POPOVER_GAP_PX }
        : prev
    );
  }, [bulkSearch.focusedCandidate?.id]);

  const trimmedSearchText = p.popupProps?.highlightedText?.trim() ?? '';

  const closePopover = () => {
    p.setPopupProps(null);
    bulkSearch.clear();
  };

  const onClose = () => {
    if (p.popupProps) p.removeRedactions(p.popupProps.redactionIds);
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

  return {
    bulkRedactionCandidates: convertCandidatesToSearchHighlights(
      bulkSearch.candidates
    ),
    focusedBulkRedactionIndex: bulkSearch.focusedIndex,
    popoverProps: { onClose, onSaveSingle, bulkProps }
  };
};
