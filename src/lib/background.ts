import type { UnsplashPhoto } from './unsplash';

/**
 * 自動の切替をしない設定。取得済みの画像を保ち続け、再読み込みでも取得し直さない。
 * Infinity は JSON へ保存できないため、0 を番兵に使う（autoHideSeconds の 0 と同じ扱い）。
 */
export const NO_REFRESH_INTERVAL_MS = 0;

export const isAutoRefresh = (refreshIntervalMs: number) => refreshIntervalMs > NO_REFRESH_INTERVAL_MS;

export const clampRefreshIntervalMs = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= NO_REFRESH_INTERVAL_MS ? value : fallback;

export type BackgroundCache = { photo: UnsplashPhoto; fetchedAt: number; query: string };

/**
 * 取得し直す必要があるか。
 * 画像がない場合とカテゴリが変わった場合は、自動の切替をしない設定でも取得する。
 * 背景が出ないままになること、カテゴリの変更が無反応になることを避けるため。
 */
export const needsFetch = (cache: BackgroundCache | null, query: string, refreshIntervalMs: number, now: number) => {
  if (!cache || cache.query !== query) return true;
  if (!isAutoRefresh(refreshIntervalMs)) return false;
  return now - cache.fetchedAt >= refreshIntervalMs;
};

/** 次に自動で切り替わる時刻。自動の切替をしない場合と画像がない場合は持たない */
export const nextRefreshAt = (cache: BackgroundCache | null, refreshIntervalMs: number) =>
  cache && isAutoRefresh(refreshIntervalMs) ? cache.fetchedAt + refreshIntervalMs : null;
