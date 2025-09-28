import clsx from 'clsx';
import { useMemo } from 'react';
import { usePomodoroContext } from '~/context/PomodoroContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TimerControlBar, TimerSelectConfig, TimerActionConfig } from './TimerControlBar';
import { PomodoroList } from './PomodoroList';
import { POMODORO_TEXT } from '~/constants/labels';
import { useClockSettings } from '~/context/ClockSettingsContext';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const PomodoroTimer = () => {
  const {
    remainingSeconds,
    running,
    toggle,
    reset,
    setTotalSets,
    currentSet,
    totalSets,
    mode,
    workSeconds,
    breakSeconds,
    setWorkSeconds,
    setBreakSeconds,
  } = usePomodoroContext();
  const { showPomodoroControls, surfaceBackgroundEnabled } = useClockSettings();

  const label = useMemo(() => {
    if (mode === 'idle') return POMODORO_TEXT.start;
    return running ? POMODORO_TEXT.pause : POMODORO_TEXT.resume;
  }, [running, mode]);

  const selects: TimerSelectConfig[] = [
    {
      id: 'work-minutes',
      label: POMODORO_TEXT.workMinutes,
      value: Math.floor(workSeconds / 60),
      onChange: (value) => setWorkSeconds(Number(value) * 60),
      options: [...Array(121)].map((_, i) => ({ value: i, label: i })),
    },
    {
      id: 'break-minutes',
      label: POMODORO_TEXT.breakMinutes,
      value: Math.floor(breakSeconds / 60),
      onChange: (value) => setBreakSeconds(Number(value) * 60),
      options: [...Array(61)].map((_, i) => ({ value: i, label: i })),
    },
    {
      id: 'total-sets',
      label: POMODORO_TEXT.totalSets,
      value: totalSets,
      onChange: (value) => setTotalSets(Number(value)),
      options: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: n, label: n })),
    },
  ];

  const actions: TimerActionConfig[] = [
    {
      id: 'toggle',
      icon: running ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />,
      ariaLabel: label,
      onClick: toggle,
    },
    {
      id: 'reset',
      icon: <RestartAltIcon fontSize="small" />,
      ariaLabel: POMODORO_TEXT.reset,
      onClick: reset,
    },
  ];

  return (
    <div
      className={clsx(
        'surface-secondary mx-3 w-full select-none max-w-[420px] rounded-3xl px-4 py-5 shadow-lg backdrop-blur-sm sm:mx-8 sm:px-5 sm:py-6',
        !surfaceBackgroundEnabled && 'surface-background-off'
      )}
    >
      <div className="mb-3 flex justify-center sm:mb-4">
        {(() => {
          const progress = Math.max(0, Math.min(1, totalSets ? currentSet / totalSets : 0));
          const percent = Math.round(progress * 100);
          const ring = `conic-gradient(rgba(255,255,255,0.95) 0% ${percent}%, rgba(255,255,255,0.25) ${percent}% 100%)`;
          return (
            <div className="relative h-11 w-11 sm:h-14 sm:w-14">
              <div className="absolute inset-0 rounded-full border-[3px] border-theme" style={{ background: ring }} />
              <div className="surface-contrast absolute inset-[3px] sm:inset-1 flex items-center justify-center rounded-full text-xs font-semibold text-force-light shadow sm:text-sm">
                {currentSet}/{totalSets}
              </div>
            </div>
          );
        })()}
      </div>
      <p className="text-theme-primary text-center text-[42px] font-semibold tracking-[.1em] sm:text-[64px]">
        {formatTime(remainingSeconds)}
      </p>
      {showPomodoroControls && (
        <div className="mt-5 flex justify-center sm:mt-6">
          <TimerControlBar selects={selects} actions={actions} />
        </div>
      )}
      <div className="mt-4 sm:mt-5">
        <PomodoroList />
      </div>
    </div>
  );
};


