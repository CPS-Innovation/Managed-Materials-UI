import { z } from 'zod';

export const LeadDefendantDetailsSchema = z.object({ firstNames: z.string(), surname: z.string() });

export const CaseInfoSchema = z.strictObject({
  id: z.number(),
  uniqueReferenceNumber: z.string(),
  leadDefendantDetails: LeadDefendantDetailsSchema,
  numberOfDefendants: z.number(),
});

export const CaseInfoRequestSchema = z.null();

export const CaseInfoResponseSchema = CaseInfoSchema;

export type CaseInfoType = z.infer<typeof CaseInfoSchema>;
export type CaseInfoRequestType = z.infer<typeof CaseInfoRequestSchema>;
export type CaseInfoResponseType = z.infer<typeof CaseInfoResponseSchema>;
