import { describe, expect, it } from 'vitest';

import { formatDate, formatDateInputValue, formatDateLong } from '../../utils/date';

describe('formatDate', () => {
  it('formats a date as DD/MM/YYYY', () => {
    expect(formatDate('2024-03-05')).toBe('05/03/2024');
    expect(formatDate(new Date(2024, 2, 5))).toBe('05/03/2024');
  });

  it('honours a custom separator', () => {
    expect(formatDate('2024-03-05', '-')).toBe('05-03-2024');
  });

  it('returns a dash when there is no date', () => {
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });
});

describe('formatDateInputValue', () => {
  it('formats a date for a date input as YYYY-MM-DD', () => {
    expect(formatDateInputValue(new Date(2024, 2, 5))).toBe('2024-03-05');
  });

  it('returns an empty string when there is no date', () => {
    expect(formatDateInputValue(undefined)).toBe('');
  });
});

describe('formatDateLong', () => {
  it('formats a date as a long GB date', () => {
    expect(formatDateLong('2025-11-04T09:00:00')).toBe('04 November 2025');
  });

  it('returns an empty string when there is no date', () => {
    expect(formatDateLong(null)).toBe('');
    expect(formatDateLong(undefined)).toBe('');
  });
});
