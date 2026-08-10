import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mapReclassifyStatement } from '../../components/forms/Reclassify/mappers/mapReclassifyStatement';
import type { ReclassifyFormData } from '../../hooks';
import type { Reclassify_WitnessAndActionPlanType } from '../../schemas/forms/reclassify';

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

const aWitnessActionPlan = (
  overrides: Partial<Reclassify_WitnessAndActionPlanType> = {},
): Reclassify_WitnessAndActionPlanType =>
  ({
    firstName: 'Jane',
    surname: 'Doe',
    actionPointText: 'Contested identification',
    requestType: 'KWD',
    defendantId: 9,
    actionPlan: 'Obtain further detail',
    dateNeeded: new Date(2026, 8, 1),
    followUp: false,
    ...overrides,
  }) as Reclassify_WitnessAndActionPlanType;

describe('mapReclassifyStatement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 6, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects form data that is not a statement', () => {
    expect(() => mapReclassifyStatement(aStatement({ classification: 'EXHIBIT' }), URN)).toThrow(
      'Not a valid classification',
    );
  });

  it('maps the reclassification and keeps an already chosen witness', () => {
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

  it('adds a new witness and an action plan when no witness is chosen', () => {
    const request = mapReclassifyStatement(
      aStatement({ witnessId: 0, witnessActionPlan: aWitnessActionPlan() }),
      URN,
    );

    expect(request.witness).toEqual({ firstName: 'Jane', surname: 'Doe' });
    expect(request.actionPlan).toEqual({
      urn: URN,
      fullDefendantName: 'DOE, Jane',
      defendantId: 9,
      date: '2026-08-06',
      dateExpected: '2026-09-01',
      dateTimeCreated: '2026-08-06',
      type: 'ModifyFileBuild',
      actionPointText: 'Contested identification',
      statusDescription: 'Obtain further detail',
      createdByOrganisation: 'CPS',
      steps: [
        {
          code: 'KWD',
          description: 'Key Witness Details',
          text: '',
          hidden: false,
          hiddenDraft: false,
        },
      ],
    });
  });

  it('requests non-key witness details when the request type is NKWD', () => {
    const request = mapReclassifyStatement(
      aStatement({ witnessId: 0, witnessActionPlan: aWitnessActionPlan({ requestType: 'NKWD' }) }),
      URN,
    );

    expect(request.actionPlan?.steps).toEqual([
      {
        code: 'NKWD',
        description: 'Non-Key Witness Details',
        text: '',
        hidden: false,
        hiddenDraft: false,
      },
    ]);
  });

  it('leaves the defendant name unset when the action plan covers all defendants', () => {
    const request = mapReclassifyStatement(
      aStatement({ witnessId: 0, witnessActionPlan: aWitnessActionPlan({ defendantId: 0 }) }),
      URN,
    );

    expect(request.actionPlan?.fullDefendantName).toBeNull();
  });
});
