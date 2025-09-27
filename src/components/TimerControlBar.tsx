import clsx from 'clsx';
import { ReactNode } from 'react';

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
  const responsiveGridClass = (() => {
    if (selects.length >= 3) return 'sm:grid-cols-3';
    if (selects.length === 2) return 'sm:grid-cols-2';
    return 'sm:grid-cols-1';
  })();

  return (
    <div className={clsx('surface-secondary w-full max-w-[420px] rounded-3xl px-4 py-3 shadow-lg backdrop-blur-sm text-theme-primary', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className={clsx('grid w-full grid-cols-1 gap-2 sm:gap-3', responsiveGridClass)}>
          {selects.map((select) => (
            <div key={select.id} className="flex flex-col">
              {select.label && (
                <label className="text-theme-muted mb-1 text-[10px] font-semibold sm:text-xs">
                  {select.label}
                </label>
              )}
              <div className="relative">
                <select
                  className={clsx(
                    'input-surface w-full appearance-none rounded-lg px-3 pr-7 py-1.5 text-sm font-semibold text-inherit',
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
        <div className="flex items-center justify-end gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel}
              title={action.title ?? action.ariaLabel}
              className="btn-theme hover:shadow-lg flex h-11 w-11 items-center justify-center rounded-full text-base transition hover:-translate-y-[1px] disabled:opacity-40"
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


