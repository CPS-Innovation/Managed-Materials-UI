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
  try {
    const resp = await getPcdRequestListings(p);
    return pcdRequestListingsSchema.safeParse(resp);
  } catch (error) {
    return { success: false, error } as const;
  }
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

  return { data: pcdRequestListings ? pcdRequestListings?.sort(sortByDate) : pcdRequestListings };
};
