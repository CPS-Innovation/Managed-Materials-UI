import { useEffect, useState } from 'react';
import { filterDuplicates } from '../utils/filterDuplicates';

export const useValueHistory = <T extends string | number | null | undefined>(val: T) => {
  const [history, setHistory] = useState<T[]>([val]);
  useEffect(() => {
    setHistory((prev) => filterDuplicates([val, ...prev]));
  }, [val]);
  return { history: filterDuplicates(history) };
};
