import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

export const estimateBytesOfLocalStorageUsed = () => {
  let bytesTotal = 0;
  for (const key in localStorage) {
    bytesTotal += (key.length + (localStorage.getItem(key) ?? '').length) * 2;
  }
  return bytesTotal;
};

export const useClearLocalStorageWhenOverQuota = (p: {
  navigationsPerCheck: number;
  bytesQuota: number;
}) => {
  const params = useParams();
  const count = useRef(0);

  useEffect(() => {
    (() => {
      if (count.current % p.navigationsPerCheck !== 0) return;

      const bytes = estimateBytesOfLocalStorageUsed();
      if (bytes > p.bytesQuota) localStorage.clear();
    })();
    count.current += 1;
  }, [params]);
};
