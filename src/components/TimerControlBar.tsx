import clsx from 'clsx';
import { ReactNode } from 'react';
import { useClockSettings } from '~/context/ClockSettingsContext';

type SelectOption = {
  value: string | number;
  label: ReactNode;
};

export type TimerSelectConfig = {
  id: string;
  label?: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  minWidthClass?: string;
};

export type TimerActionConfig = {
  id: string;
  icon: ReactNode;
  ariaLabel: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
};

interface TimerControlBarProps {
  selects: TimerSelectConfig[];
  actions: TimerActionConfig[];
  className?: string;
}

export const TimerControlBar = ({ selects, actions, className }: TimerControlBarProps) => {
  const { surfaceBackgroundEnabled } = useClockSettings();
  const responsiveGridClass = (() => {
    if (selects.length >= 3) return 'sm:grid-cols-3';
    if (selects.length === 2) return 'sm:grid-cols-2';
    return 'sm:grid-cols-1';
  })();

  return (
    <div
      className={clsx(
        'surface-secondary w-full max-w-[420px] select-none rounded-3xl px-2.5 py-2.5 shadow-lg backdrop-blur-sm sm:px-4 sm:py-3',
        !surfaceBackgroundEnabled && 'surface-background-off',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className={clsx('grid w-full grid-cols-1 gap-2 sm:gap-3', responsiveGridClass)}>
          {selects.map((select) => (
            <div key={select.id} className="flex flex-col">
              {select.label && (
                <label className="text-theme-muted mb-[2px] text-[10px] font-semibold sm:text-xs">
                  {select.label}
                </label>
              )}
              <div className="relative">
                <select
                  className={clsx(
                    'input-surface w-full appearance-none rounded-lg px-2.5 pr-6 py-[5px] text-[13px] font-semibold text-inherit sm:px-3 sm:py-1.5 sm:text-sm',
                    select.minWidthClass,
                  )}
                  value={select.value}
                  onChange={(e) => select.onChange(e.target.value)}
                >
                  {select.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-end gap-2 sm:mt-0">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel}
              title={action.title ?? action.ariaLabel}
              className="btn-theme hover:shadow-lg flex h-9 w-9 items-center justify-center rounded-full text-sm transition hover:-translate-y-[1px] disabled:opacity-40 sm:h-11 sm:w-11 sm:text-base"
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


