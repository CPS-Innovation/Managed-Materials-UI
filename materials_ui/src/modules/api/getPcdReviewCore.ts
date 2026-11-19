import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const pcdReviewCoreMap = { EarlyAdvice: 0, InitialReview: 1, PreChargeDecisionAnalysis: 2 };

const pcdReviewCoreTypeSchema = z.union([
  z.literal(pcdReviewCoreMap.EarlyAdvice),
  z.literal(pcdReviewCoreMap.InitialReview),
  z.literal(pcdReviewCoreMap.PreChargeDecisionAnalysis),
]);

const pcdReviewCoreSchema = z.array(
  z.object({ date: z.string(), id: z.coerce.number(), type: pcdReviewCoreTypeSchema }),
);

const getPcdReviewCore = async (p: { axiosInstance: AxiosInstance; caseId: string }) => {
  return p.axiosInstance.get<unknown>(`cases/${p.caseId}/pcd-review-core`);
};

const tryGetPcdReviewCore = async (p: { axiosInstance: AxiosInstance; caseId: string }) => {
  try {
    const response = await getPcdReviewCore(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedPcdReviewCore = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string;
}) => {
  const response = await tryGetPcdReviewCore(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch lookups' };

  const parsedResponse = pcdReviewCoreSchema.safeParse(response.data);
  if (!parsedResponse.success)
    return { ...parsedResponse, userMessage: 'Failed to parse pcd review core' };

  return { ...parsedResponse, userMessage: 'Successfully fetched pcd review core' };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
