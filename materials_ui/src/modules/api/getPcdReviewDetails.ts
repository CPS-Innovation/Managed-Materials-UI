import { AxiosInstance } from 'axios';

import { z } from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const pcdReviewDetailsSchema = z.object({
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

// export type PCDReviewCoreResponseType = z.infer<typeof pcdReviewCoreSchema>;
// export type PCDReviewDetailsResponseType = z.infer<typeof pcdReviewDetailsSchema>;

const getPCDReviewDetails = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string;
  requestedHistoryId: number;
}) => {
  return p.axiosInstance.get<unknown>(
    `cases/${p.caseId}/history/${p.requestedHistoryId}/pcd-review-details`,
  );
};

const tryGetPCDReviewDetails = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string;
  requestedHistoryId: number;
}) => {
  try {
    const response = await getPCDReviewDetails(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedPcdReviewDetails = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string;
  requestedHistoryId: number;
}) => {
  const response = await tryGetPCDReviewDetails(p);
  if (!response.success) return { ...response, userMessage: 'Failed to get pcd review details' };
  const parsedResponse = pcdReviewDetailsSchema.safeParse(response.data);

  if (parsedResponse.success)
    return { ...parsedResponse, userMessage: 'Successfully got pcd review details' };

  return {
    ...parsedResponse,
    userMessage: 'Failed to parse pcd review details',
    errorDetails: parsedResponse.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
