import useSWR from 'swr';

import { AxiosInstance } from 'axios';
import { useBanner, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { CaseDetailsType } from '../../schemas/caseDetails';
import { useAxiosInstance } from '../ui/useRequest';

export const useCaseSearch = (urn: string | undefined) => {
  const request = useRequest();
  const { resetBanner, setBanner } = useBanner();

  const getCase = async () => {
    resetBanner();

    return await request
      .get<CaseDetailsType>(`/urns/${urn}/cases`)
      .then((response) => response.data);
  };

  const { data, isLoading, isValidating, mutate } = useSWR(
    urn ? [QUERY_KEYS.CASE_SEARCH, urn] : null,
    getCase,
    {
      onError: (error) => {
        if (error.status === 500) {
          setBanner({
            type: 'error',
            header: 'Something went wrong',
            content: 'There was a problem with the server when searching for a case.',
          });
        }
      },
    },
  );

  return { caseDetails: data ?? null, loading: isLoading || isValidating, refresh: mutate };
};

export const getCaseDetails = async (p: { axiosInstance: AxiosInstance; urn: string }) => {
  return p.axiosInstance.get<CaseDetailsType>(`/urns/${p.urn}/cases`);
};

const getCaseDetailsKey = (p: { urn: string }) => `getCaseDetails-${p.urn}`;
export const useCaseDetails = (p: { urn: string }) => {
  const axiosInstance = useAxiosInstance();
  const rtn = useSWR(
    getCaseDetailsKey({ urn: p.urn }), //
    () => {
      if (!p.urn) return;
      return getCaseDetails({ axiosInstance, urn: p.urn });
    },
  );

  return rtn;
};
