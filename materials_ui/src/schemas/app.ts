import { z } from 'zod';
import { BannerSchema } from './banner';

export const AppContextSchema = z.object({
  banner: BannerSchema.optional(),
  wmReturnUrl: z.string().nullable(),
});

export const AppErrorSchema = z.enum(['auth', 'materialRetrieval', 'serviceDown']).optional();

export type AppContextType = z.infer<typeof AppContextSchema>;
export type AppErrorType = z.infer<typeof AppErrorSchema>;
