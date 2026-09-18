import { Crosshair } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  CENTER_PLACEMENT,
  clampPlacement,
  describePlacement,
  PLACEMENT_CENTER,
  PLACEMENT_STEPS,
  type Placement,
} from '~/store/settings-context';
import { Action } from './Action';

type Props = {
  value: Placement;
  onChange: (next: Placement) => void;
  /** 面の縦横比。実際の面に近い形で示す */
  aspect?: number;
  className?: string;
};

/**
 * 12分割の格子点から配置を選ぶ。点を並べると狭い面で押せなくなるため、
 * 面そのものを押す形にし、最も近い格子点へ吸着させる。
 */
export const PositionPad = ({ value, onChange, aspect = 16 / 9, className }: Props) => {
  const pad = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (clientX: number, clientY: number) => {
    const rect = pad.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    onChange(
      clampPlacement({
        x: ((clientX - rect.left) / rect.width) * PLACEMENT_STEPS,
        y: ((clientY - rect.top) / rect.height) * PLACEMENT_STEPS,
      }),
    );
  };

  const move = (dx: number, dy: number) => onChange(clampPlacement({ x: value.x + dx, y: value.y + dy }));

  const left = (value.x / PLACEMENT_STEPS) * 100;
  const top = (value.y / PLACEMENT_STEPS) * 100;

  const centered = value.x === PLACEMENT_CENTER && value.y === PLACEMENT_CENTER;

  const surface = (
    <div
      ref={pad}
      role="slider"
      tabIndex={0}
      aria-label="表示の配置"
      aria-valuetext={describePlacement(value)}
      aria-valuenow={value.y * (PLACEMENT_STEPS + 1) + value.x}
      aria-valuemin={0}
      aria-valuemax={(PLACEMENT_STEPS + 1) ** 2 - 1}
      className={`relative w-full touch-none rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] ${className ?? ''}`}
      style={{
        aspectRatio: String(aspect),
        cursor: dragging ? 'grabbing' : 'crosshair',
        /*
         * 12分割の目盛りは引かない。吸着は自動で、位置は点と文言で読めるため、
         * 線を敷いても情報が増えない。中央だけは狙う位置なので薄く示す。
         */
        backgroundImage:
          'linear-gradient(to right, transparent calc(50% - 1px), var(--color-border-subtle) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom, transparent calc(50% - 1px), var(--color-border-subtle) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px))',
      }}
      onPointerDown={(event) => {
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (dragging) pick(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        setDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 3 : 1;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const delta = moves[event.key];
        if (!delta) return;
        event.preventDefault();
        event.stopPropagation();
        move(delta[0], delta[1]);
      }}
    >
      <span
        aria-hidden
        className="absolute h-[9px] w-[9px] rounded-[var(--radius-marker)] bg-[var(--color-fg-primary)]"
        style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );

  return (
    <div className="grid gap-[var(--spacing-inline)]">
      {surface}
      <Action
        shape="bare"
        className="w-fit text-[length:var(--text-label)]"
        disabled={centered}
        onClick={() => onChange(CENTER_PLACEMENT)}
      >
        <Crosshair size={13} />
        中央に戻す
      </Action>
    </div>
  );
};
