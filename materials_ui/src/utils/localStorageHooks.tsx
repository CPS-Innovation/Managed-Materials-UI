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
      // check every nth+2 navigation, so we don't hinder performance on initial render
      const isCheckableNavigation = count.current % p.numberOfNavigationsPerCheck === 2;
      if (!isCheckableNavigation) return;

      const remainingBytes = estimateBytesOfLocalStorageUsed();
      const isOverSoftLimit = remainingBytes > LOCAL_STORAGE_SOFT_LIMIT_BYTES;
      if (isOverSoftLimit) localStorage.clear();
    })();
    count.current += 1;
  }, [params]);
};
