import { describe, expect, it } from 'vitest';
import {
  clampRefreshIntervalMs,
  NO_REFRESH_INTERVAL_MS,
  needsFetch,
  nextRefreshAt,
  type BackgroundCache,
} from './background';

const HOUR = 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

const cache = (overrides: Partial<BackgroundCache> = {}): BackgroundCache => ({
  photo: { url: 'https://example.test/photo', authorName: '撮影者', authorUrl: '', photoUrl: '' },
  fetchedAt: NOW,
  query: 'nature',
  ...overrides,
});

describe('needsFetch', () => {
  it('間隔を過ぎたら取得し直す', () => {
    expect(needsFetch(cache(), 'nature', HOUR, NOW + HOUR)).toBe(true);
    expect(needsFetch(cache(), 'nature', HOUR, NOW + HOUR - 1)).toBe(false);
  });

  it('切り替えない設定では、どれだけ時間が経っても取得しない', () => {
    expect(needsFetch(cache(), 'nature', NO_REFRESH_INTERVAL_MS, NOW + 365 * 24 * HOUR)).toBe(false);
  });

  it('切り替えない設定でも、画像がなければ取得する', () => {
    expect(needsFetch(null, 'nature', NO_REFRESH_INTERVAL_MS, NOW)).toBe(true);
  });

  it('切り替えない設定でも、カテゴリを変えたら取得する', () => {
    expect(needsFetch(cache(), 'city', NO_REFRESH_INTERVAL_MS, NOW)).toBe(true);
  });
});

describe('nextRefreshAt', () => {
  it('切り替えない設定では次の切替予定を持たない', () => {
    expect(nextRefreshAt(cache(), HOUR)).toBe(NOW + HOUR);
    expect(nextRefreshAt(cache(), NO_REFRESH_INTERVAL_MS)).toBeNull();
    expect(nextRefreshAt(null, HOUR)).toBeNull();
  });
});

describe('clampRefreshIntervalMs', () => {
  it('保存値が数値として読めない場合と負の場合は既定へ戻す', () => {
    expect(clampRefreshIntervalMs(NO_REFRESH_INTERVAL_MS, HOUR)).toBe(NO_REFRESH_INTERVAL_MS);
    expect(clampRefreshIntervalMs(-1, HOUR)).toBe(HOUR);
    expect(clampRefreshIntervalMs('30分', HOUR)).toBe(HOUR);
    expect(clampRefreshIntervalMs(undefined, HOUR)).toBe(HOUR);
  });
});
