import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { usePomodoroContext } from '~/context/PomodoroContext';

const formatSetLabel = (setNumber: number) => `${setNumber}セット目`;

export const PomodoroList = () => {
  const { currentSet, totalSets, mode } = usePomodoroContext();

  const isIdleWaiting = mode === 'idle' && currentSet === 0;

  const displayItems = useMemo(() => {
    if (isIdleWaiting) {
      return ['準備中'];
    }

    if (mode === 'idle') {
      return [
        totalSets > 0 ? formatSetLabel(Math.max(currentSet - 1, 0)) : '準備中',
        formatSetLabel(Math.max(currentSet, 0)),
        totalSets > 0 ? formatSetLabel(Math.min(currentSet + 1, totalSets)) : 'セット未設定',
      ];
    }

    if (mode === 'work') {
      const prev = currentSet > 1 ? formatSetLabel(currentSet - 1) : '準備中';
      const now = formatSetLabel(Math.max(currentSet, 1));
      const next = currentSet >= totalSets ? '完了' : '休憩';
      return [prev, now, next];
    }

    // break (short/long)
    const prev = currentSet > 0 ? formatSetLabel(currentSet) : '準備中';
    const now = mode === 'longBreak' ? '長休憩' : '休憩';
    const next = currentSet >= totalSets ? '完了' : formatSetLabel(currentSet + 1);
    return [prev, now, next];
  }, [currentSet, totalSets, mode, isIdleWaiting]);

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((key) => key + 1);
  }, [currentSet, mode, isIdleWaiting]);

  return (
    <div className="mt-3 flex justify-center sm:mt-4">
      <div
        key={animKey}
        className={clsx(
          'surface-contrast flex h-auto w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-xl px-3 py-3 shadow-md sm:max-w-[228px] sm:py-4',
          'backdrop-blur',
        )}
      >
        {displayItems.length === 1 ? (
          <div className="text-base font-semibold text-force-light transition-all duration-300 ease-in-out">{displayItems[0]}</div>
        ) : (
          <>
            <div className="text-theme-muted text-force-light text-sm font-semibold transition-all duration-300 ease-in-out">{displayItems[0]}</div>
            <div className="text-force-light text-lg font-semibold transition-transform duration-300 ease-in-out" style={{ transform: 'scale(1.05)' }}>
              {displayItems[1]}
            </div>
            <div className="text-theme-muted text-force-light text-sm font-semibold transition-all duration-300 ease-in-out">{displayItems[2]}</div>
          </>
        )}
      </div>
    </div>
  );
};


