import { formatDuration } from '~/lib/time';
import { PHASE_LABEL, useTimers } from '~/store/timers-context';
import { Action } from './Action';
import type { ViewId } from './Shell';

type Props = { view: ViewId; onSelect: (view: ViewId) => void };

/**
 * 別の画面にいる間も、進行中の計測があることを示す。
 * 進行中の計測状態は平常時に出してよい要素なので、自動非表示の対象にしない。
 * hig: disclosure.ambient-first
 */
export const RunningIndicator = ({ view, onSelect }: Props) => {
  const { pomodoro, timer, phase, remaining } = useTimers();

  const entries = [
    pomodoro.status === 'running' && view !== 'pomodoro'
      ? {
          id: 'pomodoro' as const,
          label: PHASE_LABEL[phase],
          value: formatDuration(remaining(pomodoro)),
        }
      : null,
    timer.status === 'running' && view !== 'timer'
      ? { id: 'timer' as const, label: 'タイマー', value: formatDuration(remaining(timer)) }
      : null,
  ].filter((entry) => entry !== null);

  if (entries.length === 0) return null;

  return (
    <div
      /*
       * タブと同じ帯に置くと、狭い面で必ず重なる。帯を分けてタブの下に置く。
       * 操作UIが隠れている間も残すため、タブの有無で位置を変えない。
       */
      className="absolute top-[calc(var(--spacing-edge)+var(--size-hit)+var(--spacing-tight))] left-1/2 grid -translate-x-1/2 justify-items-center gap-[var(--spacing-tight)]"
      style={{ zIndex: 'var(--z-controls)' }}
    >
      {entries.map((entry) => (
        <Action
          key={entry.id}
          aria-label={`${entry.label} 残り ${entry.value}。この画面へ移動する`}
          tip="この画面へ移動する"
          onClick={() => onSelect(entry.id)}
          className="gap-[var(--spacing-inline)] text-[length:var(--text-label)]"
        >
          {/* 進行中であることを、点滅ではなく静かな点で示す */}
          <span aria-hidden className="h-[5px] w-[5px] rounded-[var(--radius-marker)] bg-[var(--color-fg-primary)]" />
          <span>{entry.label}</span>
          <span className="tabular text-[var(--color-fg-primary)]">{entry.value}</span>
        </Action>
      ))}
    </div>
  );
};
