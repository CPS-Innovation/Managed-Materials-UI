import { CaseDetailsType } from '../../src/schemas/caseDetails';

const mockCaseDetails: CaseDetailsType = [
  {
    id: 2171823,
    uniqueReferenceNumber: '16WW1058825',
    isCaseCharged: false,
    numberOfDefendants: 1,
    owningUnit: 'Hull TU',
    leadDefendantDetails: {
      id: 2802551,
      listOrder: 1,
      firstNames: 'John',
      surname: 'WICK',
      organisationName: 'WICK',
      dob: '01/01/1980',
      age: '',
      youth: false,
      type: 'Person'
    },
    headlineCharge: {
      charge: 'FA97031\u00A0Theft',
      date: null,
      earlyDate: '2025-09-19',
      lateDate: '2025-09-22',
      nextHearingDate: null
    },
    defendants: [],
    witnesses: [],
    preChargeDecisionRequests: []
  }
];

export const mockCaseDetailsResponse = (
  overwrite: Partial<CaseDetailsType[0]> = {}
) => [{ ...mockCaseDetails[0], ...overwrite }];
