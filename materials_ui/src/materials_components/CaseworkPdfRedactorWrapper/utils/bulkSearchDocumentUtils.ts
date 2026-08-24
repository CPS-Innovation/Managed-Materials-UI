import axios, { AxiosInstance } from 'axios';
import { wait } from '../../../utils/wait';

export type TBulkRedactionDefinition = {
  pageIndex: number;
  width: number;
  height: number;
  redactionCoordinates: { x1: number; y1: number; x2: number; y2: number }[];
};

export type TBulkSearchResponse = {
  urn: string;
  caseId: number;
  documentId: string;
  versionId: number;
  searchText: string;
  documentRefreshStatus: number;
  redactionDefinitions: TBulkRedactionDefinition[];
  failedReason: string | null;
  isNotFound: boolean;
};

export type TBulkSearchResult = { status: number; data: TBulkSearchResponse | null };

const bulkSearchPath = (route: { caseId: number; materialId: string; documentId: number }) =>
  `/api/cases/${route.caseId}/materials/${route.materialId}/documents/${route.documentId}/search`;

export const initiateBulkSearch = (request: {
  axiosInstance: AxiosInstance;
  caseId: number;
  materialId: string;
  documentId: number;
}) => request.axiosInstance.post(bulkSearchPath(request));

export const bulkSearchDocument = async (request: {
  axiosInstance: AxiosInstance;
  caseId: number;
  materialId: string;
  documentId: number;
  searchText: string;
  signal?: AbortSignal;
}): Promise<TBulkSearchResult> => {
  const response = await request.axiosInstance.get<TBulkSearchResponse>(bulkSearchPath(request), {
    params: { SearchText: request.searchText },
    signal: request.signal,
    validateStatus: () => true,
  });
  return { status: response.status, data: response.data ?? null };
};

const POLL_INTERVAL_MS = 3000;

export type TBulkSearchOutcome =
  | { outcome: 'success'; response: TBulkSearchResponse }
  | { outcome: 'error' }
  | { outcome: 'aborted' };

export const pollBulkSearch = async (request: {
  axiosInstance: AxiosInstance;
  caseId: number;
  materialId: string;
  documentId: number;
  searchText: string;
  signal: AbortSignal;
}): Promise<TBulkSearchOutcome> => {
  try {
    while (!request.signal.aborted) {
      const { status, data } = await bulkSearchDocument(request);
      if (request.signal.aborted) break;

      if (status === 200) {
        return !data ? { outcome: 'error' } : { outcome: 'success', response: data };
      }

      if (status !== 202) return { outcome: 'error' };
      await wait(POLL_INTERVAL_MS, request.signal);
    }
    return { outcome: 'aborted' };
  } catch (error) {
    if (axios.isCancel(error) || request.signal.aborted) return { outcome: 'aborted' };
    return { outcome: 'error' };
  }
};
