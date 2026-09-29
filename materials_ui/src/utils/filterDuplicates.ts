export const filterDuplicates = <T extends string | number | null | undefined>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};
