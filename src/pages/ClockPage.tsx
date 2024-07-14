import { useState } from "react";

const ClockPage = () => {
  const [clock, setClock] = useState("00:00:00");

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

  const MyClock = () => {
    setInterval(() => setClock(getClock()), 1000);
    return clock;
  };

  return (
    <p className="border-4 px-4 py-2 text-4xl w-[220px] text-center">
      <MyClock />
    </p>
  );
};

export default ClockPage;
