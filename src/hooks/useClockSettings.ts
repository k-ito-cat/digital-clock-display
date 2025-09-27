import { useEffect, useState } from 'react';
import {
  STORAGE_KEY_CURSOR_HIDE_SECONDS,
  STORAGE_KEY_CLOCK_SHOW_DATE,
  STORAGE_KEY_CLOCK_TIME_FORMAT,
} from '~/constants/keyName';
import { TimeFormat } from '~/hooks/useCurrentTime';

const DEFAULT_CURSOR_HIDE_SECONDS = 3;

export const useClockSettings = () => {
  const [cursorHideSeconds, setCursorHideSecondsState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CURSOR_HIDE_SECONDS);
    if (!stored) return DEFAULT_CURSOR_HIDE_SECONDS;
    return Number(stored) || DEFAULT_CURSOR_HIDE_SECONDS;
  });

  const [showDate, setShowDateState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CLOCK_SHOW_DATE);
    if (stored === null) return true;
    return stored === 'true';
  });
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CLOCK_TIME_FORMAT) as TimeFormat | null;
    return stored ?? 'HH:mm:ss';
  });

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

  const setShowDate = (next: boolean) => {
    setShowDateState(next);
    localStorage.setItem(STORAGE_KEY_CLOCK_SHOW_DATE, String(next));
  };

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem(STORAGE_KEY_CLOCK_TIME_FORMAT, format);
  };

  return {
    cursorHideSeconds,
    setCursorHideSeconds,
    showDate,
    setShowDate,
    timeFormat,
    setTimeFormat,
  };
};


