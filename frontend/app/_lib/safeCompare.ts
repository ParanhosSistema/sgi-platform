export type Dir = 'asc' | 'desc';

export function isNumericLike(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'string') return v.trim() !== '' && !Number.isNaN(Number(v));
  return false;
}

export function safeCompare(a: unknown, b: unknown, dir: Dir = 'asc'): number {
  const m = dir === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return -1 * m;
  if (b == null) return 1 * m;
  if (isNumericLike(a) && isNumericLike(b)) return (Number(a) - Number(b)) * m;
  return String(a).localeCompare(String(b)) * m;
}
