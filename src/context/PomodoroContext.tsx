import { createContext, ReactNode, useContext, useMemo, useRef, useState, useEffect } from 'react';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak' | 'idle';

type PomodoroContextType = {
  remainingSeconds: number;
  running: boolean;
  currentSet: number;
  totalSets: number;
  mode: PomodoroMode;
  setTotalSets: (n: number) => void;
  toggle: () => void;
  reset: () => void;
};

const DEFAULT_WORK = 25 * 60;
const DEFAULT_SHORT = 5 * 60;
const DEFAULT_LONG = 15 * 60;
const LONG_EVERY = 4; // 4セットごとにロングブレイク

const PomodoroContext = createContext<PomodoroContextType>({
  remainingSeconds: DEFAULT_WORK,
  running: false,
  currentSet: 1,
  totalSets: 4,
  mode: 'idle',
  setTotalSets: () => {},
  toggle: () => {},
  reset: () => {},
});

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const [running, setRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(4);
  const [mode, setMode] = useState<PomodoroMode>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_WORK);
  const timerRef = useRef<number | null>(null);

  const startWork = () => {
    setMode('work');
    setRemainingSeconds(DEFAULT_WORK);
    setRunning(true);
  };

  const nextPhase = () => {
    if (mode === 'work') {
      const isLastSet = currentSet >= totalSets;
      if (isLastSet) {
        setMode('idle');
        setRunning(false);
        return;
      }
      const isLongBreak = currentSet % LONG_EVERY === 0;
      setMode(isLongBreak ? 'longBreak' : 'shortBreak');
      setRemainingSeconds(isLongBreak ? DEFAULT_LONG : DEFAULT_SHORT);
      setRunning(true);
    } else {
      // break -> next work
      setCurrentSet((v) => v + 1);
      setMode('work');
      setRemainingSeconds(DEFAULT_WORK);
      setRunning(true);
    }
  };

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
  }, [remainingSeconds, running]);

  const toggle = () => {
    // 初回はwork開始
    if (mode === 'idle') {
      setCurrentSet(1);
      startWork();
      return;
    }
    setRunning((v) => !v);
  };

  const reset = () => {
    setRunning(false);
    setMode('idle');
    setCurrentSet(1);
    setRemainingSeconds(DEFAULT_WORK);
  };

  const value = useMemo(
    () => ({ remainingSeconds, running, currentSet, totalSets, mode, setTotalSets, toggle, reset }),
    [remainingSeconds, running, currentSet, totalSets, mode],
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};

export const usePomodoroContext = () => useContext(PomodoroContext);


