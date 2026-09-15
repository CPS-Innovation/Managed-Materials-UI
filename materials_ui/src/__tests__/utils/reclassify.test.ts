import { describe, expect, it } from 'vitest';

import type { Reclassify_Orchestrated_Response_Type } from '../../schemas/forms/reclassify';
import { getBannerData } from '../../utils/reclassify';

type TResponse = Reclassify_Orchestrated_Response_Type;

const aResult = (success: boolean) => ({ success }) as NonNullable<TResponse['witnessResult']>;

const aResponse = (overrides: Partial<TResponse>) =>
  ({ status: 'Success', ...overrides }) as TResponse;

const headersOf = (banners: ReturnType<typeof getBannerData>) =>
  banners.map((b) => [b.type, b.header]);

describe('getBannerData for a statement', () => {
  it('reports a single success when the reclassification succeeds', () => {
    const banners = getBannerData(aResponse({}), 'STATEMENT', false);

    expect(headersOf(banners)).toEqual([['success', 'Reclassification successful']]);
    expect(banners[0]!.content).toBe('Material reclassified successfully.');
  });

  it('never reports a witness being added, even when the response carries witness results', () => {
    const banners = getBannerData(
      aResponse({ witnessResult: aResult(true), actionPlanResult: aResult(true) }),
      'STATEMENT',
      false,
    );

    expect(headersOf(banners)).toEqual([['success', 'Reclassification successful']]);
    expect(banners[0]!.content).toBe('Material reclassified successfully.');
  });

  it('reports a single error when the reclassification fails', () => {
    const banners = getBannerData(aResponse({ status: 'Failed' }), 'STATEMENT', false);

    expect(headersOf(banners)).toEqual([['error', 'Reclassification failed']]);
  });
});

describe('getBannerData for a renamed material', () => {
  it('reports the rename alongside the reclassification when both succeed', () => {
    const banners = getBannerData(
      aResponse({ renameMaterialResult: aResult(true) }),
      'EXHIBIT',
      true,
    );

    expect(headersOf(banners)).toEqual([['success', 'Reclassification successful']]);
    expect(banners[0]!.content).toBe('Material reclassified and renamed successfully.');
  });

  it('pairs a reclassification success with a rename error when only the rename fails', () => {
    const banners = getBannerData(
      aResponse({ status: 'PartialSuccess', renameMaterialResult: aResult(false) }),
      'EXHIBIT',
      true,
    );

    expect(headersOf(banners)).toEqual([
      ['success', 'Reclassification successful'],
      ['error', 'Rename failed'],
    ]);
  });
});
