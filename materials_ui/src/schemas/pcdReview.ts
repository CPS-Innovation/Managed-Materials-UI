import { z } from 'zod';

import { PcdReviewCoreType } from '../constants/enum';

const PcdReviewCoreTypeSchema = z.union([
  z.literal(PcdReviewCoreType.EarlyAdvice),
  z.literal(PcdReviewCoreType.InitialReview),
  z.literal(PcdReviewCoreType.PreChargeDecisionAnalysis)
]);

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

const CurrentEventSchema = z.object({
  id: z.number(),
  name: z.string(),
  date: z.string(),
  authorOrVenue: z.string(),
  type: z.number()
});

const NextEventLinkSchema = z.array(
  z.object({
    id: z.number(),
    href: z.string(),
    rel: z.string(),
    type: z.string()
  })
);

const MonitoringCodesSchema = z.array(
  z.object({
    code: nullableString,
    description: z.string(),
    type: nullableNumber,
    disabled: z.boolean(),
    isAssigned: z.boolean()
  })
);

const DgAssessmentItemsSchema = z.array(
  z.object({
    itemName: nullableString,
    title: nullableString,
    description: nullableString,
    comment: nullableString
  })
);

const DgDetailsSchema = z.object({
  assessmentApplicable: z.boolean().nullable(),
  datePapersReceived: nullableString,
  dgAssessmentItems: DgAssessmentItemsSchema,
  policeResponse: nullableString,
  principalOffenceCategory: nullableString,
  stageAssessmentCompleted: nullableString,
  submissionDgCompliant: nullableString
});

const PCDInitialReviewSchema = z.object({
  allocation: nullableString,
  caseId: z.number(),
  caseSummary: z.string(),
  consultationType: z.string(),
  currentEvent: CurrentEventSchema,
  dgDetails: DgDetailsSchema,
  dgSummary: nullableString,
  disclosureActionsAndIssues: z.string(),
  europeanCourtOfHumanRights: nullableString,
  eventDate: z.string(),
  evidentialAssessment: nullableString,
  historyEventType: z.number(),
  id: z.number(),
  instructionsToOperationsDeliveryOrAdvocate: nullableString,
  isCompleted: z.boolean(),
  monitoringCodes: MonitoringCodesSchema,
  nextEventLink: NextEventLinkSchema,
  prosecutorDeclaration: z.string(),
  publicInterestAssessment: nullableString,
  reviewSummary: nullableString,
  trialStrategy: z.string(),
  witnessOrVictimInformationAndActions: nullableString
});

const DefendantDecisionSchema = z.object({
  decision: z.number(),
  decisionDescription: z.string(),
  defendantName: z.string(),
  id: z.number(),
  keyFactor: nullableString,
  natureOfDecision: nullableString,
  pcdPrincipalOffenceCategory: nullableString,
  proposedCharge: z.string(),
  publicInterestCode: nullableString,
  reason: z.string(),
  reasonCode: z.string(),
  returnBailDate: nullableString,
  specifiedCharges: nullableString
});

const DefendantDecisionsSchema = z.array(DefendantDecisionSchema);

const PCDHistoryActionPlanSchema = z.array(
  z.object({
    actionDate: z.string(),
    actionPoint: z.string(),
    actionType: z.string(),
    cpsCovidUrgency: nullableString,
    entryDate: z.string(),
    policeCovidUrgency: nullableString,
    status: z.string(),
    suspect: z.string()
  })
);

const PCDReviewSchema = z.object({
  actionPlan: z.boolean(),
  author: z.string(),
  caseId: z.number(),
  cpsCovidUrgency: nullableString,
  currentEvent: CurrentEventSchema,
  decisionMadeBy: z.string(),
  decisionMadeDateTime: z.string(),
  decisionRequestedDate: z.string(),
  defendantDecisions: DefendantDecisionsSchema,
  eventDate: z.string(),
  historyEventType: z.number(),
  id: z.number(),
  investigationStage: z.string(),
  isCompleted: z.boolean(),
  method: nullableString,
  nextEventLink: NextEventLinkSchema,
  pcdHistoryActionPlan: PCDHistoryActionPlanSchema,
  policeCovidUrgency: nullableString,
  urn: nullableString
});

export const PCDReviewCoreSchema = z.array(
  z.object({
    date: z.string(),
    id: z.coerce.number(),
    type: PcdReviewCoreTypeSchema
  })
);

const ChargeDetailSchema = z.object({
  code: z.string(),
  description: z.string()
});

const PreChargeDefendantDecisionSchema = DefendantDecisionSchema.extend({
  chargeDetails: z.array(ChargeDetailSchema)
});

const LinkedCaseUrnSchema = z.object({
  urn: z.string(),
  asn: z.string(),
  pncId: nullableString,
  policeCC: nullableString
});

const PreChargeDecisionAnalysisOutcomeSchema = PCDInitialReviewSchema.extend({
  dppConsent: nullableString,
  linkedCaseUrns: z.array(LinkedCaseUrnSchema)
});

const PreChargeDecisionOutcomeDetailSchema = PCDReviewSchema.extend({
  defendantDecisions: z.array(PreChargeDefendantDecisionSchema)
});

export const PCDReviewDetailsSchema = z.object({
  preChargeDecisionAnalysisOutcome: PreChargeDecisionAnalysisOutcomeSchema,
  preChargeDecisionOutcome: PreChargeDecisionOutcomeDetailSchema
});

export type PCDInitialReviewResponseType = z.infer<
  typeof PCDInitialReviewSchema
>;
export type PCDReviewResponseType = z.infer<typeof PCDReviewSchema>;
export type CaseHistoryResponseType = z.infer<typeof CurrentEventSchema>;
export type PCDReviewCoreResponseType = z.infer<typeof PCDReviewCoreSchema>;
export type PCDReviewDetailsResponseType = z.infer<
  typeof PCDReviewDetailsSchema
>;
