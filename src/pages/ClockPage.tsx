import { useState } from "react";
import { ClockBgImage } from "~/components/ClockBgImage";
import { ClockView } from "~/components/ClockView";
import { SettingDrawer } from "~/components/SettingDrawer";
import { DEFAULT_FETCH_INTERVAL } from "~/constants/intervalTime";
import { STORAGE_KEY_REQUEST_LIMIT } from "~/constants/keyName";

interface Limit {
  requestLimit: number;
  requestRemaining: number;
}

const ClockPage = () => {
  const [intervalTime, setIntervalTime] = useState<number>(
    Number(localStorage.getItem("intervalTime")) || DEFAULT_FETCH_INTERVAL,
  );
  const limitInfo = JSON.parse(
    localStorage.getItem(STORAGE_KEY_REQUEST_LIMIT) || "",
  );
  const [limit, setLimit] = useState<Limit>({
    requestLimit: limitInfo.limit || 50,
    requestRemaining: limitInfo.remaining || 0,
  });

  const memoizedSetIntervalTime = (interval: number) =>
    setIntervalTime(interval);

  return (
    <ClockBgImage setLimit={setLimit} intervalTime={intervalTime}>
      <div
        id="setting-button"
        className="absolute bottom-2 right-0 transition duration-300 hover:scale-150 hover:opacity-50"
      >
        <SettingDrawer
          limit={limit}
          intervalTime={intervalTime}
          setIntervalTime={memoizedSetIntervalTime}
        />
      </div>
      <ClockView />
    </ClockBgImage>
  );
};

export default ClockPage;
