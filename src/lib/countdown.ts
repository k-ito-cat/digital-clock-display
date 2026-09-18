/**
 * 経過時間の計測を、間隔タイマーの発火回数の積算に依存させない。
 * 残り時間は常に deadline と現在時刻の差から求める。
 * requirements.md の時刻精度に対応する。
 */
export type CountdownState =
  | { status: 'idle'; totalSeconds: number; remainingSeconds: number }
  | { status: 'running'; totalSeconds: number; deadline: number }
  | { status: 'paused'; totalSeconds: number; remainingSeconds: number };

export const createIdle = (totalSeconds: number): CountdownState => ({
  status: 'idle',
  totalSeconds,
  remainingSeconds: totalSeconds,
});

export const remainingAt = (state: CountdownState, now: number) => {
  if (state.status !== 'running') return state.remainingSeconds;
  return Math.max(0, Math.ceil((state.deadline - now) / 1000));
};

export const start = (state: CountdownState, now: number): CountdownState => {
  const remaining = remainingAt(state, now);
  if (remaining <= 0) return state;
  return { status: 'running', totalSeconds: state.totalSeconds, deadline: now + remaining * 1000 };
};

export const pause = (state: CountdownState, now: number): CountdownState => {
  if (state.status !== 'running') return state;
  return {
    status: 'paused',
    totalSeconds: state.totalSeconds,
    remainingSeconds: remainingAt(state, now),
  };
};

export const reset = (state: CountdownState, totalSeconds = state.totalSeconds): CountdownState =>
  createIdle(totalSeconds);

export const isFinished = (state: CountdownState, now: number) =>
  state.status === 'running' && remainingAt(state, now) === 0;

export const progressAt = (state: CountdownState, now: number) => {
  if (state.totalSeconds <= 0) return 0;
  return 1 - remainingAt(state, now) / state.totalSeconds;
};
