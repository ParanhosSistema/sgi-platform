// frontend/app/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sgi-platform-backend.onrender.com';

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store', ...init });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} -> ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}