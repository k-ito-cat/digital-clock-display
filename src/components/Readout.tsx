import type { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { readoutFontSize, readoutReference } from '~/lib/readout';
import { PLACEMENT_STEPS, useSettings } from '~/store/settings-context';
import { FACE_CLASS } from './face-class';

/**
 * 主表示。大きさは面の短辺を基準にした相対値で決める。
 * docs/design/layouts.md の「面基準のスケーリング」に対応する。
 */
export const Readout = ({ children, maxSize }: { children: string; maxSize?: string }) => {
  const { settings } = useSettings();
  const size = readoutFontSize(children, settings.scale, readoutReference(settings));
  return (
    <p
      className={cn('readout tabular m-0', FACE_CLASS[settings.face])}
      style={{ fontSize: maxSize ? `min(${size}, ${maxSize})` : size }}
    >
      {children}
    </p>
  );
};

export const SubText = ({ children }: { children: ReactNode }) => (
  <p className="m-0 text-[var(--color-fg-secondary)]" style={{ fontSize: 'clamp(0.7rem, min(3cqi, 5cqb), 1.5rem)' }}>
    {children}
  </p>
);

/** 進捗は面を持たず、1本の線で示す */
export const ProgressLine = ({ value, label }: { value: number; label: string }) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuenow={Math.round(value * 100)}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-[2px] w-[min(40cqi,240px)] overflow-hidden bg-[var(--color-border-subtle)]"
  >
    <div
      className="h-full bg-[var(--color-fg-primary)] transition-[width] duration-[var(--motion-state)] ease-[var(--ease-out)]"
      style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }}
    />
  </div>
);

/**
 * 主表示と副次情報のまとまり。
 * 配置は面を12分割した格子点で指定する。0で縁に接し、12で反対の縁に接する。
 */
export const ReadoutGroup = ({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) => {
  const { settings } = useSettings();
  const x = (settings.placement.x / PLACEMENT_STEPS) * 100;
  const y = (settings.placement.y / PLACEMENT_STEPS) * 100;

  return (
    <div className={cn('h-full w-full p-[var(--spacing-edge)]', className)}>
      <div className="relative h-full w-full">
        <div
          className={cn(
            'readout-group absolute grid justify-items-center gap-[var(--spacing-stack)]',
            contentClassName,
          )}
          style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-${x}%, -${y}%)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
