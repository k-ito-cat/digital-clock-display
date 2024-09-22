import { useEffect, useState } from "react";
import { TIMER_UPDATE_INTERVAL } from "~/constants/intervalTime";
import { clockViewFormat } from "~/utils/clockViewFormat";

export const useCurrentTime = () => {
  const [clock, setClock] = useState<string>("00:00:00");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock(clockViewFormat());
    }, TIMER_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return clock;
};
