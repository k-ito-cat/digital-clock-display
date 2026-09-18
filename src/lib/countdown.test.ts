import { describe, expect, it } from 'vitest';
import { createIdle, isFinished, pause, progressAt, remainingAt, reset, start } from './countdown';

const T0 = 1_700_000_000_000;

describe('countdown', () => {
  it('停止中は設定した長さをそのまま返す', () => {
    expect(remainingAt(createIdle(300), T0)).toBe(300);
  });

  it('一時停止して再開したとき、停止した時点の残り時間から再開する', () => {
    const running = start(createIdle(300), T0);
    const paused = pause(running, T0 + 100_000);
    expect(remainingAt(paused, T0 + 100_000)).toBe(200);

    // 停止中に時間が経っても減らない
    expect(remainingAt(paused, T0 + 999_000)).toBe(200);

    const resumed = start(paused, T0 + 999_000);
    expect(remainingAt(resumed, T0 + 999_000)).toBe(200);
  });

  it('経過時間を間隔タイマーの積算に依存せず、長時間の中断後も実時間と一致する', () => {
    const running = start(createIdle(3600), T0);
    // 1時間バックグラウンドに置いた相当。途中の発火が一度もなくても正しい
    expect(remainingAt(running, T0 + 3_500_000)).toBe(100);
    expect(remainingAt(running, T0 + 3_600_000)).toBe(0);
  });

  it('0を下回らない', () => {
    const running = start(createIdle(10), T0);
    expect(remainingAt(running, T0 + 999_000)).toBe(0);
  });

  it('終了を判定できるのは進行中のときだけ', () => {
    const running = start(createIdle(10), T0);
    expect(isFinished(running, T0 + 9_000)).toBe(false);
    expect(isFinished(running, T0 + 10_000)).toBe(true);
    expect(isFinished(createIdle(0), T0)).toBe(false);
  });

  it('長さ0では開始しない', () => {
    const state = createIdle(0);
    expect(start(state, T0).status).toBe('idle');
  });

  it('リセットは長さを変えられる', () => {
    const running = start(createIdle(300), T0);
    const after = reset(running, 600);
    expect(after.status).toBe('idle');
    expect(remainingAt(after, T0 + 10_000)).toBe(600);
  });

  it('進捗は0から1の範囲で経過に比例する', () => {
    const running = start(createIdle(100), T0);
    expect(progressAt(running, T0)).toBe(0);
    expect(progressAt(running, T0 + 50_000)).toBeCloseTo(0.5);
    expect(progressAt(running, T0 + 100_000)).toBe(1);
  });
});
