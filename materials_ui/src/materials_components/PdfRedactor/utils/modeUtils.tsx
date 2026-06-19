export type TMode = 'redact' | 'rotation' | 'deletion' | 'disabled';

export const isRedactionEnabledMode = (mode: TMode) => mode === 'redact';
