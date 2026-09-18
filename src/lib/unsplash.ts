/**
 * Unsplash からのランダム画像取得。
 * アクセスキーはクライアントに露出する。判断は docs/decisions/0003 を参照する。
 */
export type UnsplashPhoto = {
  url: string;
  authorName: string;
  authorUrl: string;
  photoUrl: string;
};

export type UnsplashRate = { limit: number; remaining: number };

export type UnsplashResult =
  | { ok: true; photo: UnsplashPhoto; rate: UnsplashRate | null }
  | { ok: false; reason: 'rate-limited' | 'unauthorized' | 'network'; rate: UnsplashRate | null };

const ENDPOINT = 'https://api.unsplash.com/photos/random';
const UTM = 'utm_source=digital-clock-display&utm_medium=referral';

const readRate = (headers: Headers): UnsplashRate | null => {
  const limit = Number(headers.get('x-ratelimit-limit'));
  const remaining = Number(headers.get('x-ratelimit-remaining'));
  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) return null;
  return { limit, remaining };
};

export const fetchRandomPhoto = async (query: string, signal?: AbortSignal): Promise<UnsplashResult> => {
  const key = import.meta.env.VITE_UNSPLASH_API_ACCESS_KEY;
  if (!key) return { ok: false, reason: 'unauthorized', rate: null };

  const url = new URL(ENDPOINT);
  url.searchParams.set('orientation', 'landscape');
  if (query) url.searchParams.set('query', query);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      signal,
    });
    const rate = readRate(response.headers);

    if (!response.ok) {
      // Unsplash は上限超過を 403 で返す
      const reason = response.status === 403 ? 'rate-limited' : 'unauthorized';
      return { ok: false, reason: response.status === 401 ? 'unauthorized' : reason, rate };
    }

    const data = (await response.json()) as {
      urls: { full: string; regular: string };
      links: { html: string };
      user: { name: string; links: { html: string } };
    };

    return {
      ok: true,
      rate,
      photo: {
        url: data.urls.regular,
        authorName: data.user.name,
        authorUrl: `${data.user.links.html}?${UTM}`,
        photoUrl: `${data.links.html}?${UTM}`,
      },
    };
  } catch {
    return { ok: false, reason: 'network', rate: null };
  }
};
