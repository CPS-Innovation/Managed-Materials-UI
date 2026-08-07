import { describe, expect, it } from 'vitest';

import { formatDate, formatDateInputValue } from '../../utils/date';

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
});
