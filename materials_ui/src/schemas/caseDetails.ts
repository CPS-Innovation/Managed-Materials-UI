import { z } from 'zod';

const DefendantDetailsSchema = z.object({
  id: z.number(),
  listOrder: z.number(),
  firstNames: z.string(),
  surname: z.string(),
  organisationName: z.string(),
  dob: z.string(),
  age: z.string(),
  youth: z.boolean(),
  type: z.string(),
});

const HeadlineChargeSchema = z.object({
  charge: z.string().nullable(),
  date: z.string().nullable(),
  earlyDate: z.string().nullable(),
  lateDate: z.string().nullable(),
  nextHearingDate: z.string().nullable(),
});

const CustodyTimeLimitSchema = z.object({
  expiryDate: z.string().nullable(),
  expiryDays: z.number().nullable(),
  expiryIndicator: z.boolean().nullable(),
});

const ChargesSchema = z.array(
  z.object({
    id: z.number(),
    listOrder: z.number(),
    isCharged: z.boolean(),
    nextHearingDate: z.string().nullable(),
    earlyDate: z.string().nullable(),
    lateDate: z.string().nullable(),
    code: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    custodyTimeLimit: CustodyTimeLimitSchema,
  }),
);

const DefendantSchema = z.array(
  z.object({
    id: z.number(),
    listOrder: z.number(),
    defendantDetails: DefendantDetailsSchema,
    custodyTimeLimit: CustodyTimeLimitSchema,
    charges: ChargesSchema,
    proposedCharges: z.array(z.unknown()),
  }),
);

const WitnessSchema = z.array(
  z.object({
    id: z.number(),
    shoulderNumber: z.number(),
    title: z.string(),
    name: z.string(),
    hasStatements: z.boolean(),
    listOrder: z.null(),
    child: z.boolean(),
    expert: z.boolean(),
    greatestNeed: z.boolean(),
    prisoner: z.boolean(),
    interpreter: z.boolean(),
    vulnerable: z.boolean(),
    police: z.boolean(),
    professional: z.boolean(),
    specialNeeds: z.boolean(),
    intimidated: z.boolean(),
    victim: z.boolean(),
  }),
);

export const caseDetailsSchema = z.array(
  z.object({
    id: z.number(),
    uniqueReferenceNumber: z.string(),
    isCaseCharged: z.boolean(),
    numberOfDefendants: z.number(),
    owningUnit: z.string(),
    leadDefendantDetails: DefendantDetailsSchema,
    headlineCharge: HeadlineChargeSchema,
    defendants: DefendantSchema,
    witnesses: WitnessSchema,
    preChargeDecisionRequests: z.array(z.unknown()),
  }),
);

export type CaseDetailsType = z.infer<typeof caseDetailsSchema>;
