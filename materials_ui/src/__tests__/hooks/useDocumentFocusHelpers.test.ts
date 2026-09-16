import { describe, expect, it } from 'vitest';

import {
  getWordStartingIndices,
  isExtendSelectionByWordKey,
  isFocusNextWordKey,
  isFocusPreviousWordKey,
} from '../../materials_components/PdfRedactor/hooks/useDocumentFocusHelpers';

const combo = (p: { ctrl?: boolean; shift?: boolean; alt?: boolean; code?: string }) => ({
  ctrlKey: p.ctrl ?? false,
  shiftKey: p.shift ?? false,
  altKey: p.alt ?? false,
  code: p.code ?? 'Comma',
});

const classify = (e: ReturnType<typeof combo>) => ({
  next: isFocusNextWordKey(e),
  previous: isFocusPreviousWordKey(e),
  extend: isExtendSelectionByWordKey(e),
});

const NO_COMMAND = { next: false, previous: false, extend: false };

describe('word command key bindings', () => {
  it('Ctrl+Comma focuses the next word', () => {
    expect(classify(combo({ ctrl: true }))).toEqual({ ...NO_COMMAND, next: true });
  });

  it('Ctrl+Alt+Comma focuses the previous word', () => {
    expect(classify(combo({ ctrl: true, alt: true }))).toEqual({ ...NO_COMMAND, previous: true });
  });

  it('Ctrl+Shift+Comma extends the selection by a word', () => {
    expect(classify(combo({ ctrl: true, shift: true }))).toEqual({ ...NO_COMMAND, extend: true });
  });

  it.each([
    ['Comma without Ctrl', combo({})],
    ['Shift+Comma without Ctrl', combo({ shift: true })],
    ['Ctrl+Shift+Alt+Comma', combo({ ctrl: true, shift: true, alt: true })],
    ['Ctrl+Shift+Period', combo({ ctrl: true, shift: true, code: 'Period' })],
    ['Ctrl+Shift+ArrowRight', combo({ ctrl: true, shift: true, code: 'ArrowRight' })],
  ])('%s matches no word command', (_, e) => {
    expect(classify(e)).toEqual(NO_COMMAND);
  });
});

describe('getWordStartingIndices', () => {
  it('returns the index of each run of non-whitespace', () => {
    expect(getWordStartingIndices('The quick  brown')).toEqual([0, 4, 11]);
  });

  it('skips leading whitespace', () => {
    expect(getWordStartingIndices('  leading')).toEqual([2]);
  });

  it('returns nothing for an empty string', () => {
    expect(getWordStartingIndices('')).toEqual([]);
  });
});
