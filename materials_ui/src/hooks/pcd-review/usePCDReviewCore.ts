import useSWR from 'swr';

import { useAppRoute, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { PCDReviewCoreResponseType, PCDReviewCoreSchema } from '../../schemas/pcdReview';

export const usePCDReviewCore = () => {
  const request = useRequest();

  const appRoute = useAppRoute();

  const urn = appRoute?.urnPrefix;
  const caseId = appRoute?.caseId?.toString();

  const caseInfo = urn && caseId ? { urn, caseId } : null;

  const getPCDReviewCore = async () => {
    try {
      const response = await request.get(`urns/${urn}/cases/${caseId}/pcd-review-core`);

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

  const { data, error, isLoading, isValidating } = useSWR<PCDReviewCoreResponseType>(
    caseInfo ? QUERY_KEYS.PCD_REVIEW_CORE : null,
    getPCDReviewCore,
  );

  return { data, error, isLoading: isLoading || isValidating };
};
