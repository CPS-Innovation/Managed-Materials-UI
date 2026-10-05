import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { useAxiosInstance } from '../../materials_components/DocumentSelectAccordion/getters/getAxiosInstance';
import { pcdRequestSchema, TPcdRequest } from '../../schemas/pcd';

const getPcdRequest = async (p: {
  axiosInstance: AxiosInstance;
  pcdId: string | number;
  caseId: string | number;
}) => {
  const resp = await p.axiosInstance.get<unknown>(`/cases/${p.caseId}/pcds/${p.pcdId}/pcd-request`);
  return resp.data;
};
const safeGetPcdRequest = async (p: {
  axiosInstance: AxiosInstance;
  pcdId: string | number;
  caseId: string | number;
}) => {
  try {
    const resp = await getPcdRequest(p);
    const parsed = pcdRequestSchema.safeParse(resp);
    if (!parsed.success) console.error(parsed.error);

    return parsed;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const useGetPcdRequest = (p: { pcdId: string | number; caseId: string | number }) => {
  const axiosInstance = useAxiosInstance();
  const [pcdRequest, setPcdRequest] = useState<null | undefined | TPcdRequest>();

  useEffect(() => {
    setPcdRequest(undefined);

    (async () => {
      const resp = await safeGetPcdRequest({ axiosInstance, ...p });
      setPcdRequest(resp.success ? resp.data : null);
    })();
  }, [p.pcdId]);

  return { data: pcdRequest };
};
