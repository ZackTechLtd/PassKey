export interface ParsePositionsResult {
  indices: number[];
  invalid: string[];
}

export interface ExtractLettersResult {
  letters: string[];
  outOfRange: number[];
  invalid: string[];
}

export function splitGraphemes(str: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(str), (s) => s.segment);
  }
  return Array.from(str);
}

export function parsePositions(input: string): ParsePositionsResult {
  if (!input || !input.trim()) {
    return { indices: [], invalid: [] };
  }

  const parts = input.split(/[,\s]+/);
  const seen = new Set<number>();
  const indices: number[] = [];
  const invalid: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const num = parseInt(trimmed, 10);
    if (Number.isNaN(num)) {
      invalid.push(trimmed);
      continue;
    }

    if (num <= 0) {
      invalid.push(trimmed);
      continue;
    }

    if (!seen.has(num)) {
      seen.add(num);
      indices.push(num);
    }
  }

  return { indices, invalid };
}

export function extractLetters(password: string, positions: number[]): ExtractLettersResult {
  const graphemes = splitGraphemes(password);
  const letters: string[] = [];
  const outOfRange: number[] = [];

  for (const pos of positions) {
    const index = pos - 1;
    if (index >= 0 && index < graphemes.length) {
      letters.push(graphemes[index]);
    } else {
      outOfRange.push(pos);
    }
  }

  return { letters, outOfRange, invalid: [] };
}

export function extractLettersWithValidation(
  password: string,
  positionsInput: string
): ExtractLettersResult {
  const { indices, invalid } = parsePositions(positionsInput);
  const { letters, outOfRange } = extractLetters(password, indices);
  return { letters, outOfRange, invalid };
}