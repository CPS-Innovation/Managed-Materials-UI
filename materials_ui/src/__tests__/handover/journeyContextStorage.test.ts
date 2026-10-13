import { beforeEach, describe, expect, it } from 'vitest';

import {
  getJourneyContext,
  JOURNEY_CONTEXT_STORAGE_KEY,
  saveJourneyContext,
} from '../../handover/journeyContextStorage';

const context = { journey: 'default', caseId: 2155760 } as const;

describe('journeyContextStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns the saved context for the case it was handed over with', () => {
    saveJourneyContext(context);

    expect(getJourneyContext(2155760)).toEqual(context);
    expect(getJourneyContext('2155760')).toEqual(context);
  });

  it('replaces the context from an earlier handover', () => {
    saveJourneyContext({ journey: 'default', caseId: 1 });
    saveJourneyContext(context);

    expect(getJourneyContext(1)).toBeNull();
    expect(getJourneyContext(2155760)).toEqual(context);
  });

  it('returns nothing for a different case', () => {
    saveJourneyContext(context);

    expect(getJourneyContext(1)).toBeNull();
  });

  it('returns nothing when no context has been saved', () => {
    expect(getJourneyContext(2155760)).toBeNull();
  });

  it.each([
    ['not JSON', 'xyz'],
    ['not a journey context', JSON.stringify({ caseId: 2155760 })],
  ])('returns nothing when the stored value is %s', (_, value) => {
    sessionStorage.setItem(JOURNEY_CONTEXT_STORAGE_KEY, value);

    expect(getJourneyContext(2155760)).toBeNull();
  });
});
