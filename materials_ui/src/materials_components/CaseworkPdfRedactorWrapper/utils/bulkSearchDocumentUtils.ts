import { AxiosInstance } from 'axios';

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
