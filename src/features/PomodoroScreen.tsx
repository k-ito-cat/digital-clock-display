import { ProgressLine, Readout, ReadoutGroup, SubText } from '~/components/Readout';
import { formatDuration } from '~/lib/time';
import { useSettings } from '~/store/settings-context';
import { PHASE_LABEL, useTimers } from '~/store/timers-context';
import { SessionBar, SessionControls } from './SessionPlan';

/**
 * 構成図は操作の有無にかかわらず残す。編集操作は停止中だけ表示する。
 */
export const PomodoroScreen = () => {
  const { settings } = useSettings();
  const { pomodoro, phase, set, remaining, progress } = useTimers();
  const stopped = phase === 'idle' || phase === 'done';

  return (
    <ReadoutGroup className="pomodoro-readout" contentClassName={stopped ? 'pomodoro-ready' : undefined}>
      <SubText>
        <span className="flex items-center gap-[var(--spacing-inline)]">
          <span>{PHASE_LABEL[phase]}</span>
          {!stopped ? (
            <span className="tabular">
              {set} / {settings.totalSets}
            </span>
          ) : null}
        </span>
      </SubText>

      <Readout maxSize="var(--pomodoro-time-limit, 100cqb)">{formatDuration(remaining(pomodoro))}</Readout>

      <ProgressLine value={progress(pomodoro)} label="現在のフェーズの進捗" />

      {stopped ? (
        <>
          <div className="session-inline" aria-label="セッションの構成">
            <SessionControls />
          </div>
          <div className="session-preview">
            <SessionBar />
          </div>
        </>
      ) : (
        <div className="session-preview session-status">
          <SessionBar />
        </div>
      )}
    </ReadoutGroup>
  );
};
