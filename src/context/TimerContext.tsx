import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type TimerContextValue = {
  totalSeconds: number;
  remainingSeconds: number;
  running: boolean;
  setTotalSeconds: (seconds: number) => void;
  setRemainingSeconds: (seconds: number) => void;
  setRunning: (running: boolean) => void;
  reset: () => void;
};

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

const clampSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.floor(seconds));
};

const DEFAULT_SECONDS = 25 * 60;

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [totalSeconds, setTotalSecondsState] = useState<number>(DEFAULT_SECONDS);
  const [remainingSeconds, setRemainingSecondsState] = useState<number>(DEFAULT_SECONDS);
  const [running, setRunningState] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clearIntervalRef();
      return;
    }

    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setRemainingSecondsState((prev) => {
        if (prev <= 1) {
          clearIntervalRef();
          setRunningState(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearIntervalRef;
  }, [running, clearIntervalRef]);

  useEffect(() => {
    setRemainingSecondsState((prev) => {
      if (running) {
        return Math.min(prev, totalSeconds);
      }
      return totalSeconds;
    });
  }, [totalSeconds, running]);

  const setTotalSeconds = useCallback(
    (seconds: number) => {
      const clamped = clampSeconds(seconds);
      setTotalSecondsState(clamped);
      setRemainingSecondsState((prev) => {
        if (running) {
          return Math.min(prev, clamped);
        }
        return clamped;
      });
    },
    [running],
  );

  const setRemainingSeconds = useCallback(
    (seconds: number) => {
      const clamped = clampSeconds(seconds);
      setRemainingSecondsState(Math.min(clamped, totalSeconds));
    },
    [totalSeconds],
  );

  const setRunning = useCallback(
    (next: boolean) => {
      setRunningState(() => {
        if (next) {
          if (totalSeconds <= 0) {
            setRemainingSecondsState(0);
            clearIntervalRef();
            return false;
          }
          setRemainingSecondsState((value) => {
            if (value <= 0 || value > totalSeconds) {
              return totalSeconds;
            }
            return value;
          });
          return true;
        }
        clearIntervalRef();
        return false;
      });
    },
    [totalSeconds, clearIntervalRef],
  );

  const reset = useCallback(() => {
    clearIntervalRef();
    setRunningState(false);
    setRemainingSecondsState(totalSeconds);
  }, [totalSeconds, clearIntervalRef]);

  const value = useMemo<TimerContextValue>(
    () => ({
      totalSeconds,
      remainingSeconds,
      running,
      setTotalSeconds,
      setRemainingSeconds,
      setRunning,
      reset,
    }),
    [totalSeconds, remainingSeconds, running, setTotalSeconds, setRemainingSeconds, setRunning, reset],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTimerContext = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimerContext must be used within TimerProvider');
  }
  return ctx;
};

