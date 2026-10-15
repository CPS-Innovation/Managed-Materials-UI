import { z } from 'zod';

export const CaseMaterialsSchema = z.object({
  id: z.number(),
  materialId: z.number(),
  documentId: z.number(),
  // TODO: remove. parentId is temporary until the backend drops prefixes
  parentId: z.string(),
  originalFileName: z.string(),
  subject: z.string(),
  documentTypeId: z.number(),
  category: z.string(),
  type: z.string(),
  hasAttachments: z.boolean(),
  status: z.string(),
  readStatus: z.string(),
  statusLabel: z.string().optional(),
  method: z.string(),
  direction: z.string(),
  party: z.string(),
  date: z.date(),
  recordedDate: z.date().nullable(),
  witnessId: z.number().nullable(),
  title: z.string().nullable(),
  producer: z.string().nullable(),
  item: z.string().nullable(),
  existingProducerOrWitnessId: z.number().nullable(),
  isReclassifiable: z.boolean(),
  cmsDocType: z.object({
    documentTypeId: z.number(),
    documentType: z.string().nullable(),
    documentCategory: z.string(),
  }),
  presentationFlags: z.object({ read: z.string(), write: z.string() }),
  hasNotes: z.boolean(),
  isUnused: z.boolean(),
  reference: z.string().nullable(),
});

export const CaseMaterialDataSchema = z.enum(['materials', 'communications']);
export type CaseMaterialDataType = z.infer<typeof CaseMaterialDataSchema>;

export const CaseMaterialsRequestSchema = z.array(CaseMaterialsSchema);
export const CaseMaterialsResponseSchema = z.array(CaseMaterialsSchema);

export const CaseMaterialRenameSchema = z.object({ materialId: z.number(), subject: z.string() });

export const CaseMaterialRenameRequestSchema = CaseMaterialRenameSchema;
export const CaseMaterialRenameResponseSchema = z.object({
  updateCommunication: z.object({ id: z.coerce.string() }),
});

export type CaseMaterialsType = z.infer<typeof CaseMaterialsSchema>;
export type CaseMaterialsRequestType = z.infer<typeof CaseMaterialsRequestSchema>;
export type CaseMaterialsResponseType = z.infer<typeof CaseMaterialsResponseSchema>;
export type CaseMaterialRenameType = z.infer<typeof CaseMaterialRenameSchema>;
export type CaseMaterialRenameRequestType = z.infer<typeof CaseMaterialRenameRequestSchema>;
export type CaseMaterialRenameResponseType = z.infer<typeof CaseMaterialRenameResponseSchema>;

export const CaseMaterialReadStatusRequestSchema = z.object({
  materialId: z.number(),
  state: z.string(),
  correspondenceId: z.string().uuid(),
});

export const CaseMaterialReadStatusResponseSchema = z.object({
  completeCommunicationData: z.object({ id: z.number() }),
});

export type CaseMaterialReadStatusRequestType = z.infer<typeof CaseMaterialReadStatusRequestSchema>;

export type CaseMaterialReadStatusResponseType = z.infer<
  typeof CaseMaterialReadStatusResponseSchema
>;

export const CaseMaterialDocumentPreviewSchema = z.object({
  Blob: z.object({ size: z.number(), type: z.string() }),
});

export type CaseMaterialDocumentPreviewResponseType = z.infer<
  typeof CaseMaterialDocumentPreviewSchema
>;

export const CaseMaterialDiscardRequestSchema = z.object({
  materialId: z.number(),
  discardReason: z.string(),
  discardReasonDescription: z.string(),
});

export const CaseMaterialDiscardResponseSchema = z.object({
  discardMaterialData: z.object({ id: z.number() }),
});

export type CaseMaterialDiscardRequestType = z.infer<typeof CaseMaterialDiscardRequestSchema>;
export type CaseMaterialDiscardResponseType = z.infer<typeof CaseMaterialDiscardResponseSchema>;
