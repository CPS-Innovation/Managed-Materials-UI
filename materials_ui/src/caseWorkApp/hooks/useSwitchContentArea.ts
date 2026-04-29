import { useCallback, useEffect, useRef } from 'react';

const SWITCH_CONTENT_AREA_KEY = '.';

export const useSwitchContentArea = () => {
  const lastActiveContentIndex = useRef(0);

  const getContentAreas = () => {
    const contentAreas = [
      document.querySelector('#side-panel'),
      document.querySelector('#document-tabs'),
      document.querySelector('#active-tab-panel')
    ];

    return contentAreas.filter((contentArea) => contentArea);
  };

  const keyDownHandler = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey || e.key !== SWITCH_CONTENT_AREA_KEY) return;

    e.preventDefault();
    const contentAreas = getContentAreas();
    const activeAreaIndex = contentAreas.findIndex(
      (contentArea) => document.activeElement === contentArea
    );

    if (
      activeAreaIndex === -1 &&
      contentAreas[lastActiveContentIndex.current] &&
      document.activeElement !== contentAreas[lastActiveContentIndex.current]
    ) {
      (contentAreas[lastActiveContentIndex.current] as HTMLElement).focus();
      return;
    }

    if (activeAreaIndex < contentAreas.length - 1) {
      lastActiveContentIndex.current = activeAreaIndex + 1;
      (contentAreas[activeAreaIndex + 1] as HTMLElement).focus();
      return;
    }

    lastActiveContentIndex.current = 0;
    (contentAreas[0] as HTMLElement).focus();
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);
};
