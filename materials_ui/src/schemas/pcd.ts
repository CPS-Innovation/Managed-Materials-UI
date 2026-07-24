import { z } from 'zod';

export const PCDListingSchema = z.object({
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
  rank: z.string(),
  name: z.string(),
  number: z.string(),
});

export const PCDMaterialSchema = z.object({ subject: z.string(), date: z.string() });

export const PCDSuspect = z.object({
  surname: z.string(),
  firstNames: z.string(),
  dob: z.string(),
  bailConditions: z.string(),
  bailDate: z.string(),
  remandStatus: z.string(),
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
  comments: z.object({ text: z.string(), textWithCmsMarkup: z.string() }),
  suspects: z.array(PCDSuspect),
  policeContactDetails: z.array(PCDPoliceContactSchema),
  materialProvided: z.array(PCDMaterialSchema),
});

export const PCDListingResponseSchema = z.array(PCDListingSchema);
export const PCDDetailsResponseSchema = PCDDetailsSchema;

export type PCDListingType = z.infer<typeof PCDListingSchema>;
export type PCDListingResponseType = z.infer<typeof PCDListingResponseSchema>;
export type PCDDetailsResponseType = z.infer<typeof PCDDetailsResponseSchema>;
