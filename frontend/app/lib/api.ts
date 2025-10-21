export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sgi-platform-backend.onrender.com';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    ...init,
    // Revalidate on server side every 120s for SSG
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} fetching ${url}`);
  }
  return res.json() as Promise<T>;
}
