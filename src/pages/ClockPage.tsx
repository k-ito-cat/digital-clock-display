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
  const storageLimit = localStorage.getItem(STORAGE_KEY_REQUEST_LIMIT);

  const [limit, setLimit] = useState<Limit>({
    requestLimit: storageLimit ? Number(JSON.parse(storageLimit).limit) : 50,
    requestRemaining: storageLimit
      ? Number(JSON.parse(storageLimit).remaining)
      : 0,
  });

  const memoizedSetIntervalTime = (interval: number) =>
    setIntervalTime(interval);

  return (
    <ClockBgImage setLimit={setLimit} intervalTime={intervalTime}>
      <SettingDrawer
        limit={limit}
        intervalTime={intervalTime}
        setIntervalTime={memoizedSetIntervalTime}
      />
      <ClockView />
    </ClockBgImage>
  );
};

export default ClockPage;
