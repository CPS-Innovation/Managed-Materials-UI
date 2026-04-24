import { DefendantsResponseType } from '../../src/schemas/defendants';

const defendants: DefendantsResponseType = {
  defendants: [
    {
      id: 2771708,
      caseId: 2167259,
      listOrder: 1,
      type: 'Person',
      firstNames: 'Will',
      surname: 'SMITH',
      dob: '1970-05-17T00:00:00',
      policeRemandStatus: null,
      youth: false,
      custodyTimeLimit: null,
      offences: [
        {
          id: 2249331,
          listOrder: 1,
          code: 'NYC',
          type: 'CHARGE',
          active: 'DISPOSED',
          description: 'Not Yet Charged',
          fromDate: null,
          toDate: null,
          latestPlea: 'NO_PLEA',
          latestVerdict: 'NO_VERDICT',
          disposedReason: 'FINALISED',
          lastHearingOutcome: null,
          custodyTimeLimit: null,
          latestPleaDescription: '-'
        }
      ],
      charges: [],
      proposedCharges: [],
      nextHearing: null,
      defendantPcdReview: null,
      solicitor: null,
      personalDetail: {
        address: null,
        email: null,
        ethnicity: 'NotProvided',
        gender: 'Male',
        occupation: null,
        homePhoneNumber: null,
        mobilePhoneNumber: null,
        workPhoneNumber: null,
        preferredCorrespondenceLanguage: 'English',
        religion: 'NotProvided',
        guardian: null
      }
    }
  ]
};

export const mockDefendants = (overwrite?: Partial<DefendantsResponseType>) => {
  return { ...defendants, ...overwrite };
};
