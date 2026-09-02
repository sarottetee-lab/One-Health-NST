/**
 * Utilities mirroring Google Apps Script Firestore document slugification and ID resolution
 */

export function slug(v: any): string {
  return String(v == null ? '' : v)
    .trim()
    .replace(/[\/\\\.\#\$\[\]]/g, '-') // Characters forbidden in Firestore document IDs
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

export function docIdFor(row: Record<string, any>, keys: string[] = [], rowIndex: number = 1): string {
  if (!keys || !keys.length) return 'row-' + rowIndex;
  const parts = keys
    .map((k) => slug(row[k]))
    .filter(Boolean);
  return parts.length ? parts.join('__') : 'row-' + rowIndex;
}

export function toPlain(value: any): any {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export interface CharacterAnalysis {
  original: string;
  sanitized: string;
  hasIllegalChars: boolean;
  illegalCharsFound: string[];
  isTruncated: boolean;
}

export function analyzeSlug(input: string): CharacterAnalysis {
  const illegalRegex = /[\/\\\.\#\$\[\]]/g;
  const matches = input.match(illegalRegex) || [];
  const sanitized = slug(input);

  return {
    original: input,
    sanitized,
    hasIllegalChars: matches.length > 0,
    illegalCharsFound: Array.from(new Set(matches)),
    isTruncated: input.length > 80,
  };
}
