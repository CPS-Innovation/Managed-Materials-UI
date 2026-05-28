import useSWR from 'swr';

import { useCaseInfoStore, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import {
  PCDReviewCoreResponseType,
  PCDReviewCoreSchema
} from '../../schemas/pcdReview';

export const usePCDReviewCore = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getPCDReviewCore = async () => {
    try {
      const response = await request.get(
        `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/pcd-review-core`
      );

      const parsedResponse = PCDReviewCoreSchema.safeParse(response.data);

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error.message);
      }

      return parsedResponse.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch pcd-review-core: ${message}`);
    }
  };

  const { data, error, isLoading, isValidating } =
    useSWR<PCDReviewCoreResponseType>(
      caseInfo ? QUERY_KEYS.PCD_REVIEW_CORE : null,
      getPCDReviewCore
    );

  return { data, error, isLoading: isLoading || isValidating };
};
