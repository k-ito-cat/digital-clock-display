import { Readout, ReadoutGroup, SubText } from '~/components/Readout';
import { formatClock, formatDate } from '~/lib/time';
import { useSettings } from '~/store/settings-context';
import { useCurrentTime } from './useCurrentTime';

export const ClockScreen = () => {
  const { settings } = useSettings();
  const now = useCurrentTime(settings.showSeconds);

  return (
    <ReadoutGroup>
      {settings.showDate ? (
        <SubText>
          <span className="tabular tracking-[0.16em]">{formatDate(now, settings.showWeekday)}</span>
        </SubText>
      ) : null}
      <Readout>{formatClock(now, { showSeconds: settings.showSeconds, hour12: settings.hour12 })}</Readout>
    </ReadoutGroup>
  );
};
