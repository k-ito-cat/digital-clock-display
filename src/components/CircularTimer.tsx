import { useEffect, useMemo, useRef, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TimerControlBar, TimerActionConfig, TimerSelectConfig } from './TimerControlBar';
import { TIMER_TEXT } from '~/constants/labels';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const MAX_TOTAL = 23 * 3600 + 59 * 60 + 59;

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

  const timeParts = useMemo(() => {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return { hours, minutes, seconds };
  }, [total]);

  useEffect(() => {
    if (!running) {
      setRemaining(total);
    }
  }, [total, running]);

  const selectConfigs: TimerSelectConfig[] = [
    {
      id: 'timer-hours',
      label: TIMER_TEXT.hours,
      value: timeParts.hours,
      onChange: (value) => {
        const hours = clamp(Number(value || 0), 0, 23);
        const newTotal = Math.min(MAX_TOTAL, hours * 3600 + timeParts.minutes * 60 + timeParts.seconds);
        setTotal(newTotal);
        setRemaining(newTotal);
      },
      options: Array.from({ length: 24 }, (_, i) => ({ value: i, label: i })),
    },
    {
      id: 'timer-minutes',
      label: TIMER_TEXT.minutes,
      value: timeParts.minutes,
      onChange: (value) => {
        const mins = clamp(Number(value || 0), 0, 59);
        const newTotal = Math.min(MAX_TOTAL, timeParts.hours * 3600 + mins * 60 + timeParts.seconds);
        setTotal(newTotal);
        setRemaining(newTotal);
      },
      options: Array.from({ length: 60 }, (_, i) => ({ value: i, label: i })),
    },
    {
      id: 'timer-seconds',
      label: TIMER_TEXT.seconds,
      value: timeParts.seconds,
      onChange: (value) => {
        let secs = clamp(Number(value || 0), 0, 60);
        let hours = timeParts.hours;
        let mins = timeParts.minutes;

        if (secs === 60) {
          secs = 0;
          mins += 1;
        }

        if (mins >= 60) {
          hours += Math.floor(mins / 60);
          mins = mins % 60;
        }

        hours = clamp(hours, 0, 23);
        const newTotal = Math.min(MAX_TOTAL, hours * 3600 + mins * 60 + secs);
        setTotal(newTotal);
        setRemaining(newTotal);
      },
      options: Array.from({ length: 61 }, (_, i) => ({ value: i, label: i })),
    },
  ];

  const actionConfigs: TimerActionConfig[] = [
    {
      id: 'toggle',
      icon: running ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />,
      ariaLabel: running ? TIMER_TEXT.pause : TIMER_TEXT.start,
      onClick: () => setRunning((v) => !v),
    },
    {
      id: 'reset',
      icon: <RestartAltIcon fontSize="small" />,
      ariaLabel: TIMER_TEXT.reset,
      onClick: () => {
        setRunning(false);
        setRemaining(total);
      },
    },
  ];

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
        <TimerControlBar selects={selectConfigs} actions={actionConfigs} />
      </div>
    </div>
  );
};


