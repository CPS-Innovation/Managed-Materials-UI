import { beforeEach, describe } from 'vitest';

import { CaseInfoType } from '../../schemas';
import { useCaseInfoStore } from '../../stores';

const caseInfoData1: CaseInfoType = {
  id: 12345,
  urn: 'ABC123DEF',
  leadDefendantFirstNames: 'Joe',
  leadDefendantSurname: 'Bloggs',
  numberOfDefendants: 2,
  unitName: 'Unit name 1',
};

const caseInfoData2: CaseInfoType = {
  id: 12346,
  urn: 'ABC123DEG',
  leadDefendantFirstNames: 'John',
  leadDefendantSurname: 'Doe',
  numberOfDefendants: 1,
  unitName: 'Unit name 2',
};

describe('stores > useCaseInfoStore', () => {
  beforeEach(() => {
    useCaseInfoStore.setState({ caseInfo: null });
  });

  it('should initialise as expected', () => {
    const { caseInfo } = useCaseInfoStore.getState();

    expect(caseInfo).toBeNull();
  });

  it('should update with case info data', () => {
    const { setCaseInfo } = useCaseInfoStore.getState();
    setCaseInfo(caseInfoData1);

    expect(useCaseInfoStore.getState().caseInfo).toEqual(caseInfoData1);
  });

  it('should update with new case info data', () => {
    const { setCaseInfo } = useCaseInfoStore.getState();

    setCaseInfo(caseInfoData1);
    expect(useCaseInfoStore.getState().caseInfo).toEqual(caseInfoData1);

    setCaseInfo(caseInfoData2);
    expect(useCaseInfoStore.getState().caseInfo).toEqual(caseInfoData2);
  });
});
