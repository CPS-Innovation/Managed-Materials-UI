import { WitnessListResponseType } from '../../src/schemas/witness';

const mockWitnesses: WitnessListResponseType = {
  witnesses: [
    {
      caseId: 2167259,
      witnessId: 2794967,
      firstName: 'Test',
      surname: 'Witness'
    }
  ]
};
export const mockWitness = (
  overwrite: Partial<WitnessListResponseType> = {}
) => ({ ...mockWitnesses, ...overwrite });
