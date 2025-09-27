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
    <div className="mx-8 w-[280px] border-white px-4 py-2 sm:w-[380px] md:w-[400px]">
      <div className="mb-3 text-center text-white opacity-80">
        <span className="text-sm">セット {currentSet}/{totalSets}</span>
      </div>
      <p className="text-center text-[32px] tracking-[.1em] text-white sm:text-[48px] md:text-[64px]">
        {formatTime(remainingSeconds)}
      </p>
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-3">
          <select
            className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
            value={totalSets}
            onChange={(e) => setTotalSets(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}セット
              </option>
            ))}
          </select>
          <button
            onClick={toggle}
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            {label}
          </button>
          <button
            onClick={reset}
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};


