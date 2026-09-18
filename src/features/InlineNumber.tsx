import { useEffect, useRef, useState } from 'react';
import { useNumberDraft } from './useNumberDraft';

/**
 * 画面ごとの設定は、表示中の値を直接編集する。
 * hig: validation.inline-number。範囲外は拒否せず確定時に丸める。
 */
type Props = {
  value: number;
  onCommit: (next: number) => void;
  min: number;
  max: number;
  label: string;
  suffix?: string;
};

export const InlineNumber = ({ value, onCommit, min, max, label, suffix = '' }: Props) => {
  const [editing, setEditing] = useState(false);
  const { inputProps, reset, commitValue } = useNumberDraft(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    onCommit(Math.min(max, Math.max(min, Math.round(commitValue(value)))));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        aria-label={label}
        autoFocus
        {...inputProps}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') setEditing(false);
        }}
        className="tabular w-[4ch] border-0 border-b border-[var(--color-fg-primary)] bg-transparent text-center"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${label}を編集`}
      onClick={() => {
        reset(value);
        setEditing(true);
      }}
      className="tabular border-0 border-b-[2px] border-transparent bg-transparent p-0 hover:border-[var(--color-fg-primary)] focus-visible:border-[var(--color-fg-primary)]"
    >
      {value}
      {suffix}
    </button>
  );
};
