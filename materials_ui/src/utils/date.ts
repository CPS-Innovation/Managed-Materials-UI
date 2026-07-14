import dayjs from 'dayjs';

export const formatDate = (
  dateStr?: string | Date,
  separator: string = '/',
  expectedFormat?: string,
): string => {
  if (!dateStr) return '-';

  const date = dayjs(dateStr, expectedFormat);

  return date.format(`DD${separator}MM${separator}YYYY`);
};

export const formatDateInputValue = (dateStr?: string | Date) => {
  if (!dateStr) return '';

  const date = dayjs(dateStr);

  return date.format(`YYYY-MM-DD`);
};

export const formatDateLong = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';
