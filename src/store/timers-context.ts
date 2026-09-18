import { createContext, useContext } from 'react';
import { createIdle, remainingAt, start, type CountdownState } from '~/lib/countdown';
import type { Settings } from './settings-context';

export type PomodoroPhase = 'idle' | 'work' | 'shortBreak' | 'longBreak' | 'done';

export type TimersState = {
  timer: CountdownState;
  pomodoro: CountdownState;
  phase: PomodoroPhase;
  set: number;
};

export type PhaseSettings = Pick<
  Settings,
  'work' | 'shortBreak' | 'longBreakEnabled' | 'longBreak' | 'totalSets' | 'longBreakEvery'
>;

export const TIMERS_STORAGE_KEY = 'timers';
export const TIMERS_CHANNEL = 'digital-clock-display/timers';
export const DEFAULT_TIMER_SECONDS = 5 * 60;

export const PHASE_LABEL: Record<PomodoroPhase, string> = {
  idle: '準備中',
  work: '作業',
  shortBreak: '休憩',
  longBreak: '長休憩',
  done: '完了',
};

/**
 * 期限に達したフェーズを次へ進める。時刻を引数で受け取る純関数として扱う。
 * 指定したセット数ごとに長休憩へ入り、最終セットの完了で止まる。
 */
export const advancePhase = (current: TimersState, at: number, settings: PhaseSettings): TimersState => {
  if (current.pomodoro.status !== 'running') return current;
  if (remainingAt(current.pomodoro, at) > 0) return current;

  if (current.phase === 'work') {
    if (current.set >= settings.totalSets) {
      return { ...current, phase: 'done', pomodoro: createIdle(settings.work) };
    }
    const isLong = settings.longBreakEnabled && current.set % settings.longBreakEvery === 0;
    const seconds = isLong ? settings.longBreak : settings.shortBreak;
    return {
      ...current,
      phase: isLong ? 'longBreak' : 'shortBreak',
      pomodoro: start(createIdle(seconds), at),
    };
  }

  if (current.phase === 'shortBreak' || current.phase === 'longBreak') {
    return {
      ...current,
      phase: 'work',
      set: current.set + 1,
      pomodoro: start(createIdle(settings.work), at),
    };
  }

  return current;
};

export type TimersContextValue = {
  now: number;
  timer: CountdownState;
  pomodoro: CountdownState;
  phase: PomodoroPhase;
  set: number;
  remaining: (state: CountdownState) => number;
  progress: (state: CountdownState) => number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (totalSeconds?: number) => void;
  togglePomodoro: () => void;
  resetPomodoro: () => void;
};

export const TimersContext = createContext<TimersContextValue | null>(null);

export const useTimers = () => {
  const context = useContext(TimersContext);
  if (!context) throw new Error('useTimers must be used within TimersProvider');
  return context;
};
