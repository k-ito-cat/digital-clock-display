import { Pause, Play, RotateCcw, SlidersHorizontal, TimerReset } from 'lucide-react';
import { DEFAULT_TIMER_SECONDS, useTimers } from '~/store/timers-context';
import { Action } from './Action';
import type { ViewId } from './Shell';

/**
 * その画面でしか意味を持たない操作。
 * 主表示の直下ではなく下部の中央に置く。主表示は配置の指定で動くため位置が定まらず、
 * 狭い面では指の届かない高さに来てしまうため。
 * 狭い面ではグローバルな操作（右下）より一段上に置く。hig: button.place-by-scope
 */
export const ScreenControls = ({ view, onOpenSession }: { view: ViewId; onOpenSession: () => void }) => {
  const { pomodoro, timer, phase, togglePomodoro, resetPomodoro, startTimer, pauseTimer, resetTimer } = useTimers();

  if (view === 'clock') return null;

  const running = view === 'pomodoro' ? pomodoro.status === 'running' : timer.status === 'running';

  return (
    <div className="screen-controls control-capsule pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-[var(--spacing-action)]">
      <Action
        aria-label={running ? '一時停止' : '開始'}
        tip={
          running
            ? '一時停止'
            : view === 'pomodoro' && phase === 'idle'
              ? 'ポモドーロを開始'
              : view === 'pomodoro'
                ? '再開'
                : '計測を開始'
        }
        onClick={() => {
          if (view === 'pomodoro') {
            togglePomodoro();
            return;
          }
          if (running) pauseTimer();
          else startTimer();
        }}
      >
        {running ? <Pause size={16} /> : <Play size={16} />}
      </Action>

      {view === 'pomodoro' && (phase === 'idle' || phase === 'done') ? (
        <Action
          className="session-trigger"
          aria-label="セッションの構成を変える"
          aria-haspopup="dialog"
          tip="作業と休憩の長さ、セット数を変える"
          onClick={onOpenSession}
        >
          <SlidersHorizontal size={16} />
        </Action>
      ) : null}

      {view === 'timer' ? (
        <Action
          aria-label="タイマーを既定の長さへ戻す"
          tip={`既定の長さ（${DEFAULT_TIMER_SECONDS / 60}分）へ戻す`}
          disabled={timer.totalSeconds === DEFAULT_TIMER_SECONDS && timer.status === 'idle'}
          onClick={() => resetTimer(DEFAULT_TIMER_SECONDS)}
        >
          <TimerReset size={16} />
        </Action>
      ) : null}

      <Action
        aria-label={view === 'pomodoro' ? 'ポモドーロをリセット' : 'タイマーをリセット'}
        tip={view === 'pomodoro' ? '最初の状態へ戻す。進行中の計測は失われる' : '設定した長さへ戻す'}
        onClick={() => (view === 'pomodoro' ? resetPomodoro() : resetTimer())}
      >
        <RotateCcw size={16} />
      </Action>
    </div>
  );
};
