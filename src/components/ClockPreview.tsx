import { useCurrentTime } from '~/features/useCurrentTime';
import { cn } from '~/lib/cn';
import { estimateWidthEm } from '~/lib/readout';
import { formatClock, formatDate } from '~/lib/time';
import { useSettings } from '~/store/settings-context';
import { FACE_CLASS } from './face-class';

/** 面の幅のうち時刻が占める割合。主表示と同じ考え方を、この面の幅に対して使う */
const FILL_RATIO = 88;

/**
 * 時刻の見え方をその場で確かめるための下見。
 * ドロワーが主表示を覆うため、要素を切り替えた結果を画面で確認できないため置く。
 * 実際の設定をそのまま反映し、時刻も進める。
 */
export const ClockPreview = () => {
  const { settings } = useSettings();
  const now = useCurrentTime(settings.showSeconds);
  const time = formatClock(now, { showSeconds: settings.showSeconds, hour12: settings.hour12 });
  const size = `min(${(FILL_RATIO / Math.max(estimateWidthEm(time), 1)).toFixed(1)}cqi, 2.5rem)`;

  return (
    <div className="clock-preview" aria-hidden="true">
      {settings.showDate ? (
        <span className="clock-preview-date tabular">{formatDate(now, settings.showWeekday)}</span>
      ) : null}
      <span className={cn('clock-preview-time tabular', FACE_CLASS[settings.face])} style={{ fontSize: size }}>
        {time}
      </span>
    </div>
  );
};
