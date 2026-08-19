import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import {
  pcdRequestListingsSchema,
  TPcdRequestListing,
  TPcdRequestListings,
} from '../../schemas/pcd';
import { useAxiosInstance } from '../ui/useRequest';

const getPcdRequestListings = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
}) => {
  const resp = await p.axiosInstance.get<unknown>(
    `urns/${p.urn}/cases/${p.caseId}/pcds/${p.caseId}/pcd-request-core`,
  );
  return resp.data;
};

const safeGetPcdRequestListings = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
}) => {
  const resp = await getPcdRequestListings(p);
  return pcdRequestListingsSchema.safeParse(resp);
};

export const usePcdRequestListings = (p: { urn: string; caseId: number }) => {
  const axiosInstance = useAxiosInstance();

  const [pcdRequestListings, setPcdRequestListings] = useState<
    null | undefined | TPcdRequestListings
  >(undefined);

  useEffect(() => {
    (async () => {
      const resp = await safeGetPcdRequestListings({ axiosInstance, ...p });
      setPcdRequestListings(resp.success ? resp.data : null);
    })();
  }, []);

  const sortByDate = (a: TPcdRequestListing, b: TPcdRequestListing) =>
    Date.parse(b.decisionRequested) - Date.parse(a.decisionRequested);

  return { data: pcdRequestListings?.sort(sortByDate) };
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
