import { z } from 'zod';

export const DefendantSchema = z.object({
  id: z.number(),
  caseId: z.number(),
  listOrder: z.number(),
  type: z.string(),
  firstNames: z.string(),
  surname: z.string(),
  dob: z.string().nullable(),
  policeRemandStatus: z.string().nullable(),
  youth: z.boolean(),
  custodyTimeLimit: z.string().nullable(),
  offences: z.array(
    z.object({
      id: z.number(),
      listOrder: z.number(),
      code: z.string(),
      type: z.string(),
      active: z.string(),
      description: z.string(),
      fromDate: z.string().nullable(),
      toDate: z.string().nullable(),
      latestPlea: z.string(),
      latestVerdict: z.string(),
      disposedReason: z.string(),
      lastHearingOutcome: z.string().nullable(),
      custodyTimeLimit: z.string().nullable(),
      latestPleaDescription: z.string(),
    }),
  ),
  charges: z.array(z.unknown()),
  proposedCharges: z.array(z.unknown()),
  nextHearing: z.string().nullable(),
  defendantPcdReview: z.string().nullable(),
  solicitor: z.string().nullable(),
  personalDetail: z.object({
    address: z.string().nullable(),
    email: z.string().email().nullable(),
    ethnicity: z.string().nullable(),
    gender: z.string(),
    occupation: z.string().nullable(),
    homePhoneNumber: z.string().nullable(),
    mobilePhoneNumber: z.string().nullable(),
    workPhoneNumber: z.string().nullable(),
    preferredCorrespondenceLanguage: z.string(),
    religion: z.string(),
    guardian: z.string().nullable(),
  }),
});

export const DefendantsResponseSchema = z.object({ defendants: z.array(DefendantSchema) });

export type DefendantType = z.infer<typeof DefendantSchema>;
export type DefendantsResponseType = z.infer<typeof DefendantsResponseSchema>;
