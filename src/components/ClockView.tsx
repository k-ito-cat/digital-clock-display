import { useCurrentTime } from "../hooks/useCurrentTime";
import { useClockSettings } from "~/context/ClockSettingsContext";

export const ClockView = () => {
  const { timeFormat, showDate } = useClockSettings();
  const { timeText, dateText } = useCurrentTime(timeFormat);

  return (
    <div className="mx-8  w-[400px] flex-col items-center border-white px-4 py-2">
      {showDate && (
        <p className="text-center text-lg tracking-[.2em] text-white opacity-80">
          {dateText}
        </p>
      )}
      <p className="text-center text-[64px] tracking-[.1em] text-white">
        {timeText}
      </p>
    </div>
  );
};
