import { TRedaction } from '../../PdfRedactor/utils/coordUtils';
import { TDeletion } from '../../PdfRedactor/utils/deletionUtils';

export type TRedactionDetail = { redactionId: string; randomId: string };
export type TDeletionDetail = { deletionId: string; randomId: string };

export const combineRedactionsWithRedactionDetails = (p: {
  redactions: TRedaction[];
  redactionDetails: TRedactionDetail[];
}) => {
  const redactionsWithDetails = p.redactions
    .map((x) => {
      const thisDetails = p.redactionDetails.find((y) => y.redactionId === x.id);
      if (!thisDetails) return undefined;
      return { ...x, ...thisDetails };
    })
    .filter((x) => !!x);
  return redactionsWithDetails;
};
export const combineDeletionsWithDeletionDetails = (p: {
  deletions: TDeletion[];
  deletionDetails: TDeletionDetail[];
}) => {
  const deletionsWithDetails = p.deletions
    .map((x) => {
      const thisDetails = p.deletionDetails.find((y) => y.deletionId === x.id);
      if (!thisDetails) return undefined;
      return { ...x, ...thisDetails };
    })
    .filter((x) => !!x);
  return deletionsWithDetails;
};
