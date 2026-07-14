import { z } from 'zod';

export const DocumentGroup = z.enum(['Exhibit', 'MG Form', 'Other', 'Statement']);

export const DocumentType = z.object({
  id: z.number(),
  name: z.string(),
  group: DocumentGroup,
  category: z.string(),
});

export const DocumentTypeResponseSchema = z.array(DocumentType);

export type DocumentType = z.infer<typeof DocumentType>;
export type DocumentTypeResponseType = z.infer<typeof DocumentTypeResponseSchema>;
