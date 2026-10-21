import { z } from 'zod';

import { getRoute } from '../hooks/ui/useAppRoute';
import { safeJsonParse } from '../materials_components/DocumentSelectAccordion/utils/generalUtils';

const CTX_QUERY_PARAM = 'ctx';

export const HANDOVER_ERRORS = {
  NO_CTX: 'The link has no ctx parameter.',
  INVALID_JSON: 'The ctx parameter is not valid JSON.',
  NOT_AN_OBJECT: 'The ctx parameter is not a JSON object.',
  invalidField: (field: string) => `The ctx parameter has a missing or invalid ${field}.`,
};

const CmsIdSchema = z.number().int().positive();

const CaseContextSchema = z.object({
  caseId: CmsIdSchema,
  materialId: CmsIdSchema.optional(),
  documentId: CmsIdSchema.optional(),
});

const DefaultJourneyContextSchema = CaseContextSchema.extend({ journey: z.literal('default') });

export const JourneyContextSchema = z.discriminatedUnion('journey', [DefaultJourneyContextSchema]);

export type JourneyContext = z.infer<typeof JourneyContextSchema>;

type ParseResult = { success: true; context: JourneyContext } | { success: false; reason: string };

export const parseJourneyContext = (search: string): ParseResult => {
  const ctx = new URLSearchParams(search).get(CTX_QUERY_PARAM);
  if (!ctx) return { success: false, reason: HANDOVER_ERRORS.NO_CTX };

  const json = safeJsonParse(ctx);
  if (!json.success) return { success: false, reason: HANDOVER_ERRORS.INVALID_JSON };

  const result = JourneyContextSchema.safeParse(json.data);
  if (result.success) return { success: true, context: result.data };

  const field = result.error.issues[0]?.path.join('.');
  if (!field) return { success: false, reason: HANDOVER_ERRORS.NOT_AN_OBJECT };

  return { success: false, reason: HANDOVER_ERRORS.invalidField(field) };
};

export const getJourneyRoute = (context: JourneyContext) => {
  switch (context.journey) {
    case 'default':
      return getRoute({ routeName: 'MATERIALS', prefix: String(context.caseId) });
  }
};
