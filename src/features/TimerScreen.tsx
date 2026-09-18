import { ProgressLine, Readout, ReadoutGroup, SubText } from '~/components/Readout';
import { readoutFontSize, readoutReference } from '~/lib/readout';
import { formatDuration } from '~/lib/time';
import { useSettings } from '~/store/settings-context';
import { useTimers } from '~/store/timers-context';
import { DurationEditor } from './DurationEditor';
import { TimerPresetSlider } from './TimerPresetSlider';

/**
 * docs/design/screens.md: 停止中は主表示そのものが編集対象になる。
 * 実行中は長さを変更できない。操作はこの画面の中に置く。
 */
export const TimerScreen = () => {
  const { settings } = useSettings();
  const { timer, remaining, progress, resetTimer } = useTimers();
  const running = timer.status === 'running';
  // 一時停止は「止まっている段階の残り時間」を示す。設定できるのは初期状態だけ
  const editable = timer.status === 'idle';
  const left = remaining(timer);

  const total = timer.totalSeconds;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const setPart = (part: 'h' | 'm' | 's', value: number) => {
    const next =
      part === 'h'
        ? value * 3600 + minutes * 60 + seconds
        : part === 'm'
          ? hours * 3600 + value * 60 + seconds
          : hours * 3600 + minutes * 60 + value;
    resetTimer(next);
  };

  const readoutStyle = {
    fontSize: readoutFontSize(formatDuration(total), settings.scale, readoutReference(settings)),
  };

  return (
    <ReadoutGroup>
      {/* 可読性処理は主表示のまとまりにだけ効かせる。直下のプリセットは自分の面を持つ */}
      <div className="readout-core">
        <SubText>{running ? '計測中' : left === 0 ? '終了' : editable ? '停止中' : '一時停止'}</SubText>

        {!editable ? (
          <Readout>{formatDuration(left)}</Readout>
        ) : (
          <DurationEditor
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            onChange={setPart}
            className="readout tabular m-0"
            style={readoutStyle}
          />
        )}

        <ProgressLine value={progress(timer)} label="タイマーの進捗" />
      </div>

      {editable ? <TimerPresetSlider /> : null}
    </ReadoutGroup>
  );
};
