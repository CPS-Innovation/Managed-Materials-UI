import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { useAxiosInstance } from '../../materials_components/DocumentSelectAccordion/getters/getAxiosInstance';
import { pcdRequestSchema, TPcdRequest } from '../../schemas/pcd';

const getPcdRequest = async (p: {
  axiosInstance: AxiosInstance;
  pcdId: string | number;
  caseId: number;
  urn: string;
}) => {
  const resp = await p.axiosInstance.get<unknown>(
    `/api/urns/${p.urn}/cases/${p.caseId}/pcds/${p.pcdId}/pcd-request`,
  );
  return resp.data;
};
const safeGetPcdRequest = async (p: {
  axiosInstance: AxiosInstance;
  pcdId: string | number;
  caseId: number;
  urn: string;
}) => {
  const resp = await getPcdRequest(p);
  const parsed = pcdRequestSchema.safeParse(resp);
  if (!parsed.success) {
    console.error(parsed.error);
  }
  return parsed;
};

export const useGetPcdRequest = (p: { pcdId: string | number; caseId: number; urn: string }) => {
  const axiosInstance = useAxiosInstance();
  const [pcdRequest, setPcdRequest] = useState<null | undefined | TPcdRequest>();

  useEffect(() => {
    (async () => {
      const resp = await safeGetPcdRequest({ axiosInstance, ...p });
      setPcdRequest(resp.success ? resp.data : null);
    })();
  }, []);

  return { data: pcdRequest };
};
