import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createIdle, pause, progressAt, remainingAt, reset, start, type CountdownState } from '~/lib/countdown';
import { readJson, writeJson } from '~/lib/storage';
import { useSettings } from './settings-context';
import {
  advancePhase,
  DEFAULT_TIMER_SECONDS,
  TIMERS_CHANNEL,
  TIMERS_STORAGE_KEY,
  TimersContext,
  type PhaseSettings,
  type TimersContextValue,
  type TimersState,
} from './timers-context';

export const TimersProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();

  const [state, setState] = useState<TimersState>(() =>
    readJson<TimersState>(TIMERS_STORAGE_KEY, {
      timer: createIdle(DEFAULT_TIMER_SECONDS),
      pomodoro: createIdle(settings.work),
      phase: 'idle',
      set: 0,
    }),
  );
  const [now, setNow] = useState(() => Date.now());

  // 同一ストレージ区画内の複数面で状態を一致させる。区画が分かれる環境では届かない
  const channel = useRef<BroadcastChannel | null>(null);
  const applyingRemote = useRef(false);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(TIMERS_CHANNEL);
    channel.current = bc;
    bc.onmessage = (event: MessageEvent<TimersState>) => {
      applyingRemote.current = true;
      setState(event.data);
    };
    return () => {
      bc.close();
      channel.current = null;
    };
  }, []);

  useEffect(() => {
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    writeJson(TIMERS_STORAGE_KEY, state);
    channel.current?.postMessage(state);
  }, [state]);

  const phaseSettings = useMemo<PhaseSettings>(
    () => ({
      work: settings.work,
      shortBreak: settings.shortBreak,
      longBreakEnabled: settings.longBreakEnabled,
      longBreak: settings.longBreak,
      totalSets: settings.totalSets,
      longBreakEvery: settings.longBreakEvery,
    }),
    [
      settings.work,
      settings.shortBreak,
      settings.longBreakEnabled,
      settings.longBreak,
      settings.totalSets,
      settings.longBreakEvery,
    ],
  );

  /**
   * 表示の更新を刻み、同じ場所でフェーズの期限切れも処理する。
   * 残り時間は deadline から都度求めるため、この間隔が乱れても計測は狂わない。
   */
  useEffect(() => {
    const tick = () => {
      const at = Date.now();
      setNow(at);
      setState((current) => advancePhase(current, at, phaseSettings));
    };
    const id = window.setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [phaseSettings]);

  const remaining = useCallback((target: CountdownState) => remainingAt(target, now), [now]);
  const progress = useCallback((target: CountdownState) => progressAt(target, now), [now]);

  const startTimer = useCallback(() => setState((s) => ({ ...s, timer: start(s.timer, Date.now()) })), []);
  const pauseTimer = useCallback(() => setState((s) => ({ ...s, timer: pause(s.timer, Date.now()) })), []);
  const resetTimer = useCallback(
    (totalSeconds?: number) => setState((s) => ({ ...s, timer: reset(s.timer, totalSeconds) })),
    [],
  );

  const togglePomodoro = useCallback(() => {
    setState((s) => {
      if (s.phase === 'idle' || s.phase === 'done') {
        return {
          ...s,
          phase: 'work',
          set: 1,
          pomodoro: start(createIdle(settings.work), Date.now()),
        };
      }
      return {
        ...s,
        pomodoro: s.pomodoro.status === 'running' ? pause(s.pomodoro, Date.now()) : start(s.pomodoro, Date.now()),
      };
    });
  }, [settings.work]);

  const resetPomodoro = useCallback(() => {
    setState((s) => ({ ...s, phase: 'idle', set: 0, pomodoro: createIdle(settings.work) }));
  }, [settings.work]);

  const value = useMemo<TimersContextValue>(
    () => ({
      now,
      timer: state.timer,
      // 停止中の長さは設定から導出する。状態として二重に持たない
      pomodoro: state.phase === 'idle' || state.phase === 'done' ? createIdle(settings.work) : state.pomodoro,
      phase: state.phase,
      set: state.set,
      remaining,
      progress,
      startTimer,
      pauseTimer,
      resetTimer,
      togglePomodoro,
      resetPomodoro,
    }),
    [now, state, settings.work, remaining, progress, startTimer, pauseTimer, resetTimer, togglePomodoro, resetPomodoro],
  );

  return <TimersContext.Provider value={value}>{children}</TimersContext.Provider>;
};
