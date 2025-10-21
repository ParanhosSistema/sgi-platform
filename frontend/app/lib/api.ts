// frontend/app/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
