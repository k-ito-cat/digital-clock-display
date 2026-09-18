import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '~/lib/storage';
import { useNotices } from './notices-context';
import {
  clampPlacement,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SettingsContext,
  type Settings,
} from './settings-context';

/** 配置の保存形式を変えたため、読み取れない古い値は既定へ寄せる */
const migrate = (stored: Partial<Settings>): Partial<Settings> => {
  const placement = stored.placement;
  const usable =
    placement !== null &&
    typeof placement === 'object' &&
    typeof placement.x === 'number' &&
    typeof placement.y === 'number';
  return { ...stored, placement: usable ? clampPlacement(placement) : DEFAULT_SETTINGS.placement };
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { notify } = useNotices();
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...migrate(readJson<Partial<Settings>>(SETTINGS_STORAGE_KEY, {})),
  }));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  // 保存の失敗を毎回通知すると煩いため、一度だけ知らせる
  const reportedFailure = useRef(false);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        const result = writeJson(SETTINGS_STORAGE_KEY, next);
        if (result.ok) setSavedAt(Date.now());
        if (!result.ok && !reportedFailure.current) {
          reportedFailure.current = true;
          notify(
            'error',
            result.reason === 'quota'
              ? '設定を保存できませんでした。保存領域がいっぱいです。'
              : '設定を保存できませんでした。この環境では次回起動時に元に戻ります。',
          );
        }
        return next;
      });
    },
    [notify],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const value = useMemo(() => ({ settings, update, savedAt }), [settings, update, savedAt]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
