import { z } from 'zod';

export const CaseLockStatusResponseSchema = z.object({
  caseLockedMessage: z.string().nullable(),
  isLocked: z.boolean(),
  isLockedByCurrentUser: z.boolean(),
  lockedByUser: z.string().nullable(),
});

export type CaseLockStatusResponseType = z.infer<typeof CaseLockStatusResponseSchema>;
