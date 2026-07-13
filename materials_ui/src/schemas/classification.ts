import { z } from 'zod';

export const AutoReclassifyMaterialSchema = z.object({
  materialId: z.number(),
  subject: z.string(),
});

export const AutoReclassifyResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  reclassifiedMaterials: z.array(AutoReclassifyMaterialSchema),
  failedMaterials: z.array(AutoReclassifyMaterialSchema),
});

export type AutoReclassifyResponseType = z.infer<typeof AutoReclassifyResponseSchema>;
