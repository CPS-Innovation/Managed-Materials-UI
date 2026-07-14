import { z } from 'zod';

export const BulkSetUnusedSchema = z.object({ materialId: z.number(), subject: z.string() });

export const BulkSetUnusedRequestSchema = z.array(BulkSetUnusedSchema);
export const BulkSetUnusedResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  reclassifiedMaterials: z.array(BulkSetUnusedSchema),
  failedMaterials: z.array(
    z.object({ materialId: z.number(), subject: z.string(), errorMessage: z.string() }),
  ),
});

export type BulkSetUnusedType = z.infer<typeof BulkSetUnusedSchema>;
export type BulkSetUnusedRequestType = z.infer<typeof BulkSetUnusedRequestSchema>;
export type BulkSetUnusedResponseType = z.infer<typeof BulkSetUnusedResponseSchema>;
