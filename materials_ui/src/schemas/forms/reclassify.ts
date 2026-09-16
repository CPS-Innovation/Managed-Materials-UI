import { z } from 'zod';

const Reclassify_ClassificationEnum = z.enum(['STATEMENT', 'EXHIBIT', 'MG Form', 'OTHER']);

const MaterialNameSchema = z
  .string({ message: 'Enter a material name' })
  .min(1, { message: 'Enter a material name' });

const Reclassification_BaseSchema = z.object({
  classification: Reclassify_ClassificationEnum,
  materialId: z.number(),
  documentType: z.coerce.number({ message: 'Choose a material classification type' }),
  used: z.boolean({ message: 'Choose a material status' }),
});

const Reclassify_TypeStatementSchema = Reclassification_BaseSchema.extend({
  classification: z.literal(Reclassify_ClassificationEnum.enum.STATEMENT),
  hasStatementDate: z.boolean({ message: 'Select if statement has a date' }),
  statementDate: z.coerce.date().optional(),
  statementNumber: z.coerce.number({ message: 'Enter a statement number' }),
  witnessId: z.coerce.number({ message: 'Choose a witness' }),
});

const Reclassify_TypeExhibitSchema = Reclassification_BaseSchema.extend({
  classification: z.literal(Reclassify_ClassificationEnum.enum.EXHIBIT),
  item: z.string({ message: 'Enter the item' }),
  referenceNumber: z
    .string({ message: 'Enter the exhibit reference number' })
    .min(1, 'Enter the exhibit reference number'),
  producedBy: z.string({ message: 'Enter produced by' }).optional(),
  producerId: z.coerce.number().optional(),
  subject: z.string({ message: 'Enter the exhibit name (subject)' }),
});

const Reclassify_TypeMGFormSchema = Reclassification_BaseSchema.extend({
  classification: z.literal(Reclassify_ClassificationEnum.enum['MG Form']),
  subject: MaterialNameSchema,
});

const Reclassify_TypeOtherSchema = Reclassification_BaseSchema.extend({
  classification: z.literal(Reclassify_ClassificationEnum.enum.OTHER),
  subject: MaterialNameSchema,
});

export const Reclassify_ClassificationFormSchema = z
  .discriminatedUnion('classification', [
    Reclassify_TypeStatementSchema,
    Reclassify_TypeExhibitSchema,
    Reclassify_TypeMGFormSchema,
    Reclassify_TypeOtherSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.classification === 'STATEMENT') {
      // if user selects statement has a statement date, we need to validate the date entered
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
    }
  });

export const Reclassify_MaterialNameFormSchema = z.object({ subject: MaterialNameSchema });

export type Reclassify_ClassificationForm = z.infer<typeof Reclassify_ClassificationFormSchema>;
export type Reclassify_MaterialNameFormType = z.infer<typeof Reclassify_MaterialNameFormSchema>;

export const Reclassify_Request_Other_Schema = z.object({
  classification: z.literal('OTHER'),
  documentTypeId: z.number(),
  materialId: z.number(),
  subject: z.string(),
  used: z.boolean().default(true),
});

export const Reclassify_Request_MGForm_Schema = z.object({
  classification: z.literal('OTHER'),
  documentTypeId: z.number(),
  materialId: z.number(),
  subject: z.string(),
  used: z.boolean().default(true),
});

export const Reclassify_Request_Exhibit_Schema = z.object({
  classification: z.literal('EXHIBIT'),
  documentTypeId: z.number(),
  materialId: z.number(),
  exhibit: z.object({
    item: z.string(),
    reference: z.string(),
    existingproducerOrWitnessId: z.number().optional(),
    Producer: z.string().optional(),
    newProducer: z.string().optional(),
  }),
  subject: z.string(),
  used: z.boolean().default(true),
});

export const Reclassify_Request_Statement_Schema = z.object({
  classification: z.literal('STATEMENT'),
  documentTypeId: z.number(),
  materialId: z.number(),
  subject: z.string(),
  used: z.boolean().default(true),
  statement: z.object({
    date: z.string().optional(),
    statementNo: z.coerce.number(),
    witness: z.coerce.number(),
  }),
});

export const Reclassify_Response_Schema = z.object({
  reclassifyCommunication: z.object({ id: z.number() }),
});

export const Reclassify_Orchestrated_Request_Schema = z.object({
  reclassification: z.object({
    urn: z.string(),
    classification: Reclassify_ClassificationEnum,
    documentTypeId: z.number(),
    subject: z.string(),
    used: z.boolean(),
    statement: z.object({ statementNo: z.number(), date: z.string().optional() }).optional(),
    exhibit: z
      .object({
        item: z.string(),
        reference: z.string().default(''),
        existingproducerOrWitnessId: z.number().optional(),
        Producer: z.string().optional(),
        newProducer: z.string().optional(),
      })
      .optional(),
  }),
  witness: z.object({ witnessId: z.number() }).optional(),
});

const Reclassify_Orchestrated_Result_Schema = z
  .object({
    success: z.boolean(),
    operationName: z.string(),
    errorMessage: z.string(),
    resultData: z.object({ reclassifyCommunication: z.object({ id: z.number() }) }).nullable(),
  })
  .nullable();

export const Reclassify_Orchestrated_Response_Schema = z.object({
  overallSuccess: z.boolean(),
  status: z.enum(['Success', 'PartialSuccess', 'Failed']),
  materialId: z.number(),
  transactionId: z.string().uuid(),
  reclassificationResult: Reclassify_Orchestrated_Result_Schema,
  renameMaterialResult: Reclassify_Orchestrated_Result_Schema,
  actionPlanResult: Reclassify_Orchestrated_Result_Schema,
  witnessResult: Reclassify_Orchestrated_Result_Schema,
  errors: z.array(z.string()),
  warnings: z.unknown(),
  contentType: z.literal('application/json'),
});

export type Reclassify_Request_Other_Type = z.infer<typeof Reclassify_Request_Other_Schema>;
export type Reclassify_Request_MGForm_Type = z.infer<typeof Reclassify_Request_MGForm_Schema>;
export type Reclassify_Request_Exhibit_Type = z.infer<typeof Reclassify_Request_Exhibit_Schema>;
export type Reclassify_Request_Statement_Type = z.infer<typeof Reclassify_Request_Statement_Schema>;
export type Reclassify_Response_Type = z.infer<typeof Reclassify_Response_Schema>;

export type Reclassify_ClassificationEnumType = z.infer<typeof Reclassify_ClassificationEnum>;

export type Reclassify_TypeStatementType = z.infer<typeof Reclassify_TypeStatementSchema>;

export type Reclassify_TypeExhibitType = z.infer<typeof Reclassify_TypeExhibitSchema>;
export type Reclassify_TypeMGFormType = z.infer<typeof Reclassify_TypeMGFormSchema>;
export type Reclassify_TypeOtherType = z.infer<typeof Reclassify_TypeOtherSchema>;

export type Reclassify_Orchestrated_Request_Type = z.infer<
  typeof Reclassify_Orchestrated_Request_Schema
>;

export type Reclassify_Orchestrated_Response_Type = z.infer<
  typeof Reclassify_Orchestrated_Response_Schema
>;
