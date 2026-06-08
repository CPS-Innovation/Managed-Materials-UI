import { z } from 'zod';

export const cmsDocTypeSchema = z.object({
  documentTypeId: z.number(),
  documentType: z.string(),
  documentCategory: z.string()
});

export const DocumentSchema = z.object({
  parentId: z.string(),
  status: z.string(),
  childId: z.number(),
  cmsDocType: cmsDocTypeSchema,
  cmsOriginalFileName: z.string(),
  presentationTitle: z.string(),
  cmsFileCreatedDate: z.string(),
  isOcrProcessed: z.boolean(),
  categoryListOrder: z.number(),
  presentationFlags: z.object({
    read: z.literal('Ok'),
    write: z.literal('Ok')
  }),
  parentDocumentId: z.string().nullable(),
  witnessId: z.number().nullable(),
  hasFailedAttachments: z.boolean(),
  hasNotes: z.boolean(),
  conversionStatus: z.string(),
  piiVersionId: z.number().nullable(),
  isUnused: z.boolean(),
  isInbox: z.boolean(),
  classification: z.string(),
  isWitnessManagement: z.boolean(),
  canReclassify: z.boolean(),
  canRename: z.boolean(),
  renameStatus: z.string(),
  reference: z.string().nullable()
});

export const SearchResultSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  childId: z.string(),
  fileName: z.string(),
  pageIndex: z.number(),
  lineIndex: z.number(),
  pageHeight: z.number(),
  pageWidth: z.number(),
  text: z.string(),
  words: z.array(
    z.object({
      boundingBox: z.array(z.number()).nullable(),
      text: z.string(),
      matchType: z.array(z.string())
    })
  )
});

export const SearchTermResultSchema = z.object({
  parentId: z.string(),
  documentTitle: z.string(),
  cmsFileCreatedDate: z.string(),
  cmsDocType: cmsDocTypeSchema,
  matches: z.array(
    z.object({
      text: z.string(),
      pageIndex: z.number(),
      lineIndex: z.number(),
      pageHeight: z.number(),
      pageWidth: z.number(),
      words: z.array(
        z.object({
          boundingBox: z.array(z.number()).nullable(),
          text: z.string(),
          matchType: z.array(z.string())
        })
      )
    })
  ),
  status: z.string(),
  isUnused: z.boolean(),
  presentationTitle: z.string(),
  cmsOriginalFileName: z.string(),
  conversionStatus: z.string(),
  resultsPerDocumentCount: z.number().optional()
});
export const documentListSchema = z.array(DocumentSchema);
export type DocumentResultType = z.infer<typeof documentListSchema>;
export type SearchResultType = z.infer<typeof SearchResultSchema>;
export type SearchTermResultType = z.infer<typeof SearchTermResultSchema>;
export type CmsDocType = z.infer<typeof cmsDocTypeSchema>;
