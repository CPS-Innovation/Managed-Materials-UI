import { safeJsonParse } from '../materials_components/DocumentSelectAccordion/utils/generalUtils';
import { JourneyContext, JourneyContextSchema } from './journeyContext';

export const JOURNEY_CONTEXT_STORAGE_KEY = 'materials-ui-journey-context';

export const saveJourneyContext = (context: JourneyContext) => {
  sessionStorage.setItem(JOURNEY_CONTEXT_STORAGE_KEY, JSON.stringify(context));
};

export const getJourneyContext = (caseId: number | string) => {
  const json = safeJsonParse(sessionStorage.getItem(JOURNEY_CONTEXT_STORAGE_KEY));
  const result = JourneyContextSchema.safeParse(json.success ? json.data : null);

  return result.success && result.data.caseId === Number(caseId) ? result.data : null;
};
