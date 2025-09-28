import clsx from 'clsx';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useClockSettings } from '~/context/ClockSettingsContext';

export const ClockView = () => {
  const { timeFormat, showDate, surfaceBackgroundEnabled } = useClockSettings();
  const { timeText, dateText } = useCurrentTime(timeFormat);

  return (
    <div
      className={clsx(
        'surface-secondary mx-3 flex w-full select-none flex-col items-center rounded-2xl px-3 py-3 shadow-lg backdrop-blur-sm sm:mx-8 sm:max-w-[440px] sm:px-4 sm:py-4',
        !surfaceBackgroundEnabled && 'surface-background-off',
      )}
    >
      {showDate && (
        <p className="text-theme-primary text-center text-[0.95rem] tracking-[.16em] sm:text-base">{dateText}</p>
      )}
      <p className="text-theme-primary text-center text-[42px] font-semibold tracking-[.08em] sm:text-[64px]">
        {timeText}
      </p>
    </div>
  );
};
