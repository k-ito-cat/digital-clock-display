import { useState } from 'react';
import { ClockBgImage } from '~/components/ClockBgImage';
import { ClockView } from '~/components/ClockView';
import { FullScreen } from '~/components/FullScreen';
import { PictureInPicture } from '~/components/PictureInPicture';
import { TopTabs } from '~/components/TopTabs';
import { PomodoroTimer } from '~/components/PomodoroTimer';
import { ViewProvider } from '~/context/ViewContext';
import { PomodoroProvider } from '~/context/PomodoroContext';
import { SettingDrawer } from '~/components/SettingDrawer';

import { STORAGE_KEY_REQUEST_LIMIT } from '~/constants/keyName';

interface Limit {
  requestLimit: number;
  requestRemaining: number;
}

const ClockPage = () => {
  const storageLimit = localStorage.getItem(STORAGE_KEY_REQUEST_LIMIT);

  const [limit, setLimit] = useState<Limit>({
    requestLimit: storageLimit ? Number(JSON.parse(storageLimit).limit) : 50,
    requestRemaining: storageLimit ? Number(JSON.parse(storageLimit).remaining) : 0,
  });

  Notification.requestPermission().then((result) => {
    console.log(result);
  });


  const [tab, setTab] = useState<'top' | 'pomodoro'>('top');

  return (
    <ClockBgImage setLimit={setLimit}>
      <PomodoroProvider>
        <ViewProvider value={{ view: tab }}>
          <TopTabs value={tab} onChange={setTab} />
          <SettingDrawer limit={limit} />
          {tab === 'top' ? <ClockView /> : <PomodoroTimer />}
          <FullScreen />
          <PictureInPicture />
          {/* MEMO: ファビコンで使用しているアイコン icon8のクレジット */}
          <p className="md:text-base absolute bottom-2 left-4 text-xs text-white opacity-50">
            favicon by:&nbsp;
            <a href="https://icons8.com" target="_blank" rel="noreferrer">
              Icons8
            </a>
          </p>
        </ViewProvider>
      </PomodoroProvider>
    </ClockBgImage>
  );
};

export default ClockPage;
