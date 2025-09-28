import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [interactionActive, setInteractionActive] = useState(false);
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    active: false,
    pointerId: null as number | null,
    pointerType: 'none' as string,
  });

  const changeTabByDirection = useCallback((direction: 'next' | 'prev') => {
    setTab((current) => {
      const index = tabOrder.indexOf(current);
      if (direction === 'next' && index < tabOrder.length - 1) {
        return tabOrder[index + 1];
      }
      if (direction === 'prev' && index > 0) {
        return tabOrder[index - 1];
      }
      return current;
    });
  }, [setTab]);

  const handleSwipeDelta = useCallback((deltaX: number, deltaY: number) => {
    const horizontalDominant = Math.abs(deltaX) > Math.abs(deltaY);
    const threshold = 60;
    if (!horizontalDominant || Math.abs(deltaX) < threshold) return;
    if (deltaX < 0) {
      changeTabByDirection('next');
    } else {
      changeTabByDirection('prev');
    }
  }, [changeTabByDirection]);

  const resetGesture = useCallback(() => {
    gestureState.current = {
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      active: false,
      pointerId: null,
      pointerType: 'none',
    };
    setInteractionActive(false);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    gestureState.current = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      active: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };
    setInteractionActive(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // noop
    }
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!gestureState.current.active) return;
    if (gestureState.current.pointerId !== null && event.pointerId !== gestureState.current.pointerId) return;
    gestureState.current.lastX = event.clientX;
    gestureState.current.lastY = event.clientY;
  }, []);

  const finalizeGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!gestureState.current.active) return;
    if (gestureState.current.pointerId !== null && event.pointerId !== gestureState.current.pointerId) return;
    const deltaX = event.clientX - gestureState.current.startX;
    const deltaY = event.clientY - gestureState.current.startY;
    handleSwipeDelta(deltaX, deltaY);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // noop
    }
    resetGesture();
  }, [handleSwipeDelta, resetGesture]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    finalizeGesture(event);
  }, [finalizeGesture]);

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    finalizeGesture(event);
  }, [finalizeGesture]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowRight') {
        changeTabByDirection('next');
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        changeTabByDirection('prev');
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [changeTabByDirection]);

  return (
    <ClockBgImage setLimit={setLimit}>
      <PomodoroProvider>
          <ViewProvider value={{ view: tab }}>
            <TopTabs value={tab} onChange={setTab} />
            <div className="relative flex w-full justify-center">
            <div
              className={clsx('relative w-full overflow-hidden', interactionActive ? 'cursor-grabbing' : 'cursor-grab')}
              style={{ touchAction: 'pan-y' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
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
            <div className="auto-hide-ui absolute bottom-4 right-4 flex items-center gap-2.5 text-theme-primary sm:bottom-6 sm:right-6 sm:gap-3">
              <PictureInPicture className="btn-theme" />
              <FullScreen className="btn-theme" />
              <SettingDrawer
                limit={limit}
                renderTrigger={({ open, id }) => (
                  <button
                    id={id}
                    type="button"
                    onClick={open}
                    aria-label="設定"
                    className="btn-theme flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-[1px] sm:h-11 sm:w-11"
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
