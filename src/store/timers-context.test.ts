import { describe, expect, it } from 'vitest';
import { createIdle, remainingAt, start } from '~/lib/countdown';
import { advancePhase, type PhaseSettings, type TimersState } from './timers-context';

const T0 = 1_700_000_000_000;

const settings: PhaseSettings = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreakEnabled: true,
  longBreak: 15 * 60,
  totalSets: 4,
  longBreakEvery: 2,
};

const running = (phase: TimersState['phase'], set: number, seconds: number): TimersState => ({
  timer: createIdle(60),
  pomodoro: start(createIdle(seconds), T0),
  phase,
  set,
});

describe('advancePhase', () => {
  it('期限前は何も変えない', () => {
    const state = running('work', 1, 60);
    expect(advancePhase(state, T0 + 30_000, settings)).toBe(state);
  });

  it('作業の終了で休憩へ移る', () => {
    const next = advancePhase(running('work', 1, 60), T0 + 60_000, settings);
    expect(next.phase).toBe('shortBreak');
    expect(remainingAt(next.pomodoro, T0 + 60_000)).toBe(settings.shortBreak);
    expect(next.set).toBe(1);
  });

  it('指定したセット数ごとに長休憩へ入る', () => {
    const next = advancePhase(running('work', 2, 60), T0 + 60_000, settings);
    expect(next.phase).toBe('longBreak');
    expect(remainingAt(next.pomodoro, T0 + 60_000)).toBe(settings.longBreak);
  });

  it('長休憩を使わない設定では、周期に当たっても短い休憩になる', () => {
    const next = advancePhase(running('work', 2, 60), T0 + 60_000, {
      ...settings,
      longBreakEnabled: false,
    });
    expect(next.phase).toBe('shortBreak');
    expect(remainingAt(next.pomodoro, T0 + 60_000)).toBe(settings.shortBreak);
  });

  it('休憩の終了で次の作業へ移り、セットが進む', () => {
    const next = advancePhase(running('shortBreak', 1, 60), T0 + 60_000, settings);
    expect(next.phase).toBe('work');
    expect(next.set).toBe(2);
  });

  it('最終セットの作業が終わると完了になり、自動で再開しない', () => {
    const done = advancePhase(running('work', 4, 60), T0 + 60_000, settings);
    expect(done.phase).toBe('done');
    expect(done.pomodoro.status).toBe('idle');
    expect(advancePhase(done, T0 + 999_000, settings)).toBe(done);
  });

  it('停止中は進行しない', () => {
    const idle: TimersState = {
      timer: createIdle(60),
      pomodoro: createIdle(60),
      phase: 'idle',
      set: 0,
    };
    expect(advancePhase(idle, T0 + 999_000, settings)).toBe(idle);
  });

  it('長時間の中断後でも、期限を過ぎた時点で一度だけ進む', () => {
    const next = advancePhase(running('work', 1, 60), T0 + 3_600_000, settings);
    expect(next.phase).toBe('shortBreak');
    expect(remainingAt(next.pomodoro, T0 + 3_600_000)).toBe(settings.shortBreak);
  });
});
