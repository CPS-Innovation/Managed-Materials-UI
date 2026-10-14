import { describe, expect, it } from 'vitest';

import { isRedactionPermitted } from '../../utils/redactionEligibility';

describe('isRedactionPermitted', () => {
  it('blocks PCD request documents', () => {
    expect(isRedactionPermitted('PCD-123456')).toBe(false);
  });

  it('blocks Defendants & Charges documents', () => {
    expect(isRedactionPermitted('DAC-2155069')).toBe(false);
  });

  it('allows CMS documents', () => {
    expect(isRedactionPermitted('CMS-987')).toBe(true);
  });
});
