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
      console.log(`localStorageHooks.tsx:${/*LL*/ 30}`, {
        count: count.current,
        p: p.numberOfNavigationsPerCheck,
      });
      // check every nth+2 navigation, so we don't hinder performance on initial render
      const isCheckableNavigation = count.current % p.numberOfNavigationsPerCheck === 2;
      if (!isCheckableNavigation) {
        console.log(
          `localStorageHooks.tsx:${/*LL*/ 31}`,
          'not nth+2 navigation, will not check localStorage',
        );
        return;
      }

      console.log(
        `localStorageHooks.tsx:${/*LL*/ 32}`,
        'nth+2 navigation, will check localStorage',
      );

      const remainingBytes = estimateBytesOfLocalStorageUsed();
      const isOverSoftLimit = remainingBytes > LOCAL_STORAGE_SOFT_LIMIT_BYTES;
      console.log(`localStorageHooks.tsx:${/*LL*/ 35}`, {
        remainingBytes,
        LOCAL_STORAGE_SOFT_LIMIT_BYTES,
        isOverSoftLimit,
      });
      if (isOverSoftLimit) {
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
