import { useMemo } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TimerControlBar, TimerActionConfig, TimerSelectConfig } from './TimerControlBar';
import { TIMER_TEXT } from '~/constants/labels';
import { useTimerContext } from '~/context/TimerContext';
import { useClockSettings } from '~/context/ClockSettingsContext';
import { formatTimer } from '~/utils/timerFormat';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const MAX_TOTAL = 23 * 3600 + 59 * 60 + 59;

export const CircularTimer = () => {
  const {
    totalSeconds,
    remainingSeconds,
    running,
    setTotalSeconds,
    setRemainingSeconds,
    reset,
    setRunning,
  } = useTimerContext();
  const { showTimerControls } = useClockSettings();

  const progress = useMemo(
    () => (totalSeconds ? 1 - remainingSeconds / totalSeconds : 0),
    [totalSeconds, remainingSeconds],
  );
  const percent = Math.round(clamp(progress, 0, 1) * 100);

  const timeParts = useMemo(() => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }, [totalSeconds]);

  const selectConfigs: TimerSelectConfig[] = [
    {
      id: 'timer-hours',
      label: TIMER_TEXT.hours,
      value: timeParts.hours,
      onChange: (value) => {
        const hours = clamp(Number(value || 0), 0, 23);
        const newTotal = Math.min(MAX_TOTAL, hours * 3600 + timeParts.minutes * 60 + timeParts.seconds);
        setTotalSeconds(newTotal);
        setRemainingSeconds(newTotal);
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
        setTotalSeconds(newTotal);
        setRemainingSeconds(newTotal);
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
        setTotalSeconds(newTotal);
        setRemainingSeconds(newTotal);
      },
      options: Array.from({ length: 61 }, (_, i) => ({ value: i, label: i })),
    },
  ];

  const actionConfigs: TimerActionConfig[] = [
    {
      id: 'toggle',
      icon: running ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />,
      ariaLabel: running ? TIMER_TEXT.pause : TIMER_TEXT.start,
      onClick: () => {
        setRunning(!running);
      },
    },
    {
      id: 'reset',
      icon: <RestartAltIcon fontSize="small" />,
      ariaLabel: TIMER_TEXT.reset,
      onClick: () => {
        reset();
        setRunning(false);
      },
    },
  ];

  return (
    <div className="surface-secondary mx-4 w-full max-w-[420px] select-none rounded-3xl px-5 py-6 shadow-lg backdrop-blur-sm sm:mx-8">
      <div className="mb-6 flex justify-center">
        <div className="relative h-[220px] w-[220px] sm:h-[360px] sm:w-[360px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(rgba(255, 255, 255, 0.95) 0% ${percent}%, rgba(255,255,255,0.25) ${percent}% 100%)`,
            }}
          />
          <div className="surface-contrast absolute inset-[8px] sm:inset-[22px] rounded-full shadow">
            <div className="flex h-full w-full items-center justify-center rounded-full text-center text-[36px] font-semibold text-force-light sm:text-[52px]">
              {formatTimer(remainingSeconds)}
            </div>
          </div>
        </div>
      </div>

      {showTimerControls && (
        <div className="mt-4 flex justify-center">
          <TimerControlBar selects={selectConfigs} actions={actionConfigs} />
        </div>
      )}
    </div>
  );
};


