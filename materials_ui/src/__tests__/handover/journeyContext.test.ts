import { describe, expect, it } from 'vitest';

import {
  getJourneyRoute,
  HANDOVER_ERRORS,
  parseJourneyContext,
} from '../../handover/journeyContext';

const toSearch = (ctx: unknown) => `?ctx=${encodeURIComponent(JSON.stringify(ctx))}`;

describe('journeyContext', () => {
  describe('parseJourneyContext', () => {
    it('parses a default journey for a case', () => {
      expect(parseJourneyContext(toSearch({ journey: 'default', caseId: 2155760 }))).toEqual({
        success: true,
        context: { journey: 'default', caseId: 2155760 },
      });
    });

    it('keeps optional material and document identifiers and drops fields it doesnt know', () => {
      const search = toSearch({
        journey: 'default',
        caseId: 2155760,
        materialId: 12,
        documentId: 34,
        somethingElse: 'x',
      });

      expect(parseJourneyContext(search)).toEqual({
        success: true,
        context: { journey: 'default', caseId: 2155760, materialId: 12, documentId: 34 },
      });
    });

    it('reads a ctx that has only been partly encodede', () => {
      const search = '?ctx=%7B%22journey%22:%22default%22,%22caseId%22:2155760%7D';

      expect(parseJourneyContext(search)).toMatchObject({ success: true });
    });

    it.each([
      ['there is no query', '', HANDOVER_ERRORS.NO_CTX],
      ['there is no ctx', '?foo=bar', HANDOVER_ERRORS.NO_CTX],
      ['ctx is empty', '?ctx=', HANDOVER_ERRORS.NO_CTX],
      ['ctx is not JSON', '?ctx=xyz', HANDOVER_ERRORS.INVALID_JSON],
      ['ctx is null', toSearch(null), HANDOVER_ERRORS.NOT_AN_OBJECT],
      ['ctx is an array', toSearch([]), HANDOVER_ERRORS.NOT_AN_OBJECT],
      ['ctx is a number', toSearch(5), HANDOVER_ERRORS.NOT_AN_OBJECT],
    ])('rejects the link when %s', (_, search, reason) => {
      expect(parseJourneyContext(search)).toEqual({ success: false, reason });
    });

    it.each([
      ['there is no journey', { caseId: 1 }, 'journey'],
      ['the journey is not supported', { journey: 'unknown', caseId: 1 }, 'journey'],
      ['there is no caseId', { journey: 'default' }, 'caseId'],
      ['the caseId is a string', { journey: 'default', caseId: '1' }, 'caseId'],
      ['the caseId is not a whole number', { journey: 'default', caseId: 1.5 }, 'caseId'],
      ['the caseId is not positive', { journey: 'default', caseId: 0 }, 'caseId'],
      [
        'the materialId is invalid',
        { journey: 'default', caseId: 1, materialId: 'x' },
        'materialId',
      ],
    ])('rejects the link when %s', (_, ctx, field) => {
      expect(parseJourneyContext(toSearch(ctx))).toEqual({
        success: false,
        reason: HANDOVER_ERRORS.invalidField(field),
      });
    });
  });

  describe('getJourneyRoute', () => {
    it('sends the default journey to the Materials tab for the case', () => {
      expect(getJourneyRoute({ journey: 'default', caseId: 2155760 })).toBe('/2155760/materials');
    });
  });
});
