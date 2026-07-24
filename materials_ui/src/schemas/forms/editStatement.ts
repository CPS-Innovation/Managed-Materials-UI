import { z } from 'zod';

export const BaseEditStatementSchema = z.object({
  hasStatementDate: z.boolean({ message: 'Select if statement has a date' }),
  materialId: z.number(),
  statementDate: z.coerce.date().optional(),
  statementNumber: z.string({ message: 'Enter a statement number' }),
  used: z.boolean({ message: 'Choose a material status' }),
  witnessId: z.coerce.number({ message: 'Choose a witness' }),
});

export const EditExhibitSchema = z.object({
  documentType: z.number(),
  item: z.string({ message: 'Enter the item' }),
  materialId: z.number(),
  reference: z
    .string({ message: 'Enter the exhibit reference number' })
    .min(1, 'Enter the exhibit reference number'),
  subject: z.string({ message: 'Enter the exhibit name (subject)' }),
  used: z.boolean({ message: 'Choose a material status' }),
  producedBy: z.string({ message: 'Enter produced by' }).optional(),
  existingproducerOrWitnessId: z.coerce.number().optional(),
  newProducer: z.string().optional(),
});

export const EditStatementSchema = BaseEditStatementSchema.superRefine((data, ctx) => {
  if (data.hasStatementDate) {
    const date = data.statementDate;

    // Missing or invalid date
    if (!date || isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter the statement date',
        path: ['statementDate'],
      });
      return;
    }

    // Date in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const input = new Date(date);
    input.setHours(0, 0, 0, 0);

    if (input > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date cannot be in the future',
        path: ['statementDate'],
      });
    }
  }
});

export const EditStatementRequestSchema = BaseEditStatementSchema.omit({
  hasStatementDate: true,
}).extend({ statementDate: z.string().nullable() });

export const EditStatementResponseSchema = z.object({
  updateStatement: z.object({ id: z.number() }),
});

export const EditExhibitResponseSchema = z.object({ updateExhibit: z.object({ id: z.number() }) });

export type EditStatementType = z.infer<typeof EditStatementSchema>;
export type EditExhibitType = z.infer<typeof EditExhibitSchema>;
export type EditStatementRequestType = z.infer<typeof EditStatementRequestSchema>;
export type EditStatementResponseType = z.infer<typeof EditStatementResponseSchema>;

export type EditExhibitRequestType = z.infer<typeof EditStatementRequestSchema>;

export type EditExhibitResponseType = z.infer<typeof EditExhibitResponseSchema>;
