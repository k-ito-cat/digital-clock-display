import { createContext, useContext } from 'react';
import type { UnsplashPhoto, UnsplashRate } from '~/lib/unsplash';

export const UNSPLASH_QUERIES = [
  { value: 'nature', label: '自然' },
  { value: 'city', label: '都市' },
  { value: 'mountains', label: '山' },
  { value: 'ocean', label: '海' },
  { value: 'animals', label: '動物' },
  { value: 'space', label: '宇宙' },
] as const;

export const REFRESH_INTERVALS = [
  { value: 15 * 60 * 1000, label: '15分' },
  { value: 30 * 60 * 1000, label: '30分' },
  { value: 60 * 60 * 1000, label: '1時間' },
  { value: 6 * 60 * 60 * 1000, label: '6時間' },
  { value: 12 * 60 * 60 * 1000, label: '12時間' },
  { value: 24 * 60 * 60 * 1000, label: '1日' },
] as const;

/** ローカル画像は保存領域を圧迫するため、受け入れる上限を決めておく */
export const LOCAL_IMAGE_LIMIT_BYTES = 2 * 1024 * 1024;

export type BackgroundStatus = 'ok' | 'failed' | 'rate-limited' | 'unauthorized';

export type BackgroundContextValue = {
  /** 表示に使う画像。ローカル画像を指定している場合はそちら */
  imageUrl: string | null;
  photo: UnsplashPhoto | null;
  isLocal: boolean;
  status: BackgroundStatus;
  rate: UnsplashRate | null;
  nextRefreshAt: number | null;
  refresh: () => void;
  setLocalImage: (file: File) => void;
  clearLocalImage: () => void;
};

export const BackgroundContext = createContext<BackgroundContextValue | null>(null);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) throw new Error('useBackground must be used within BackgroundProvider');
  return context;
};

export const STATUS_LABEL: Record<BackgroundStatus, string> = {
  ok: '正常',
  failed: '取得に失敗しています',
  'rate-limited': '取得の上限に達しています',
  unauthorized: 'アクセスキーが設定されていません',
};
