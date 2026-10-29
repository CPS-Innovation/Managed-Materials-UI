import { z } from 'zod';

const DefendantDetailsSchema = z.object({
  id: z.number(),
  firstNames: z.string(),
  surname: z.string(),
  dob: z.string().nullish(),
});

const HeadlineChargeSchema = z.object({
  date: z.string().nullable(),
  nextHearingDate: z.string().nullable(),
});

const ChargesSchema = z.array(z.object({ id: z.number(), shortDescription: z.string() }));

const DefendantSchema = z.array(
  z.object({ id: z.number(), charges: ChargesSchema, proposedCharges: z.array(z.unknown()) }),
);

export const CaseSchema = z.object({
  id: z.number(),
  uniqueReferenceNumber: z.string(),
  isCaseCharged: z.boolean(),
  numberOfDefendants: z.number(),
  leadDefendantDetails: DefendantDetailsSchema,
  headlineCharge: HeadlineChargeSchema,
  defendants: DefendantSchema,
});
export const CasesSchema = z.array(CaseSchema);

export type CaseType = z.infer<typeof CaseSchema>;
export type CasesType = z.infer<typeof CasesSchema>;
export type CaseDetailsType = CaseType[];
