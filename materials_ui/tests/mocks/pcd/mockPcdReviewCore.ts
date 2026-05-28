import { PcdReviewCoreType } from '../../../src/constants/enum';
import type { PCDReviewCoreResponseType } from '../../../src/schemas/pcdReview';

const PcdReviewCoreDataResponse: PCDReviewCoreResponseType = [
  { id: 4380514, date: '19/05/2025', type: PcdReviewCoreType.InitialReview },
  {
    id: 4380522,
    date: '19/05/2025',
    type: PcdReviewCoreType.PreChargeDecisionAnalysis
  }
];

export const mockPcdReviewCoreDataResponse = (
  data?: PCDReviewCoreResponseType
): PCDReviewCoreResponseType => data ?? PcdReviewCoreDataResponse;
