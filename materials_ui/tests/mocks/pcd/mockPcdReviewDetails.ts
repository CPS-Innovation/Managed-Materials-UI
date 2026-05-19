import {
  PCDReviewDetailsSchema,
  type PCDReviewDetailsResponseType
} from '../../../src/schemas/pcdReview';

const PcdReviewDetailsDataResponse: PCDReviewDetailsResponseType = {
  preChargeDecisionAnalysisOutcome: {
    caseId: 2167259,
    allocation:
      'Make your recommendation for how the case should be allocated and describe your reasoning for it.',
    caseSummary:
      'Give a brief overview of the proposed charges by the police and the offences you are considering, potential legal issues and the current bail or remand status of the suspects. You should also outline your rationale for applying the Full Code Test.',
    consultationType: 'Full Code Test',
    disclosureActionsAndIssues:
      'Think about what steps to take regarding disclosing information now. Try to anticipate issues that might come up as the cases progresses.',
    europeanCourtOfHumanRights:
      'Human rights factors are not an issue in this case at this time',
    evidentialAssessment:
      'Explain if and how the evidence proves all elements of the offence or offences in accordance with the Full Code Test. Your assessment should anticipate any likely issues for trial and suggest ways to overcome potential challenges to the prosecution case.',
    id: 4380514,
    instructionsToOperationsDeliveryOrAdvocate:
      'Provide a summary of notes and actions for a prosecuting advocate and operational delivery staff.',
    publicInterestAssessment:
      'A prosecution will usually take place unless you are satisfied that there are public interest factors tending against it, which outweigh those tending in favour. Based on your analysis of the case, explain if and how a prosecution is in the public interest, referencing relevant parts of the Code to support your rationale.',
    trialStrategy:
      'Outline the trial strategy you’ve identified to best support a successful prosecution.',
    witnessOrVictimInformationAndActions:
      'Highlight key witness and victim information and actions to help them support the case.',
    historyEventType: 1,
    reviewSummary: 'PCD Case Analysis',
    prosecutorDeclaration:
      'I confirm that I have considered the impact of potentially disclosable material, on the decision to charge or continue with proceedings, including any unexamined material or material that could be obtained through further reasonable lines of inquiry',
    monitoringCodes: [
      {
        code: '',
        description: 'Domestic Violence',
        type: 0,
        disabled: false,
        isAssigned: true
      },
      {
        code: '',
        description: 'Pre-Charge Decision',
        type: 0,
        disabled: false,
        isAssigned: true
      },
      {
        code: '',
        description: 'Rape',
        type: 0,
        disabled: false,
        isAssigned: true
      },
      {
        code: '',
        description: 'Vulnerable/Intimidated victim',
        type: 0,
        disabled: false,
        isAssigned: true
      }
    ],
    isCompleted: true,
    eventDate: '19/05/2025',
    dgSummary: 'Yes',
    dgDetails: {
      assessmentApplicable: true,
      datePapersReceived: '1900-01-01T00:00:00',
      principalOffenceCategory: 'Not applicable',
      stageAssessmentCompleted: 'PCD',
      submissionDgCompliant: 'Yes',
      dgAssessmentItems: [
        { itemName: '', title: '', description: '', comment: '' },
        { itemName: '', title: '', description: '', comment: '' },
        { itemName: '', title: '', description: '', comment: '' },
        { itemName: '', title: '', description: '', comment: '' }
      ],
      policeResponse: ''
    },
    currentEvent: {
      id: 4380514,
      name: 'Initial Review',
      date: '19/05/2025',
      authorOrVenue: 'Erika Farrugia',
      type: 1
    },
    nextEventLink: [
      {
        id: 4380514,
        href: 'api/cases/2161796/history?caseId=4380514&historyType=1',
        rel: 'InitialReview',
        type: 'GET'
      }
    ],
    dppConsent: null,
    linkedCaseUrns: []
  },
  preChargeDecisionOutcome: {
    author: 'Erika Farrugia',
    caseId: 2167259,
    decisionRequestedDate: '01/05/2025',
    decisionMadeDateTime: '19/05/2025 16:42',
    defendantDecisions: [
      {
        id: 2167259,
        defendantName: 'SIMPSON Homer',
        decisionDescription: 'K - No Prosecution - Evidential',
        decision: 15,
        reason: 'K - No Prosecution - Evidential',
        keyFactor: '',
        natureOfDecision: 'K - No Prosecution - Evidential',
        specifiedCharges: '',
        returnBailDate: '25/05/2025',
        proposedCharge: 'PL96002',
        pcdPrincipalOffenceCategory: '',
        reasonCode: 'K',
        publicInterestCode: '',
        chargeDetails: []
      },
      {
        id: 2785313,
        defendantName: 'SIMPSON Bart',
        decisionDescription: 'C - Simple Caution',
        decision: 3,
        reason: 'C - Simple Caution',
        keyFactor: '',
        natureOfDecision: 'K - No Prosecution - Evidential',
        specifiedCharges: '',
        returnBailDate: '25/05/2025',
        proposedCharge: 'PL96002',
        pcdPrincipalOffenceCategory: '',
        reasonCode: 'C',
        publicInterestCode: 'D77 - Public Interest Code',
        chargeDetails: []
      }
    ],
    eventDate: '19/05/2025',
    id: 4380522,
    isCompleted: true,
    historyEventType: 3,
    investigationStage: 'Post Arrest',
    method: 'Area',
    decisionMadeBy: 'Erika Farrugia',
    actionPlan: true,
    policeCovidUrgency: 'Unknown',
    cpsCovidUrgency: '',
    pcdHistoryActionPlan: [
      {
        actionType: 'Action Plan',
        entryDate: '19/05/2025',
        actionDate: '25/05/2025',
        suspect: 'SIMPSON Bart',
        status: 'Sent on PCD Response',
        actionPoint:
          'Requested:\n- Victim Personal Statement;\n(Please provide the witness personal statement as we can see what was actually said as this is missing from the files)',
        policeCovidUrgency: '',
        cpsCovidUrgency: ''
      },
      {
        actionType: 'Action Plan',
        entryDate: '19/05/2025',
        actionDate: '26/05/2025',
        suspect: 'SIMPSON Homer',
        status: 'Sent on PCD Response',
        actionPoint:
          'Requested:\n- Medical Evidence;\n(Send us the medical evidence of the injuries incurred as a result of the assault)',
        policeCovidUrgency: '',
        cpsCovidUrgency: ''
      },
      {
        actionType: 'Action Plan',
        entryDate: '19/05/2025',
        actionDate: '27/05/2025',
        suspect: 'All',
        status: 'Sent on PCD Response',
        actionPoint:
          'Requested:\n- Unused/Sensitive Material;\n(Any further Unused Material that may be needed for a further review)',
        policeCovidUrgency: '',
        cpsCovidUrgency: ''
      }
    ],
    urn: '16123630825',
    currentEvent: {
      id: 4380522,
      name: 'Pre-charge Decision',
      date: '19/05/2025',
      authorOrVenue: 'Erika Farrugia',
      type: 3
    },
    nextEventLink: [
      {
        id: 4380522,
        href: 'api/cases/2161796/history?caseId=4380522&historyType=3',
        rel: 'PreChargeDecision',
        type: 'GET'
      }
    ]
  }
};

PCDReviewDetailsSchema.parse(PcdReviewDetailsDataResponse);

export const mockPcdReviewDetailsResponse = (
  overwrite?: Partial<PCDReviewDetailsResponseType>
): PCDReviewDetailsResponseType => ({
  ...PcdReviewDetailsDataResponse,
  ...overwrite,
  preChargeDecisionAnalysisOutcome: {
    ...PcdReviewDetailsDataResponse.preChargeDecisionAnalysisOutcome,
    ...overwrite?.preChargeDecisionAnalysisOutcome
  },
  preChargeDecisionOutcome: {
    ...PcdReviewDetailsDataResponse.preChargeDecisionOutcome,
    ...overwrite?.preChargeDecisionOutcome
  }
});
