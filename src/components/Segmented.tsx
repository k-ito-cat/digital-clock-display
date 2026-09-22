import type { ReactNode } from 'react';
import { Action } from './Action';

type Option<T extends string | number> = { value: T; label: ReactNode };

type Props<T extends string | number> = {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

/**
 * 選択肢が少ない設定は、開いて選ぶのではなく並べて選ぶ。
 * 選択中の値は操作要素の形を保った薄い塗りで示す。hig の button.no-fill に従う。
 */
export const Segmented = <T extends string | number>({ label, value, options, onChange, className }: Props<T>) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={`flex flex-wrap items-center gap-[var(--spacing-tight)] ${className ?? ''}`}
  >
    {options.map((option) => (
      <Action
        key={String(option.value)}
        shape="segment"
        role="radio"
        aria-checked={value === option.value}
        onClick={() => onChange(option.value)}
        className="text-[length:var(--text-body)]"
      >
        {option.label}
      </Action>
    ))}
  </div>
);
