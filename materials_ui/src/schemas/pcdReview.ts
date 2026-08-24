import { z } from 'zod';

import { PcdReviewCoreType } from '../constants/enum';

const PcdReviewCoreTypeSchema = z.union([
  z.literal(PcdReviewCoreType.EarlyAdvice),
  z.literal(PcdReviewCoreType.InitialReview),
  z.literal(PcdReviewCoreType.PreChargeDecisionAnalysis),
]);

export const PCDReviewCoreSchema = z.array(
  z.object({ date: z.string(), id: z.coerce.number(), type: PcdReviewCoreTypeSchema }),
);

export const PCDReviewDetailsSchema = z.object({
  preChargeDecisionAnalysisOutcome: z.object({
    allocation: z.string(),
    caseSummary: z.string(),
    consultationType: z.string(),
    disclosureActionsAndIssues: z.string(),
    europeanCourtOfHumanRights: z.string().nullable(),
    evidentialAssessment: z.string().nullable(),
    instructionsToOperationsDeliveryOrAdvocate: z.string(),
    publicInterestAssessment: z.string(),
    trialStrategy: z.string(),
    witnessOrVictimInformationAndActions: z.string(),
  }),
  preChargeDecisionOutcome: z.object({
    defendantDecisions: z.array(
      z.object({
        id: z.number(),
        defendantName: z.string(),
        decisionDescription: z.string().nullable(),
        reason: z.string().nullable(),
        reasonCode: z.string().nullable(),
        returnBailDate: z.string().nullable(),
        publicInterestCode: z.string().nullable(),
      }),
    ),
    decisionMadeBy: z.string(),
    investigationStage: z.string(),
    method: z.string().nullable(),
    pcdHistoryActionPlan: z.array(
      z.object({
        entryDate: z.string(),
        actionDate: z.string(),
        actionPoint: z.string(),
        actionType: z.string(),
      }),
    ),
  }),
});

export type PCDReviewCoreResponseType = z.infer<typeof PCDReviewCoreSchema>;
export type PCDReviewDetailsResponseType = z.infer<typeof PCDReviewDetailsSchema>;
