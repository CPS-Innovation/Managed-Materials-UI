import { z } from 'zod';

export const pcdRequestListingSchema = z.object({
  id: z.number(),
  type: z.string(),
  decisionRequiredBy: z.string(),
  decisionRequested: z.string(),
});

export const PCDCaseOutlineSchema = z.object({
  heading: z.string(),
  text: z.string(),
  textWithCmsMarkup: z.string(),
});

export const PCDPoliceContactSchema = z.object({
  role: z.string(),
  rank: z.string().nullish(),
  name: z.string(),
  number: z.string().nullish(),
});

export const PCDMaterialSchema = z.object({ subject: z.string(), date: z.string() });

export const PCDSuspect = z.object({
  surname: z.string(),
  firstNames: z.string(),
  dob: z.string().nullish(),
  bailConditions: z.string().nullish(),
  bailDate: z.string().nullish(),
  remandStatus: z.string().nullish(),
  proposedCharges: z.array(
    z.object({
      charge: z.string(),
      earlyDate: z.string(),
      lateDate: z.string(),
      location: z.string(),
      category: z.string(),
    }),
  ),
});

export const PCDDetailsSchema = z.object({
  id: z.number(),
  type: z.string(),
  decisionRequiredBy: z.string(),
  decisionRequested: z.string(),
  caseOutline: z.array(PCDCaseOutlineSchema),
  comments: z.object({ text: z.string().nullish(), textWithCmsMarkup: z.string().nullish() }),
  suspects: z.array(PCDSuspect),
  policeContactDetails: z.array(PCDPoliceContactSchema),
  materialProvided: z.array(PCDMaterialSchema),
});

export const pcdRequestListingsSchema = z.array(pcdRequestListingSchema);
export const pcdRequestSchema = PCDDetailsSchema;

export type TPcdRequestListing = z.infer<typeof pcdRequestListingSchema>;
export type TPcdRequestListings = z.infer<typeof pcdRequestListingsSchema>;
export type TPcdRequest = z.infer<typeof pcdRequestSchema>;
