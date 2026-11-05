import { AxiosInstance } from 'axios';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import z from 'zod';
import { useAxiosInstance } from './getAxiosInstance';

const materialNotechema = z.object({
  createdByName: z.string(),
  date: z.string(),
  text: z.string(),
});
const materialNotesSchema = z.array(materialNotechema);

export type TMaterialNote = z.infer<typeof materialNotechema>;
export type TMaterialNotes = z.infer<typeof materialNotesSchema>;

export const postMaterialNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  materialId: string | undefined;
  caseId: string | number | undefined;
  text: string;
}) => {
  const response = await p.axiosInstance.post(
    `/cases/${p.caseId}/materials/${p.materialId}/notes`,
    { Text: p.text },
  );

  return response.data;
};

export const getMaterialNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  materialId: string | undefined;
  caseId: string | number | undefined;
}) => {
  const response = await p.axiosInstance.get(`/cases/${p.caseId}/materials/${p.materialId}/notes`);

  return response.data;
};

export const safeGetMaterialNotesFromLocalStorage = (p: {
  caseId: string | number | undefined;
  materialId: string | undefined;
}) => {
  try {
    const key = createGetMaterialNotesKey({ materialId: p.materialId, caseId: p.caseId });
    const initResp = localStorage.getItem(key);
    const resp = JSON.parse(initResp!); // assert with !, any errors caught

    return materialNotesSchema.safeParse(resp);
  } catch (error) {
    return { success: false, error } as const;
  }
};

const createGetMaterialNotesKey = (p: {
  materialId: string | undefined;
  caseId: string | number | undefined;
}) => `getMaterialNotes-${p.caseId}-${p.materialId}`;

export const safeGetMaterialNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  materialId: string | undefined;
  caseId: string | number | undefined;
}) => {
  try {
    const resp = await getMaterialNotesFromAxiosInstance({
      caseId: p.caseId,
      materialId: p.materialId,
      axiosInstance: p.axiosInstance,
    });

    return materialNotesSchema.safeParse(resp);
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const safeSetMaterialNotesFromLocalStorage = (p: {
  materialId: string | undefined;
  caseId: string | number | undefined;
  data: TMaterialNotes | null | undefined;
}) => {
  const localStorageKey = createGetMaterialNotesKey({ materialId: p.materialId, caseId: p.caseId });
  window.localStorage.setItem(localStorageKey, JSON.stringify(p.data));
};

export const useGetMaterialNotes = (p: {
  caseId: string | number | undefined;
  materialId: string | undefined;
  revalidateOnMount?: boolean;
}) => {
  const { revalidateOnMount = true } = p;
  const axiosInstance = useAxiosInstance();
  const key = createGetMaterialNotesKey({ materialId: p.materialId, caseId: p.caseId });

  const fallbackData = useMemo(() => {
    const resp = safeGetMaterialNotesFromLocalStorage(p);
    return resp.success ? resp.data : undefined;
  }, [p.caseId, p.materialId]);

  const rtn = useSWR(
    key,
    async () => {
      const resp = await safeGetMaterialNotesFromAxiosInstance({ ...p, axiosInstance });
      return resp.success ? resp.data : null;
    },
    { fallbackData, revalidateOnMount },
  );

  useEffect(() => {
    safeSetMaterialNotesFromLocalStorage({
      materialId: p.materialId,
      caseId: p.caseId,
      data: rtn.data,
    });
  }, [rtn.data]);
  return rtn;
};
