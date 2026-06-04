import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';
import { useAxiosInstance } from './getAxiosInstance';

export const documentSchema = z.object({
  documentId: z.string(),
  status: z.string(),
  cmsDocType: z.object({
    documentTypeId: z.number(),
    documentType: z.string().nullable(),
    documentCategory: z.string()
  }),
  cmsOriginalFileName: z.string(),
  presentationTitle: z.string(),
  cmsFileCreatedDate: z.string(),
  isUnused: z.boolean(),
  hasNotes: z.boolean(),
  childId: z.number(),
  presentationFlags: z
    .object({ write: z.union([z.string(), z.boolean()]).nullish() })
    .nullish()
});
export const documentListSchema = z.array(documentSchema);
export type TDocument = z.infer<typeof documentSchema>;
export type TDocumentList = TDocument[];

export const getDocumentListFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  const response = await p.axiosInstance.get(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents`
  );

  return response.data;
};

export const safeGetDocumentListFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  try {
    const resp = await getDocumentListFromAxiosInstance({
      urn: p.urn,
      caseId: p.caseId,
      axiosInstance: p.axiosInstance
    });

    return documentListSchema.safeParse(resp);
  } catch (_error) {
    return { success: false } as const;
  }
};

export const safeGetDocumentListFromLocalStorage = (p: {
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  try {
    const key = `documentList-${p.urn}-${p.caseId}`;
    const initResp = localStorage.getItem(key);
    const resp = JSON.parse(initResp!); // assert with !, any errors caught

    return documentListSchema.safeParse(resp);
  } catch (_error) {
    return { success: false } as const;
  }
};

export const useGetDocumentList = (p: {
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  const axiosInstance = useAxiosInstance();

  const [data, setDocumentList] = useState<TDocumentList | null | undefined>(
    undefined
  );
  useEffect(() => {
    const key = `documentList-${p.urn}-${p.caseId}`;
    if (data) localStorage.setItem(key, JSON.stringify(data));
    if (data === null) localStorage.removeItem(key);
  }, [data]);

  const loadFromLocalStorage = () => {
    const resp = safeGetDocumentListFromLocalStorage({
      urn: p.urn,
      caseId: p.caseId
    });

    if (resp.success) setDocumentList(resp.data);
  };

  const loadFromAxiosInstance = async () => {
    const resp = await safeGetDocumentListFromAxiosInstance({
      axiosInstance,
      urn: p.urn,
      caseId: p.caseId
    });

    setDocumentList(resp.success ? resp.data : null);
  };

  const clear = () => setDocumentList(undefined);

  const load = async () => {
    loadFromLocalStorage();
    await loadFromAxiosInstance();
  };

  return { data, load, clear };
};
