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

export type TBulkSearchResult = {
  status: number;
  data: TBulkSearchResponse | null;
};

export const bulkSearchDocument = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  versionId: number;
  documentId: string;
  searchText: string;
  signal?: AbortSignal;
}): Promise<TBulkSearchResult> => {
  const response = await p.axiosInstance.get<TBulkSearchResponse>(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.versionId}/search`,
    {
      params: { SearchText: p.searchText },
      signal: p.signal,
      validateStatus: () => true
    }
  );
  return { status: response.status, data: response.data ?? null };
};
