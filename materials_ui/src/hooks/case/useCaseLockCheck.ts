import useSWR from 'swr';

import { useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { CaseLockStatusResponseType } from '../../schemas/caseLockStatus';
import { useCaseInfoStore } from '../../stores';

type UseCaseLockStatus = {
  isLocked: boolean;
  name: string | null;
  refreshCaseLockStatus: () => void;
};

export const useCaseLockCheck = (): UseCaseLockStatus => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getCaseLockStatus = async () => {
    const response = await request.get<CaseLockStatusResponseType>(
      `/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/case-lock-info`,
    );

    return response.data;
  };

  const { data, mutate: refreshCaseLockStatus } = useSWR(
    caseInfo ? QUERY_KEYS.CASE_LOCK_STATUS : null,
    getCaseLockStatus,
  );

  return {
    isLocked: data?.isLocked || false,
    name: data?.lockedByUser || null,
    refreshCaseLockStatus,
  };
};
