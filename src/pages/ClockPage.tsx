import { useEffect, useState } from 'react';
import { ClockBgImage } from '~/components/ClockBgImage';
import { ClockView } from '~/components/ClockView';
import { FullScreen } from '~/components/FullScreen';
import { PictureInPicture } from '~/components/PictureInPicture';
import { TopTabs } from '~/components/TopTabs';
import { PomodoroTimer } from '~/components/PomodoroTimer';
import { CircularTimer } from '~/components/CircularTimer';
import { ViewProvider } from '~/context/ViewContext';
import { PomodoroProvider } from '~/context/PomodoroContext';
import { SettingDrawer } from '~/components/SettingDrawer';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';

import { STORAGE_KEY_REQUEST_LIMIT } from '~/constants/keyName';

interface Limit {
  requestLimit: number;
  requestRemaining: number;
}

const tabOrder: Array<'clock' | 'pomodoro' | 'timer'> = ['clock', 'pomodoro', 'timer'];

const ClockPage = () => {
  const storageLimit = localStorage.getItem(STORAGE_KEY_REQUEST_LIMIT);

  const [limit, setLimit] = useState<Limit>({
    requestLimit: storageLimit ? Number(JSON.parse(storageLimit).limit) : 50,
    requestRemaining: storageLimit ? Number(JSON.parse(storageLimit).remaining) : 0,
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function') {
        Notification.requestPermission().then((result) => {
          console.log(result);
        }).catch(() => {
          // noop
        });
      }
    } catch (_) {
      // iOS Chrome など未対応環境での ReferenceError 防止
    }
  }, []);


  const [tab, setTab] = useState<'clock' | 'pomodoro' | 'timer'>('clock');

  return (
    <ClockBgImage setLimit={setLimit}>
      <PomodoroProvider>
          <ViewProvider value={{ view: tab }}>
            <TopTabs value={tab} onChange={setTab} />
            <div className="relative flex w-full justify-center">
              <div className="relative w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${tabOrder.indexOf(tab) * 100}%)` }}
                >
                  <div className="w-full grid place-items-center shrink-0 px-4">
                    <ClockView />
                  </div>
                  <div className="w-full grid place-items-center shrink-0 px-4">
                    <PomodoroTimer />
                  </div>
                  <div className="w-full grid place-items-center shrink-0 px-4">
                    <CircularTimer />
                  </div>
                </div>
              </div>
            </div>
            <div className="auto-hide-ui absolute bottom-6 right-6 flex items-center gap-3">
              <PictureInPicture />
              <FullScreen />
              <SettingDrawer
                limit={limit}
                renderTrigger={({ open, id }) => (
                  <button
                    id={id}
                    type="button"
                    onClick={open}
                    aria-label="設定"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
                  >
                    <BrightnessHighIcon fontSize="small" />
                  </button>
                )}
              />
            </div>
            <p className="auto-hide-ui absolute bottom-2 left-4 text-xs text-white opacity-50 md:text-base">
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
