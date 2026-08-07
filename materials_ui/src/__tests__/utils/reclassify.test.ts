import { describe, expect, it } from 'vitest';

import type { Reclassify_Orchestrated_Response_Type } from '../../schemas/forms/reclassify';
import { getBannerData } from '../../utils/reclassify';

const aResult = (success: boolean) => ({
  success,
  operationName: 'operation',
  errorMessage: '',
  resultData: null,
});

const aResponse = (overrides: Partial<Reclassify_Orchestrated_Response_Type>) =>
  ({
    overallSuccess: true,
    status: 'Success',
    materialId: 1,
    transactionId: '00000000-0000-0000-0000-000000000000',
    reclassificationResult: null,
    renameMaterialResult: null,
    actionPlanResult: null,
    witnessResult: null,
    errors: [],
    warnings: undefined,
    contentType: 'application/json',
    ...overrides,
  }) as Reclassify_Orchestrated_Response_Type;

describe('getBannerData for a statement', () => {
  it('reports a single success when the witness and action plan both succeed', () => {
    const banners = getBannerData(
      aResponse({
        status: 'Success',
        witnessResult: aResult(true),
        actionPlanResult: aResult(true),
      }),
      'STATEMENT',
      false,
    );

    expect(banners).toEqual([
      {
        type: 'success',
        header: 'Reclassification successful',
        content: 'Material reclassified, witness added and action plan sent successfully.',
      },
    ]);
  });

  it('pairs a success with an error when only the action plan fails', () => {
    const banners = getBannerData(
      aResponse({
        status: 'Success',
        witnessResult: aResult(true),
        actionPlanResult: aResult(false),
      }),
      'STATEMENT',
      false,
    );

    expect(banners.map((b) => b.type)).toEqual(['success', 'error']);
    expect(banners[1]!.header).toBe('Action plan creation failed');
  });

  it('reports a single error when the whole reclassification fails', () => {
    const banners = getBannerData(
      aResponse({
        status: 'Failed',
        witnessResult: aResult(false),
        actionPlanResult: aResult(false),
      }),
      'STATEMENT',
      false,
    );

    expect(banners).toEqual([
      {
        type: 'error',
        header: 'Reclassification failed',
        content: 'Unable to reclassify material, add witness and send action plan.',
      },
    ]);
  });
});

describe('getBannerData for a renamed material', () => {
  it('reports the rename alongside the reclassification when both succeed', () => {
    const banners = getBannerData(
      aResponse({ status: 'Success', renameMaterialResult: aResult(true) }),
      'EXHIBIT',
      true,
    );

    expect(banners).toEqual([
      {
        type: 'success',
        header: 'Reclassification successful',
        content: 'Material reclassified and renamed successfully.',
      },
    ]);
  });

  it('pairs a reclassification success with a rename error when only the rename fails', () => {
    const banners = getBannerData(
      aResponse({ status: 'PartialSuccess', renameMaterialResult: aResult(false) }),
      'EXHIBIT',
      true,
    );

    expect(banners.map((b) => b.type)).toEqual(['success', 'error']);
    expect(banners[1]!.header).toBe('Rename failed');
  });
});
