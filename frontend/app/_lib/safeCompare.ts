export type Dir = 'asc' | 'desc';

function isNumericLike(val: any): boolean {
  if (val == null) return false;
  if (typeof val === 'number') return Number.isFinite(val);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return false;
    const num = Number(trimmed);
    return Number.isFinite(num);
  }
  return false;
}

export function safeCompare(a: any, b: any, dir: Dir = 'asc'): number {
  const aIsNum = isNumericLike(a);
  const bIsNum = isNumericLike(b);
  
  if (aIsNum && bIsNum) {
    const numA = Number(a);
    const numB = Number(b);
    return dir === 'asc' ? numA - numB : numB - numA;
  }
  
  if (aIsNum && !bIsNum) return dir === 'asc' ? -1 : 1;
  if (!aIsNum && bIsNum) return dir === 'asc' ? 1 : -1;
  
  const strA = String(a ?? '').toLowerCase();
  const strB = String(b ?? '').toLowerCase();
  
  if (strA < strB) return dir === 'asc' ? -1 : 1;
  if (strA > strB) return dir === 'asc' ? 1 : -1;
  return 0;
}
