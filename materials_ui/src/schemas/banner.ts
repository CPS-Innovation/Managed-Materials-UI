import { z } from 'zod';

export const BannerTypeSchema = z.enum(['success', 'important', 'error']);

export const BannerSchema = z.object({
  type: BannerTypeSchema.optional(),
  header: z.string(),
  content: z.string().optional(),
  identifier: z.string().optional(),
});

export type BannerTypeEnum = z.infer<typeof BannerTypeSchema>;
export type BannerType = z.infer<typeof BannerSchema>;
