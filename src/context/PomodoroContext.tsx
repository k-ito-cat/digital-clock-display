import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';


type PomodoroMode = 'work' | 'shortBreak' | 'longBreak' | 'idle';

type PomodoroContextType = {
  remainingSeconds: number;
  running: boolean;
  currentSet: number;
  totalSets: number;
  mode: PomodoroMode;
  workSeconds: number;
  breakSeconds: number;
  setTotalSets: (n: number) => void;
  setWorkSeconds: (seconds: number) => void;
  setBreakSeconds: (seconds: number) => void;
  toggle: () => void;
  reset: () => void;
};

const DEFAULT_WORK = 25 * 60;
const DEFAULT_BREAK = 5 * 60;

const PomodoroContext = createContext<PomodoroContextType>({
  remainingSeconds: DEFAULT_WORK,
  running: false,
  currentSet: 0,
  totalSets: 4,
  mode: 'idle',
  workSeconds: DEFAULT_WORK,
  breakSeconds: DEFAULT_BREAK,
  setTotalSets: () => {},
  setWorkSeconds: () => {},
  setBreakSeconds: () => {},
  toggle: () => {},
  reset: () => {},
});

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const [running, setRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [totalSets, setTotalSets] = useState(4);
  const [mode, setMode] = useState<PomodoroMode>('idle');
  const [workSeconds, setWorkSeconds] = useState(DEFAULT_WORK);
  const [breakSeconds, setBreakSeconds] = useState(DEFAULT_BREAK);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_WORK);
  const timerRef = useRef<number | null>(null);

  const startWork = useCallback(() => {
    setMode('work');
    setRemainingSeconds(workSeconds);
    setRunning(true);
  }, [workSeconds]);

  const nextPhase = useCallback(() => {
    if (mode === 'work') {
      const isLastSet = currentSet >= totalSets;
      if (isLastSet) {
        setMode('idle');
        setRunning(false);
        return;
      }
      setMode('shortBreak');
      setRemainingSeconds(breakSeconds);
      setRunning(true);
    } else {
      // break -> next work
      setCurrentSet((v) => v + 1);
      setMode('work');
      setRemainingSeconds(workSeconds);
      setRunning(true);
    }
  }, [mode, currentSet, totalSets, breakSeconds, workSeconds]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running, mode]);

  useEffect(() => {
    if (remainingSeconds === 0 && running) {
      setRunning(false);
      nextPhase();
    }
  }, [remainingSeconds, running, nextPhase]);

  const toggle = useCallback(() => {
    // 初回はwork開始
    if (mode === 'idle') {
      setCurrentSet((prev) => (prev === 0 ? 1 : prev));
      startWork();
      return;
    }
    setRunning((v) => !v);
  }, [mode, startWork]);

  const reset = useCallback(() => {
    setRunning(false);
    setMode('idle');
    setCurrentSet(0);
    setRemainingSeconds(workSeconds);
  }, [workSeconds]);

  useEffect(() => {
    if (!running && mode === 'idle') {
      setRemainingSeconds(workSeconds);
    }
  }, [workSeconds, running, mode]);

  const value = useMemo(
    () => ({
      remainingSeconds,
      running,
      currentSet,
      totalSets,
      mode,
      workSeconds,
      breakSeconds,
      setTotalSets,
      setWorkSeconds,
      setBreakSeconds,
      toggle,
      reset,
    }),
    [remainingSeconds, running, currentSet, totalSets, mode, workSeconds, breakSeconds, toggle, reset],
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePomodoroContext = () => useContext(PomodoroContext);


