import { AxiosInstance } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { convertSearchResponseToRedactions } from '../../PdfRedactor/utils/bulkRedactionUtils';
import type { TRedaction } from '../../PdfRedactor/utils/coordUtils';
import { pollBulkSearch } from '../utils/bulkSearchDocumentUtils';

export type TBulkSearchInternalState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; candidates: TRedaction[]; focusedIndex: number }
  | { status: 'error' };

export const useBulkSearch = (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  materialId: string;
  documentId: number;
}) => {
  const [state, setState] = useState<TBulkSearchInternalState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ status: 'idle' });
  }, []);

  const run = useCallback(
    async (searchText: string): Promise<TRedaction[] | undefined> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ status: 'loading' });

      const result = await pollBulkSearch({
        axiosInstance: p.axiosInstance,
        caseId: p.caseId,
        materialId: p.materialId,
        documentId: p.documentId,
        searchText,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return undefined;

      if (result.outcome !== 'success') {
        if (result.outcome === 'error') setState({ status: 'error' });
        return undefined;
      }

      const candidates = convertSearchResponseToRedactions(result.response);
      setState({ status: 'done', candidates, focusedIndex: 0 });
      return candidates;
    },
    [p.axiosInstance, p.caseId, p.materialId, p.documentId],
  );

  const nudge = (delta: number) =>
    setState((prev) => {
      if (prev.status !== 'done' || prev.candidates.length === 0) return prev;
      const n = prev.candidates.length;
      return { ...prev, focusedIndex: (prev.focusedIndex + delta + n) % n };
    });

  const goNext = useCallback(() => nudge(1), []);
  const goPrev = useCallback(() => nudge(-1), []);

  const removeFocused = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'done' || prev.candidates.length === 0) return prev;
      const remaining = prev.candidates.filter((_, i) => i !== prev.focusedIndex);
      if (remaining.length === 0) return { status: 'idle' };
      return {
        status: 'done',
        candidates: remaining,
        focusedIndex: Math.min(prev.focusedIndex, remaining.length - 1),
      };
    });
  }, []);

  const candidates = state.status === 'done' ? state.candidates : [];
  const focusedIndex = state.status === 'done' ? state.focusedIndex : undefined;
  const focusedCandidate =
    state.status === 'done' ? state.candidates[state.focusedIndex] : undefined;

  return {
    state,
    candidates,
    focusedIndex,
    focusedCandidate,
    run,
    clear,
    goNext,
    goPrev,
    removeFocused,
  };
};
