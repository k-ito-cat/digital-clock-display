import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEY_CURSOR_HIDE_SECONDS,
  STORAGE_KEY_CLOCK_SHOW_DATE,
  STORAGE_KEY_CLOCK_TIME_FORMAT,
  STORAGE_KEY_POMODORO_CONTROLS,
  STORAGE_KEY_TIMER_CONTROLS,
  STORAGE_KEY_THEME_MODE,
  STORAGE_KEY_GLASS_ENABLED,
  STORAGE_KEY_SHOW_SURFACE_BACKGROUND,
  STORAGE_KEY_BACKGROUND_TYPE,
  STORAGE_KEY_TEXT_COLOR,
  STORAGE_KEY_BACKGROUND_COLOR,
} from '~/constants/keyName';
import { TimeFormat } from '~/hooks/useCurrentTime';

const DEFAULT_CURSOR_HIDE_SECONDS = 3;
const DEFAULT_TIME_FORMAT: TimeFormat = 'HH:mm:ss';
export type ThemeMode = 'dark' | 'light';
export type BackgroundType = 'image' | 'white' | 'black' | 'transparent' | 'solid';
const DEFAULT_THEME_MODE: ThemeMode = 'dark';

type ClockSettingsContextType = {
  cursorHideSeconds: number;
  setCursorHideSeconds: (seconds: number) => void;
  showDate: boolean;
  setShowDate: (next: boolean) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  showPomodoroControls: boolean;
  setShowPomodoroControls: (next: boolean) => void;
  showTimerControls: boolean;
  setShowTimerControls: (next: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  backgroundType: BackgroundType;
  setBackgroundType: (next: BackgroundType) => void;
  backgroundColor: string;
  setBackgroundColor: (next: string) => void;
  textColor: string;
  setTextColor: (next: string) => void;
  glassmorphismEnabled: boolean;
  setGlassmorphismEnabled: (next: boolean) => void;
  surfaceBackgroundEnabled: boolean;
  setSurfaceBackgroundEnabled: (next: boolean) => void;
};

const ClockSettingsContext = createContext<ClockSettingsContextType | undefined>(undefined);

const readNumber = (key: string, fallback: number) => {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readBoolean = (key: string, fallback: boolean) => {
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  return stored === 'true';
};

const readTimeFormat = () => {
  const stored = localStorage.getItem(STORAGE_KEY_CLOCK_TIME_FORMAT) as TimeFormat | null;
  return stored ?? DEFAULT_TIME_FORMAT;
};

const readThemeMode = () => {
  const stored = localStorage.getItem(STORAGE_KEY_THEME_MODE) as ThemeMode | null;
  return stored ?? DEFAULT_THEME_MODE;
};

const readBackgroundType = () => {
  const stored = localStorage.getItem(STORAGE_KEY_BACKGROUND_TYPE) as BackgroundType | null;
  return stored ?? 'image';
};

const readBackgroundColor = () => {
  return localStorage.getItem(STORAGE_KEY_BACKGROUND_COLOR) ?? '#ffffff';
};

const readTextColor = () => {
  return localStorage.getItem(STORAGE_KEY_TEXT_COLOR) ?? '';
};

export const ClockSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [cursorHideSeconds, setCursorHideSecondsState] = useState<number>(() =>
    readNumber(STORAGE_KEY_CURSOR_HIDE_SECONDS, DEFAULT_CURSOR_HIDE_SECONDS),
  );
  const [showDate, setShowDateState] = useState<boolean>(() => readBoolean(STORAGE_KEY_CLOCK_SHOW_DATE, true));
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => readTimeFormat());
  const [showPomodoroControls, setShowPomodoroControlsState] = useState<boolean>(() =>
    readBoolean(STORAGE_KEY_POMODORO_CONTROLS, true),
  );
  const [showTimerControls, setShowTimerControlsState] = useState<boolean>(() =>
    readBoolean(STORAGE_KEY_TIMER_CONTROLS, true),
  );
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readThemeMode());
  const [backgroundType, setBackgroundTypeState] = useState<BackgroundType>(() => readBackgroundType());
  const [backgroundColor, setBackgroundColorState] = useState<string>(() => readBackgroundColor());
  const [textColor, setTextColorState] = useState<string>(() => readTextColor());
  const [glassmorphismEnabled, setGlassmorphismEnabledState] = useState<boolean>(() =>
    readBoolean(STORAGE_KEY_GLASS_ENABLED, false),
  );
  const [surfaceBackgroundEnabled, setSurfaceBackgroundEnabledState] = useState<boolean>(() =>
    readBoolean(STORAGE_KEY_SHOW_SURFACE_BACKGROUND, false),
  );

  useEffect(() => {
    const handler = () => {
      setCursorHideSecondsState(readNumber(STORAGE_KEY_CURSOR_HIDE_SECONDS, DEFAULT_CURSOR_HIDE_SECONDS));
    };

    window.addEventListener('cursor-hide-seconds-change', handler as EventListener);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('cursor-hide-seconds-change', handler as EventListener);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setCursorHideSeconds = useCallback((seconds: number) => {
    const clamped = Math.max(1, seconds);
    localStorage.setItem(STORAGE_KEY_CURSOR_HIDE_SECONDS, String(clamped));
    setCursorHideSecondsState(clamped);
    window.dispatchEvent(new Event('cursor-hide-seconds-change'));
  }, []);

  const setShowDate = useCallback((next: boolean) => {
    setShowDateState(next);
    localStorage.setItem(STORAGE_KEY_CLOCK_SHOW_DATE, String(next));
  }, []);

  const setTimeFormat = useCallback((format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem(STORAGE_KEY_CLOCK_TIME_FORMAT, format);
  }, []);

  const setShowPomodoroControls = useCallback((next: boolean) => {
    setShowPomodoroControlsState(next);
    localStorage.setItem(STORAGE_KEY_POMODORO_CONTROLS, String(next));
  }, []);

  const setShowTimerControls = useCallback((next: boolean) => {
    setShowTimerControlsState(next);
    localStorage.setItem(STORAGE_KEY_TIMER_CONTROLS, String(next));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(STORAGE_KEY_THEME_MODE, mode);
  }, []);

  const setBackgroundType = useCallback((next: BackgroundType) => {
    setBackgroundTypeState(next);
    localStorage.setItem(STORAGE_KEY_BACKGROUND_TYPE, next);
  }, []);

  const setBackgroundColor = useCallback((next: string) => {
    const value = next.trim() || '#ffffff';
    setBackgroundColorState(value);
    localStorage.setItem(STORAGE_KEY_BACKGROUND_COLOR, value);
  }, []);

  const setTextColor = useCallback((next: string) => {
    const value = next.trim();
    setTextColorState(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY_TEXT_COLOR, value);
    } else {
      localStorage.removeItem(STORAGE_KEY_TEXT_COLOR);
    }
  }, []);

  const setGlassmorphismEnabled = useCallback((next: boolean) => {
    setGlassmorphismEnabledState(next);
    localStorage.setItem(STORAGE_KEY_GLASS_ENABLED, String(next));
    if (next) {
      setSurfaceBackgroundEnabledState(true);
      localStorage.setItem(STORAGE_KEY_SHOW_SURFACE_BACKGROUND, 'true');
    }
  }, []);

  const setSurfaceBackgroundEnabled = useCallback((next: boolean) => {
    setSurfaceBackgroundEnabledState(next);
    localStorage.setItem(STORAGE_KEY_SHOW_SURFACE_BACKGROUND, String(next));
    if (!next) {
      setGlassmorphismEnabledState(false);
      localStorage.setItem(STORAGE_KEY_GLASS_ENABLED, 'false');
    }
  }, []);

  const value = useMemo<ClockSettingsContextType>(
    () => ({
      cursorHideSeconds,
      setCursorHideSeconds,
      showDate,
      setShowDate,
      timeFormat,
      setTimeFormat,
      showPomodoroControls,
      setShowPomodoroControls,
      showTimerControls,
      setShowTimerControls,
      themeMode,
      setThemeMode,
      backgroundType,
      setBackgroundType,
      backgroundColor,
      setBackgroundColor,
      textColor,
      setTextColor,
      glassmorphismEnabled,
      setGlassmorphismEnabled,
      surfaceBackgroundEnabled,
      setSurfaceBackgroundEnabled,
    }),
    [
      cursorHideSeconds,
      setCursorHideSeconds,
      showDate,
      setShowDate,
      timeFormat,
      setTimeFormat,
      showPomodoroControls,
      setShowPomodoroControls,
      showTimerControls,
      setShowTimerControls,
      themeMode,
      setThemeMode,
      backgroundType,
      setBackgroundType,
      backgroundColor,
      setBackgroundColor,
      textColor,
      setTextColor,
      glassmorphismEnabled,
      setGlassmorphismEnabled,
      surfaceBackgroundEnabled,
      setSurfaceBackgroundEnabled,
    ],
  );

  return <ClockSettingsContext.Provider value={value}>{children}</ClockSettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useClockSettings = () => {
  const ctx = useContext(ClockSettingsContext);
  if (!ctx) {
    throw new Error('useClockSettings must be used within ClockSettingsProvider');
  }
  return ctx;
};
