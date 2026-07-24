import { CaseLockStatusResponseType } from '../../src/schemas/caseLockStatus';

const lockCase: CaseLockStatusResponseType = {
  caseLockedMessage: 'null',
  isLocked: false,
  isLockedByCurrentUser: false,
  lockedByUser: 'null',
};

export const mockLockCase = (overwrite?: Partial<CaseLockStatusResponseType>) => {
  return { ...lockCase, ...overwrite };
};
