import { z } from 'zod';

export const WitnessListItemSchema = z.object({
  caseId: z.number(),
  firstName: z.string(),
  surname: z.string(),
  witnessId: z.number(),
});

export const WitnessListSchema = z.array(WitnessListItemSchema);

export const WitnessListResponseSchema = z.object({ witnesses: WitnessListSchema });

export const WitnessStatementSchema = z.object({ id: z.number(), title: z.number() });

export const WitnessStatementResponseSchema = z.object({
  statementsForWitness: z.array(WitnessStatementSchema),
});

export const CreateWitnessRequestSchema = z.object({ FirstName: z.string(), Surname: z.string() });

export const CreateWitnessResponseSchema = z.number();

export type WitnessListItemType = z.infer<typeof WitnessListItemSchema>;
export type WitnessListResponseType = z.infer<typeof WitnessListResponseSchema>;
export type WitnessStatementResponseType = z.infer<typeof WitnessStatementResponseSchema>;
export type WitnessStatementType = z.infer<typeof WitnessStatementSchema>;

export type CreateWitnessResponseType = z.infer<typeof CreateWitnessResponseSchema>;
export type CreateWitnessRequestType = z.infer<typeof CreateWitnessRequestSchema>;
