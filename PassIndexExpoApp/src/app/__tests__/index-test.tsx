import { extractLettersWithValidation } from '@/lib/extract-letters';

describe('PassIndex integration', () => {
  test('full flow: password + positions -> letters', () => {
    const result = extractLettersWithValidation('abcdef', '1,3,5');
    expect(result.letters).toEqual(['a', 'c', 'e']);
    expect(result.outOfRange).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  test('out of range positions are flagged', () => {
    const result = extractLettersWithValidation('abc', '1,5');
    expect(result.letters).toEqual(['a']);
    expect(result.outOfRange).toEqual([5]);
  });

  test('invalid positions are flagged', () => {
    const result = extractLettersWithValidation('abcdef', '1,x,3');
    expect(result.letters).toEqual(['a', 'c']);
    expect(result.invalid).toEqual(['x']);
  });

  test('empty password returns no letters', () => {
    const result = extractLettersWithValidation('', '1,2,3');
    expect(result.letters).toEqual([]);
    expect(result.outOfRange).toEqual([1, 2, 3]);
  });

  test('unicode characters work correctly', () => {
    const result = extractLettersWithValidation('päss🔑', '1,2,3,4,5');
    expect(result.letters).toEqual(['p', 'ä', 's', 's', '🔑']);
  });
});