import { describe, expect, it } from 'vitest';
import {
  CENTER_PLACEMENT,
  DEFAULT_SETTINGS,
  isDefaultPomodoro,
  isDefaultSettings,
  normalizeBackground,
} from './settings-context';

describe('normalizeBackground', () => {
  it('廃止した透明を黒へ移行する', () => {
    expect(normalizeBackground('transparent')).toBe('black');
  });

  it('未知の値は既定の画像へ戻す', () => {
    expect(normalizeBackground('unknown')).toBe('image');
  });
});

describe('isDefaultSettings', () => {
  it('既定のままなら真', () => {
    expect(isDefaultSettings(DEFAULT_SETTINGS)).toBe(true);
    // 同じ値の別オブジェクトでも、参照ではなく値で判定する
    expect(isDefaultSettings({ ...DEFAULT_SETTINGS, placement: { ...CENTER_PLACEMENT } })).toBe(true);
  });

  it('1つでも既定と違えば偽', () => {
    expect(isDefaultSettings({ ...DEFAULT_SETTINGS, theme: 'light' })).toBe(false);
    expect(isDefaultSettings({ ...DEFAULT_SETTINGS, placement: { x: 0, y: 0 } })).toBe(false);
    expect(isDefaultSettings({ ...DEFAULT_SETTINGS, unsplashQuery: 'city' })).toBe(false);
  });
});

describe('isDefaultPomodoro', () => {
  it('構成の項目だけを見る。関係ない設定が変わっても真のまま', () => {
    expect(isDefaultPomodoro(DEFAULT_SETTINGS)).toBe(true);
    expect(isDefaultPomodoro({ ...DEFAULT_SETTINGS, theme: 'light', autoHideSeconds: 0 })).toBe(true);
  });

  it('構成が1つでも既定と違えば偽', () => {
    expect(isDefaultPomodoro({ ...DEFAULT_SETTINGS, work: 30 * 60 })).toBe(false);
    expect(isDefaultPomodoro({ ...DEFAULT_SETTINGS, longBreakEnabled: false })).toBe(false);
    expect(isDefaultPomodoro({ ...DEFAULT_SETTINGS, totalSets: 6 })).toBe(false);
  });
});
