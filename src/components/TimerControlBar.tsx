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
    <div className={clsx('w-full max-w-[420px] rounded-2xl bg-white/90 px-4 py-3 shadow-md', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className={clsx('grid w-full grid-cols-1 gap-2 sm:gap-3', responsiveGridClass)}>
          {selects.map((select) => (
            <div key={select.id} className="flex flex-col">
              {select.label && (
                <label className="mb-1 text-[10px] font-semibold text-gray-500 sm:text-xs">
                  {select.label}
                </label>
              )}
              <div className="relative">
                <select
                  className={clsx(
                    'w-full bg-white/90',
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
              className="text-gray-700"
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


