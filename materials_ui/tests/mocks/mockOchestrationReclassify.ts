import { Reclassify_Orchestrated_Response_Type } from '../../src/schemas/forms/reclassify';

const mockOrchestratedResponse: Reclassify_Orchestrated_Response_Type = {
  overallSuccess: true,
  status: 'Success',
  materialId: 8836399,
  transactionId: '8d4e0062-cabb-4929-983e-8142f3fb8fe8',
  reclassificationResult: {
    success: true,
    operationName: 'ReclassifyCaseMaterial',
    errorMessage: '',
    resultData: { reclassifyCommunication: { id: 8836399 } }
  },
  renameMaterialResult: null,
  actionPlanResult: null,
  witnessResult: null,
  errors: [''],
  warnings: null,
  contentType: 'application/json'
};

export const mockOchestration = (
  overwrites: Partial<Reclassify_Orchestrated_Response_Type> = {}
) => ({ ...mockOrchestratedResponse, ...overwrites });
