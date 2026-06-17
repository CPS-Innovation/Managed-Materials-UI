export enum PcdReviewCoreType {
  EarlyAdvice = 0,
  InitialReview = 1,
  PreChargeDecisionAnalysis = 2
}

export const PcdReviewTypeLabel: Record<PcdReviewCoreType, string> = {
  [PcdReviewCoreType.EarlyAdvice]: 'Early Advice',
  [PcdReviewCoreType.InitialReview]: 'Initial Review',
  [PcdReviewCoreType.PreChargeDecisionAnalysis]: 'Further Review'
};
