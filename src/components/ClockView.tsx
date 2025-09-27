import { useCurrentTime } from "../hooks/useCurrentTime";
import { useClockSettings } from "~/context/ClockSettingsContext";

export const ClockView = () => {
  const { timeFormat, showDate } = useClockSettings();
  const { timeText, dateText } = useCurrentTime(timeFormat);

  return (
    <div className="mx-4 flex w-full max-w-[420px] select-none flex-col items-center border-white px-4 py-2 sm:mx-8">
      {showDate && (
        <p className="text-center text-base tracking-[.18em] text-white opacity-80 sm:text-lg">
          {dateText}
        </p>
      )}
      <p className="text-center text-[48px] tracking-[.08em] text-white sm:text-[64px]">
        {timeText}
      </p>
    </div>
  );
};
