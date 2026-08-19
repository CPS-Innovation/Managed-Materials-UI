import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';
import { useAxiosInstance } from '../../materials_components/DocumentSelectAccordion/getters/getAxiosInstance';
import { pcdRequestSchema } from '../../schemas/pcd';

const getPcdRequest = async (p: {
  axiosInstance: AxiosInstance;
  pcdId: string | number;
  caseId: number;
  urn: string;
}) => {
  const resp = await p.axiosInstance.get<unknown>(
    `urns/${p.urn}/cases/${p.caseId}/pcds/${p.pcdId}/pcd-request`,
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
  return pcdRequestSchema.safeParse(resp);
};

export const useGetPcdRequest = (p: { pcdId: string | number; caseId: number; urn: string }) => {
  const axiosInstance = useAxiosInstance();
  const [pcdRequest, setPcdRequest] = useState<null | undefined | z.infer<typeof pcdRequestSchema>>(
    undefined,
  );

  useEffect(() => {
    (async () => {
      const resp = await safeGetPcdRequest({ axiosInstance, ...p });
      setPcdRequest(resp.success ? resp.data : null);
    })();
  }, []);

  return { data: pcdRequest };
};
