import { describe, expect, it } from 'vitest';

import { mapReclassifyStatement } from '../../components/forms/Reclassify/mappers/mapReclassifyStatement';
import type { ReclassifyFormData } from '../../hooks';

const URN = '45CD0303421';

const aStatement = (overrides: Partial<ReclassifyFormData> = {}) =>
  ({
    classification: 'STATEMENT',
    materialId: 55,
    documentType: 1002,
    subject: 'Statement of John Smith',
    used: true,
    hasStatementDate: false,
    statementNumber: 3,
    witnessId: 77,
    ...overrides,
  }) as ReclassifyFormData;

describe('mapReclassifyStatement', () => {
  it('rejects form data that is not a statement', () => {
    expect(() => mapReclassifyStatement(aStatement({ classification: 'EXHIBIT' }), URN)).toThrow(
      'Not a valid classification',
    );
  });

  it('maps the reclassification against the chosen case witness', () => {
    const request = mapReclassifyStatement(aStatement(), URN);

    expect(request).toEqual({
      reclassification: {
        urn: URN,
        classification: 'STATEMENT',
        documentTypeId: 1002,
        subject: 'Statement of John Smith',
        used: true,
        statement: { statementNo: 3 },
      },
      witness: { witnessId: 77 },
    });
  });

  it('includes the statement date only when the statement has one', () => {
    const withDate = mapReclassifyStatement(
      aStatement({ hasStatementDate: true, statementDate: new Date(2026, 4, 12) }),
      URN,
    );

    expect(withDate.reclassification.statement).toEqual({ statementNo: 3, date: '2026-05-12' });
  });

  it('never asks the orchestrator to create a witness or an action plan', () => {
    const request = mapReclassifyStatement(aStatement(), URN);

    expect(request).not.toHaveProperty('actionPlan');
    expect(request.witness).toEqual({ witnessId: 77 });
  });
});
