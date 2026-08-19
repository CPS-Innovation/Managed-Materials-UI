import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';
import { PCDListingResponseSchema, PCDListingType } from '../../schemas/pcd';
import { useAxiosInstance } from '../ui/useRequest';

const getPcdRequestList = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
}) => {
  const resp = await p.axiosInstance.get<unknown>(
    `urns/${p.urn}/cases/${p.caseId}/pcds/${p.caseId}/pcd-request-core`,
  );
  return resp.data;
};

const safeGetPcdRequestList = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
}) => {
  const resp = await getPcdRequestList(p);
  return PCDListingResponseSchema.safeParse(resp);
};

export const usePcdRequestList = (p: { urn: string; caseId: number }) => {
  const axiosInstance = useAxiosInstance();

  const [pcdRequestList, setPcdRequestList] = useState<
    null | undefined | z.infer<typeof PCDListingResponseSchema>
  >(undefined);
  useEffect(() => {
    (async () => {
      const resp = await safeGetPcdRequestList({ axiosInstance, ...p });
      setPcdRequestList(resp.success ? resp.data : null);
    })();
  }, []);

  const sortByDate = (a: PCDListingType, b: PCDListingType) =>
    Date.parse(b.decisionRequested) - Date.parse(a.decisionRequested);

  return { data: pcdRequestList?.sort(sortByDate) };
};

// export const usePCDList = (p:{urn: string; caseId: number, pcdId: number}) => {
//   const request = useRequest();

//   const appRoute = useAppRoute();

//   const urn = appRoute?.urnPrefix;
//   const caseId = appRoute?.caseId?.toString();

//   const caseInfo = urn && caseId ? { urn, caseId } : null;

//   const getPCDList = async () =>
//     await request
//       .get<PCDListingResponseType>(`urns/${urn}/cases/${caseId}/pcds/${caseId}/pcd-request-core`)
//       .then((response) => response.data);

//   const { data, error, isLoading, isValidating } = useSWR(
//     caseInfo ? QUERY_KEYS.PCD_REQUESTS : null,
//     getPCDList,
//   );

//   const sortByDate = (a: PCDListingType, b: PCDListingType) =>
//     Date.parse(b.decisionRequested) - Date.parse(a.decisionRequested);

//   return { data: data?.sort(sortByDate) || undefined, error, isLoading: isLoading || isValidating };
// };
