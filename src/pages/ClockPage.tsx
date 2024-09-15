import { useState } from "react";
import { ClockBgImage } from "~/components/ClockBgImage";
import { ClockView } from "~/components/ClockView";
import { SettingDrawer } from "~/components/SettingDrawer";
import { DEFAULT_FETCH_INTERVAL } from "~/constants/intervalTime";

const ClockPage = () => {
  const [intervalTime, setIntervalTime] = useState<number>(
    Number(localStorage.getItem("intervalTime")) || DEFAULT_FETCH_INTERVAL,
  );

  const memoizedSetIntervalTime = (interval: number) =>
    setIntervalTime(interval);

  return (
    <ClockBgImage intervalTime={intervalTime}>
      <div
        id="setting-button"
        className="absolute bottom-2 right-0 transition duration-300 hover:scale-150 hover:opacity-50"
      >
        <SettingDrawer intervalTime={intervalTime} setIntervalTime={memoizedSetIntervalTime} />
      </div>
      <ClockView />
    </ClockBgImage>
  );
};

export default ClockPage;
