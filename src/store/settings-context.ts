import { createContext, useContext } from 'react';

/**
 * 配置は面を12分割した格子点で指定する。0〜12 の13点で、6が中央。
 * 端（0と12）は面の縁に接する。
 */
export const PLACEMENT_STEPS = 12;
export const PLACEMENT_CENTER = PLACEMENT_STEPS / 2;

export type Placement = { x: number; y: number };

export const CENTER_PLACEMENT: Placement = { x: PLACEMENT_CENTER, y: PLACEMENT_CENTER };

export const clampPlacement = (value: Placement): Placement => ({
  x: Math.min(PLACEMENT_STEPS, Math.max(0, Math.round(value.x))),
  y: Math.min(PLACEMENT_STEPS, Math.max(0, Math.round(value.y))),
});

export const describePlacement = ({ x, y }: Placement) => {
  const horizontal = x === 0 ? '左端' : x === PLACEMENT_CENTER ? '中央' : x === PLACEMENT_STEPS ? '右端' : `左から${x}`;
  const vertical = y === 0 ? '上端' : y === PLACEMENT_CENTER ? '中央' : y === PLACEMENT_STEPS ? '下端' : `上から${y}`;
  return `横 ${horizontal} / 縦 ${vertical}`;
};

export const FACES = [
  { id: 'sans', label: 'サンセリフ' },
  { id: 'mono', label: '等幅' },
  { id: 'serif', label: '明朝' },
] as const;
export type FaceId = (typeof FACES)[number]['id'];

export type BackgroundKind = 'image' | 'solid' | 'black' | 'transparent';

/**
 * 背景が利用者の選んだ画像である以上、前景だけでは読めない場面が残る。
 * 面を持たない処理に加えて、旧実装にあった半透明の面とすりガラスも選べるようにする。
 */
export const LEGIBILITY_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'shadow', label: '影' },
  { value: 'scrim', label: '減光' },
  { value: 'panel', label: '面' },
  { value: 'glass', label: 'すりガラス' },
] as const;
export type Legibility = (typeof LEGIBILITY_OPTIONS)[number]['value'];

export type Settings = {
  theme: 'dark' | 'light';
  face: FaceId;
  scale: number;
  placement: Placement;
  imageSource: 'unsplash' | 'local';
  textColor: string;
  legibility: Legibility;
  showSeconds: boolean;
  showDate: boolean;
  showWeekday: boolean;
  hour12: boolean;
  background: BackgroundKind;
  solidColor: string;
  unsplashQuery: string;
  refreshIntervalMs: number;
  /** 操作UIが隠れるまでの秒数。0 は隠さない（常時表示） */
  autoHideSeconds: number;
  notifyEnabled: boolean;
  soundEnabled: boolean;
  work: number;
  shortBreak: number;
  longBreakEnabled: boolean;
  longBreak: number;
  totalSets: number;
  longBreakEvery: number;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  face: 'sans',
  scale: 1,
  placement: CENTER_PLACEMENT,
  imageSource: 'unsplash',
  textColor: '',
  legibility: 'shadow',
  showSeconds: true,
  showDate: true,
  showWeekday: false,
  hour12: false,
  background: 'image',
  solidColor: '#3a4a5a',
  unsplashQuery: 'nature',
  refreshIntervalMs: 60 * 60 * 1000,
  autoHideSeconds: 3,
  notifyEnabled: false,
  soundEnabled: false,
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreakEnabled: true,
  longBreak: 15 * 60,
  totalSets: 4,
  longBreakEvery: 4,
};

/**
 * ポモドーロの構成。既定値は DEFAULT_SETTINGS を正本とし、ここでは対象の項目だけを選ぶ。
 * hig: form.reset-to-default。構成そのものは元へ戻しにくいため、既定へ戻す操作を添える。
 */
export const DEFAULT_POMODORO = {
  work: DEFAULT_SETTINGS.work,
  shortBreak: DEFAULT_SETTINGS.shortBreak,
  longBreakEnabled: DEFAULT_SETTINGS.longBreakEnabled,
  longBreak: DEFAULT_SETTINGS.longBreak,
  totalSets: DEFAULT_SETTINGS.totalSets,
  longBreakEvery: DEFAULT_SETTINGS.longBreakEvery,
} satisfies Partial<Settings>;

export const isDefaultPomodoro = (settings: Settings) =>
  (Object.keys(DEFAULT_POMODORO) as (keyof typeof DEFAULT_POMODORO)[]).every(
    (key) => settings[key] === DEFAULT_POMODORO[key],
  );

/** すべての項目が既定と同じか。初期化の操作を押せる状態にするかの判定に使う */
export const isDefaultSettings = (settings: Settings) =>
  (Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]).every((key) =>
    key === 'placement'
      ? settings.placement.x === DEFAULT_SETTINGS.placement.x && settings.placement.y === DEFAULT_SETTINGS.placement.y
      : settings[key] === DEFAULT_SETTINGS[key],
  );

export const SETTINGS_STORAGE_KEY = 'settings';

export type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  /** 直近に保存できた時刻。保存された事実を利用者へ示すために使う */
  savedAt: number | null;
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
