import { useMemo } from 'react';
import { usePomodoroContext } from '~/context/PomodoroContext';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const PomodoroTimer = () => {
  const { remainingSeconds, running, toggle, reset, setTotalSets, currentSet, totalSets, mode } = usePomodoroContext();

  const label = useMemo(() => {
    if (mode === 'idle') return '開始';
    return running ? '一時停止' : '再開';
  }, [running, mode]);

  return (
    <div className="mx-8 w-[400px] border-white px-4 py-2">
      <div className="mb-4 flex justify-center">
        {(() => {
          const progress = Math.max(0, Math.min(1, totalSets ? currentSet / totalSets : 0));
          const percent = Math.round(progress * 100);
          const ring = `conic-gradient(rgba(255,255,255,0.95) 0% ${percent}%, rgba(255,255,255,0.25) ${percent}% 100%)`;
          return (
            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
              <div className="absolute inset-0 rounded-full" style={{ background: ring }} />
              <div className="absolute inset-[3px] sm:inset-1 flex items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-md sm:text-sm">
                {currentSet}/{totalSets}
              </div>
            </div>
          );
        })()}
      </div>
      <p className="text-center text-[64px] tracking-[.1em] text-white">
        {formatTime(remainingSeconds)}
      </p>
      <div className="mt-6 flex justify-center">
        <div className="rounded-full bg-white/90 px-2 py-1 shadow-md sm:px-3 sm:py-2">
          <div className="flex items-center">
            <select
              className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
              value={totalSets}
              onChange={(e) => setTotalSets(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}セット
                </option>
              ))}
            </select>
            <span className="mx-1 h-5 w-px bg-gray-300/80 sm:mx-2" />
            <button
              onClick={toggle}
              className="px-2 py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              {label}
            </button>
            <span className="mx-1 h-5 w-px bg-gray-300/80 sm:mx-2" />
            <button
              onClick={reset}
              className="px-2 py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


