import { PCDListingResponseType } from '../../../src/schemas/pcd';
const PcdCoreResponse: PCDListingResponseType = [
  {
    id: 131403,
    type: 'Face-to-Face',
    decisionRequiredBy: '2021-06-28',
    decisionRequested: '2000-01-01',
  },
  {
    id: 131404,
    type: 'Face-to-Face',
    decisionRequiredBy: '2021-10-26',
    decisionRequested: '2021-10-19',
  },
  {
    id: 131405,
    type: 'Face-to-Face',
    decisionRequiredBy: '2021-12-21',
    decisionRequested: '2021-12-14',
  },
  {
    id: 131582,
    type: 'Face-to-Face',
    decisionRequiredBy: '2022-02-01',
    decisionRequested: '2022-01-25',
  },
  {
    id: 131694,
    type: 'Face-to-Face',
    decisionRequiredBy: '2022-02-15',
    decisionRequested: '2022-02-08',
  },
  {
    id: 131809,
    type: 'Face-to-Face',
    decisionRequiredBy: '2022-02-15',
    decisionRequested: '2022-02-21',
  },
];

export const mockPcdCoreResponse = (overwrite?: Partial<PCDListingResponseType>) => {
  return PcdCoreResponse.map((currentPcdCoreResponse) => ({
    ...currentPcdCoreResponse,
    ...overwrite,
  }));
};
