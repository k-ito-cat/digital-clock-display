import { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const formatHMS = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return h === '00' ? `${m}:${sec}` : `${h}:${m}:${sec}`;
};

export const CircularTimer = () => {
  const DEFAULT_SECONDS = 25 * 60;
  const [total, setTotal] = useState<number>(DEFAULT_SECONDS);
  const [remaining, setRemaining] = useState<number>(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false);
  }, [remaining, running]);

  const progress = useMemo(() => (total ? 1 - remaining / total : 0), [total, remaining]);
  const percent = Math.round(clamp(progress, 0, 1) * 100);

  const onToggle = () => setRunning((v) => !v);
  const onReset = () => {
    setRunning(false);
    setRemaining(total);
  };

  return (
    <div className="mx-8 w-[400px] px-4 py-2">
      <div className="mb-6 flex justify-center">
        <div className="relative h-[300px] w-[300px] sm:h-[384px] sm:w-[384px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(rgba(255, 255, 255, 0.95) 0% ${percent}%, rgba(255,255,255,0.25) ${percent}% 100%)`,
            }}
          />
          <div className="absolute inset-[14px] sm:inset-[18px] rounded-full bg-white/70 shadow-md" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none text-[48px] font-semibold tracking-[.1em] text-gray-700 sm:text-[64px]">
              {formatHMS(remaining)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="rounded-full bg-white/90 px-2 py-1 shadow-md sm:px-3 sm:py-2">
          <div className="flex items-center">
            <select
              className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
              value={Math.floor(total / 3600)}
              onChange={(e) => {
                const hours = clamp(Number(e.target.value || 0), 0, 23);
                const minutes = Math.floor((total % 3600) / 60);
                const newTotal = hours * 3600 + minutes * 60;
                setTotal(newTotal);
                setRemaining(newTotal);
              }}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {h} 時間
                </option>
              ))}
            </select>
            <span className="mx-1 h-5 w-px bg-gray-300/80 sm:mx-2" />
            <select
              className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
              value={Math.floor((total % 3600) / 60)}
              onChange={(e) => {
                const mins = clamp(Number(e.target.value || 0), 0, 59);
                const hours = Math.floor(total / 3600);
                const newTotal = hours * 3600 + mins * 60;
                setTotal(newTotal);
                setRemaining(newTotal);
              }}
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {m} 分
                </option>
              ))}
            </select>
            <span className="mx-1 h-5 w-px bg-gray-300/80 sm:mx-2" />
            <button onClick={onToggle} className="px-2 whitespace-nowrap py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm">
              {running ? '一時停止' : '開始'}
            </button>
            <span className="mx-1 h-5 w-px bg-gray-300/80 sm:mx-2" />
            <button onClick={onReset} className="px-2 whitespace-nowrap py-1 text-xs font-semibold text-gray-700 sm:px-3 sm:py-1.5 sm:text-sm">
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


