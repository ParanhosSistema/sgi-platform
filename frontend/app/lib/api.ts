// Minimal API client for Next.js App Router
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sgi-platform-backend.onrender.com';

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, { ...init, cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status} on ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}
