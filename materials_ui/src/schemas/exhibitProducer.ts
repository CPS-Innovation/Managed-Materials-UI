import { z } from 'zod';

export const ExhibitProducerSchema = z.object({ id: z.number(), producer: z.string() });

export const ExhibitProducerResponseSchema = z.object({
  exhibitProducers: z.array(ExhibitProducerSchema),
});

export type ExhibitProducerType = z.infer<typeof ExhibitProducerSchema>;
export type ExhibitProducerResponseType = z.infer<typeof ExhibitProducerResponseSchema>;
