import {
  parsePositions,
  extractLetters,
  extractLettersWithValidation,
  splitGraphemes,
} from '../extract-letters';

describe('splitGraphemes', () => {
  test('splits ASCII string into characters', () => {
    expect(splitGraphemes('abcdef')).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  test('handles empty string', () => {
    expect(splitGraphemes('')).toEqual([]);
  });

  test('handles emoji as single grapheme', () => {
    expect(splitGraphemes('päss🔑')).toEqual(['p', 'ä', 's', 's', '🔑']);
  });

  test('handles multi-codepoint emoji', () => {
    expect(splitGraphemes('👨‍👩‍👧‍👦')).toEqual(['👨‍👩‍👧‍👦']);
  });
});

describe('parsePositions', () => {
  test('parses comma-separated positions', () => {
    expect(parsePositions('3,5,7')).toEqual({ indices: [3, 5, 7], invalid: [] });
  });

  test('parses space-separated positions', () => {
    expect(parsePositions('3 5 7')).toEqual({ indices: [3, 5, 7], invalid: [] });
  });

  test('parses mixed separators', () => {
    expect(parsePositions('3, 5,7')).toEqual({ indices: [3, 5, 7], invalid: [] });
  });

  test('returns empty for empty input', () => {
    expect(parsePositions('')).toEqual({ indices: [], invalid: [] });
    expect(parsePositions('   ')).toEqual({ indices: [], invalid: [] });
  });

  test('skips non-numeric entries and flags them', () => {
    expect(parsePositions('3,x,7')).toEqual({ indices: [3, 7], invalid: ['x'] });
  });

  test('deduplicates while preserving order', () => {
    expect(parsePositions('5,3,5')).toEqual({ indices: [5, 3], invalid: [] });
  });

  test('rejects zero and negative positions', () => {
    expect(parsePositions('0,3,-1,5')).toEqual({ indices: [3, 5], invalid: ['0', '-1'] });
  });

  test('handles multiple invalid entries', () => {
    expect(parsePositions('a,b,3')).toEqual({ indices: [3], invalid: ['a', 'b'] });
  });
});

describe('extractLetters', () => {
  test('1-based indexing', () => {
    expect(extractLetters('abcdef', [1, 3, 5]).letters).toEqual(['a', 'c', 'e']);
  });

  test('preserves requested order', () => {
    expect(extractLetters('abcdef', [5, 1]).letters).toEqual(['e', 'a']);
  });

  test('flags out-of-range positions', () => {
    const result = extractLetters('abc', [1, 5, 3]);
    expect(result.letters).toEqual(['a', 'c']);
    expect(result.outOfRange).toEqual([5]);
  });

  test('empty password returns empty result', () => {
    expect(extractLetters('', [1, 2, 3]).letters).toEqual([]);
    expect(extractLetters('', [1, 2, 3]).outOfRange).toEqual([1, 2, 3]);
  });

  test('handles unicode correctly', () => {
    const result = extractLetters('päss🔑', [1, 2, 3, 4, 5]);
    expect(result.letters).toEqual(['p', 'ä', 's', 's', '🔑']);
  });

  test('handles emoji in password', () => {
    const result = extractLetters('a🔑c', [1, 2, 3]);
    expect(result.letters).toEqual(['a', '🔑', 'c']);
  });
});

describe('extractLettersWithValidation', () => {
  test('combines parsing and extraction', () => {
    const result = extractLettersWithValidation('abcdef', '1,3,5');
    expect(result.letters).toEqual(['a', 'c', 'e']);
    expect(result.outOfRange).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  test('handles invalid positions in input', () => {
    const result = extractLettersWithValidation('abc', '1,x,5');
    expect(result.letters).toEqual(['a']);
    expect(result.outOfRange).toEqual([5]);
    expect(result.invalid).toEqual(['x']);
  });

  test('handles empty password with positions', () => {
    const result = extractLettersWithValidation('', '1,2,3');
    expect(result.letters).toEqual([]);
    expect(result.outOfRange).toEqual([1, 2, 3]);
  });
});