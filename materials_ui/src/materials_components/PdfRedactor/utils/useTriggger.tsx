import { useEffect, useState } from 'react';

export type TTriggerData = [] | undefined;
export const useTrigger = () => {
  const [data, setData] = useState<[]>();

  const fire = () => {
    setData(() => []);
  };

  return { data, fire };
};

export const useTriggerListener = (p: { triggerData: TTriggerData; fn: () => void }) => {
  useEffect(() => {
    if (!p.triggerData) return;
    p.fn();
  }, [p.triggerData]);
};
