// used for setting high contrast colours to a pdf if user
// is in high contrast mode, otherwise returns undefined
// and falls back to usual behaviour

import { useEffect, useState } from 'react';

const FORCED_COLORS_QUERY = '(forced-colors: active)';
type PdfPageColors = { background: string; foreground: string };

const HIGH_CONTRAST_PAGE_COLORS: PdfPageColors = { background: 'Canvas', foreground: 'CanvasText' };

export function usePageColors(): PdfPageColors | undefined {
  const [isForcedColors, setIsForcedColors] = useState(() =>
    Boolean(window.matchMedia?.(FORCED_COLORS_QUERY).matches),
  );

  useEffect(() => {
    const mql = window.matchMedia?.(FORCED_COLORS_QUERY);
    if (!mql) return;

    const onChange = (e: MediaQueryListEvent) => setIsForcedColors(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isForcedColors ? HIGH_CONTRAST_PAGE_COLORS : undefined;
}
