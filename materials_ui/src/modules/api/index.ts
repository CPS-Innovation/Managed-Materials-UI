import { getParsedCase } from './getCase';
import { getParsedCaseInfo } from './getCaseInfo';
import { getParsedCaseSearch } from './getCaseSearch';
import { documentListSchema, documentSchema, getParsedDocumentList } from './getDocuments';
import { getParsedDocumentTypeMappings } from './getDocumentTypeMappings';
import { getParsedLookups } from './getLookups';
import { getParsedPcdReviewCore } from './getPcdReviewCore';
import { getParsedPcdReviewDetails } from './getPcdReviewDetails';
import { getParsedPdf } from './getPdf';

const schemas = { documentSchema, documentListSchema };

export const api = {
  schemas,
  getParsedCase,
  getParsedCaseInfo,
  getParsedCaseSearch,
  getParsedDocumentList,
  getParsedDocumentTypeMappings,
  getParsedLookups,
  getParsedPcdReviewDetails,
  getParsedPcdReviewCore,
  getParsedPdf,
};
