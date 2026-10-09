import useSWR from 'swr';

import { AxiosInstance } from 'axios';
import { useBanner, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { caseDetailsSchema, CaseDetailsType } from '../../schemas/caseDetails';
import { getSafeCaseInfo } from '../case/useCaseInfo';
import { useAxiosInstance } from '../ui/useRequest';

export const useCaseSearch = (urn: string) => {
  const request = useRequest();
  const { resetBanner, setBanner } = useBanner();

  const getCase = async () => {
    resetBanner();

    return await request
      .get<CaseDetailsType>(`/urns/${urn}/cases`)
      .then((response) => response.data);
  };

  const { data, isLoading, isValidating, mutate } = useSWR([QUERY_KEYS.CASE_SEARCH, urn], getCase, {
    onError: (error) => {
      if (error.status === 500) {
        setBanner({
          type: 'error',
          header: 'Something went wrong',
          content: 'There was a problem with the server when searching for a case.',
        });
      }
    },
  });

  return { caseDetails: data ?? null, loading: isLoading || isValidating, refresh: mutate };
};

export const getCaseDetails = async (p: { axiosInstance: AxiosInstance; urn: string }) => {
  return p.axiosInstance.get<CaseDetailsType>(`/urns/${p.urn}/cases`);
};

const getCaseDetailsKey = (p: { urn: string }) => `getCaseDetails-${p.urn}`;
export const useCaseDetails = (p: { urn: string }) => {
  const axiosInstance = useAxiosInstance();
  const rtn = useSWR(getCaseDetailsKey({ urn: p.urn }), () =>
    getCaseDetails({ axiosInstance, urn: p.urn }),
  );

  return rtn;
};

const getSafeCaseDetails = async (p: { axiosInstance: AxiosInstance; urn: string }) => {
  try {
    const caseDetails = await getCaseDetails({ axiosInstance: p.axiosInstance, urn: p.urn });
    return caseDetailsSchema.safeParse(caseDetails.data);
  } catch (error) {
    return { success: false, error } as const;
  }
};

const getSafeCaseDetailsByCaseId = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const caseInfoResp = await getSafeCaseInfo({ axiosInstance: p.axiosInstance, caseId: p.caseId });
  if (!caseInfoResp.success) return caseInfoResp;

  return getSafeCaseDetails({ axiosInstance: p.axiosInstance, urn: caseInfoResp.data.urn });
};

export const useSafeCaseDetailsByCaseId = (p: { caseId: string }) => {
  const axiosInstance = useAxiosInstance();
  const rtn = useSWR(`getSafeCaseDetailsByCaseId-${p.caseId}`, () =>
    getSafeCaseDetailsByCaseId({ axiosInstance, caseId: p.caseId }),
  );

  return rtn;
};
