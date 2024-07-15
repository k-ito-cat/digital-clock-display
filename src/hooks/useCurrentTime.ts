import { useEffect, useState } from "react";
import { UPDATE_INTERVAL } from "~/constants/intervalTime";

export const useCurrentTime = () => {
  const [clock, setClock] = useState<string>("00:00:00");

  const getClock = () => {
    const current = new Date();
    let hours: number | string = current.getHours();
    let minutes: number | string = current.getMinutes();
    let seconds: number | string = current.getSeconds();

    hours = Number(hours) < 10 ? `0${hours}` : hours;
    minutes = Number(minutes) < 10 ? `0${minutes}` : minutes;
    seconds = Number(seconds) < 10 ? `0${seconds}` : seconds;

    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock(getClock());
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return clock;
};
