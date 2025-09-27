import { useEffect, useState } from 'react';
import { STORAGE_KEY_CURSOR_HIDE_SECONDS } from '~/constants/keyName';

const DEFAULT_CURSOR_HIDE_SECONDS = 3;

export const useClockSettings = () => {
  const [cursorHideSeconds, setCursorHideSecondsState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CURSOR_HIDE_SECONDS);
    if (!stored) return DEFAULT_CURSOR_HIDE_SECONDS;
    return Number(stored) || DEFAULT_CURSOR_HIDE_SECONDS;
  });

  const [cursorHideEnabled, setCursorHideEnabled] = useState<boolean>(true);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY_CURSOR_HIDE_SECONDS);
      if (!stored) return;
      const seconds = Number(stored) || DEFAULT_CURSOR_HIDE_SECONDS;
      setCursorHideSecondsState(seconds);
    };

    window.addEventListener('storage', handler);
    window.addEventListener('cursor-hide-seconds-change', handler as EventListener);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('cursor-hide-seconds-change', handler as EventListener);
    };
  }, []);

  const setCursorHideSeconds = (seconds: number) => {
    const clamped = Math.max(1, seconds);
    localStorage.setItem(STORAGE_KEY_CURSOR_HIDE_SECONDS, String(clamped));
    setCursorHideSecondsState(clamped);
    window.dispatchEvent(new Event('cursor-hide-seconds-change'));
  };

  return {
    cursorHideSeconds,
    setCursorHideSeconds,
    cursorHideEnabled,
    setCursorHideEnabled,
  };
};


