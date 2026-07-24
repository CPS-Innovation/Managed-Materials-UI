export const formatDate = (dtStr: string) => {
  const date = new Date(dtStr);

  // FORMAT: "04 November 2025"

  // Method 1: Using toLocaleDateString with options
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const formatShortDate = (dtStr: string) => {
  const date = new Date(dtStr);

  // FORMAT: "02/06/2020" (DD/MM/YYYY)

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
