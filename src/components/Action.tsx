import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { cn } from '~/lib/cn';

/**
 * docs/design/tokens.md の Element Matrix に対応する。
 * hig: button.no-fill / button.no-hierarchy
 * 塗りで示さず、平常時は副次色、反応で前景色へ上げる。主副の階層は持たない。
 */
const action = cva(
  [
    // アイコンの大きさを token から与えるための目印
    'action',
    'inline-flex items-center justify-center gap-[var(--spacing-inline)] whitespace-nowrap',
    'border-0 bg-transparent text-[var(--color-fg-secondary)]',
    // 現れ方でも同じ時間を使うため、opacity と translate も対象に含める
    'transition-[color,border-color,opacity,translate] duration-[var(--motion-state)] ease-[var(--ease-out)]',
    'hover:text-[var(--color-fg-primary)] focus-visible:text-[var(--color-fg-primary)]',
    'aria-pressed:text-[var(--color-fg-primary)] aria-selected:text-[var(--color-fg-primary)]',
    'disabled:opacity-[var(--opacity-disabled)]',
    // hig: a11y。粗いポインタでは当たり判定を広げる
    'min-h-[var(--size-hit)]',
  ],
  {
    variants: {
      shape: {
        // アイコンだけの操作は正方形の当たり判定を確保する
        icon: 'min-w-[var(--size-hit)] rounded-[var(--radius-control)]',
        boxed:
          'rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] px-[var(--spacing-inline)] hover:border-[var(--color-fg-primary)]',
        tab: 'rounded-none border-b border-transparent px-[var(--spacing-inline)] aria-selected:border-b-[var(--color-fg-primary)]',
        // 値の選択は、画面の現在地（tab）と区別して薄い塗りで示す
        segment:
          'rounded-[var(--radius-control)] px-[var(--spacing-inline)] aria-checked:bg-[color-mix(in_srgb,var(--color-fg-primary)_12%,transparent)] aria-checked:text-[var(--color-fg-primary)]',
        bare: 'min-w-[var(--size-hit)] rounded-[var(--radius-control)]',
      },
      /*
       * hig: button.no-hierarchy の例外。取り返しのつかない操作にだけ状態色を使う。
       * feedback.status-color に従い、オーバーレイ面の地色の上でのみ成立する。
       */
      tone: {
        neutral: '',
        danger: [
          'text-[var(--color-status-error)]',
          'hover:text-[var(--color-status-error)] focus-visible:text-[var(--color-status-error)]',
          'hover:border-[var(--color-status-error)]',
        ],
      },
    },
    defaultVariants: { shape: 'icon', tone: 'neutral' },
  },
);

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof action> & {
    children?: ReactNode;
    /** アイコンだけの操作に添える説明。指定するとツールチップで示す */
    tip?: string;
  };

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, shape, tone, tip, type = 'button', ...props }, ref) => {
    const button = <button ref={ref} type={type} className={cn(action({ shape, tone }), className)} {...props} />;
    return tip ? <Tooltip label={tip}>{button}</Tooltip> : button;
  },
);
Action.displayName = 'Action';
