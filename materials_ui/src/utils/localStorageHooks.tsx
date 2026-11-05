import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

export const estimateBytesOfLocalStorageUsed = () => {
  let bytesTotal = 0;
  for (const key in localStorage) {
    bytesTotal += (key.length + (localStorage.getItem(key) ?? '').length) * 2;
  }
  return bytesTotal;
};

const LOCAL_STORAGE_MAX_LIMIT_BYTES = 5 * 1024 * 1024;
const LOCAL_STORAGE_SOFT_LIMIT_PERCENTAGE = 75;
const LOCAL_STORAGE_SOFT_LIMIT_BYTES =
  (LOCAL_STORAGE_MAX_LIMIT_BYTES * LOCAL_STORAGE_SOFT_LIMIT_PERCENTAGE) / 100;

export const useClearLocalStorageWhenOverSoftLimit = (p: {
  numberOfNavigationsPerCheck: number;
}) => {
  const params = useParams();
  const count = useRef(0);

  useEffect(() => {
    (() => {
      console.log(
        `localStorageHooks.tsx:${/*LL*/ 26}`,
        'count.current % p.numberOfNavigationsPerCheck !== 0',
        count.current % p.numberOfNavigationsPerCheck !== 0,
      );
      if (count.current % p.numberOfNavigationsPerCheck !== 0) {
        console.log(`localStorageHooks.tsx:${/*LL*/ 31}`, {});
        return;
      }

      const bytes = estimateBytesOfLocalStorageUsed();
      console.log(`localStorageHooks.tsx:${/*LL*/ 35}`, { bytes });
      if (bytes > LOCAL_STORAGE_SOFT_LIMIT_BYTES) {
        console.log(
          `localStorageHooks.tsx:${/*LL*/ 37}`,
          'over soft limit, about to clear localStorage',
        );
        localStorage.clear();
        console.log(`localStorageHooks.tsx:${/*LL*/ 39}`, {
          estimateBytesOfLocalStorageUsed: estimateBytesOfLocalStorageUsed(),
        });
      } else {
        console.log(`localStorageHooks.tsx:${/*LL*/ 43}`, 'under soft limit');
      }
    })();
    count.current += 1;
  }, [params]);
};
