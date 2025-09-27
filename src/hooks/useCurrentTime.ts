import { useEffect, useState } from "react";
import { TIMER_UPDATE_INTERVAL } from "~/constants/intervalTime";
import { formatTimeByPattern } from "~/utils/clockViewFormat";
import { format } from "date-fns";

export type TimeFormat = "HH:mm:ss" | "HH:mm";

export const useCurrentTime = (formatPattern: TimeFormat = "HH:mm:ss") => {
  const [timeText, setTimeText] = useState<string>("00:00:00");
  const [dateText, setDateText] = useState<string>("1970/01/01");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeText(formatTimeByPattern(now, formatPattern));
      setDateText(format(now, "yyyy/MM/dd"));
    };

    update();
    const intervalId = setInterval(update, TIMER_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [formatPattern]);

  return { timeText, dateText };
};
