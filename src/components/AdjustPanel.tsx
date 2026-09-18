import { Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { clampToFrame, type Point } from '~/lib/geometry';
import { describePlacement, FACES, LEGIBILITY_OPTIONS, PLACEMENT_CENTER, useSettings } from '~/store/settings-context';
import { Action } from './Action';
import { ColorPresets } from './ColorPresets';
import { ADJUST_VARIANTS, OTHER_VARIANT, type AdjustVariant } from './adjust-variants';
import { Field } from './Field';
import { PositionPad } from './PositionPad';
import { Segmented } from './Segmented';

const KEY_STEP = 8;
const KEY_STEP_LARGE = 24;
const EDGE_GAP = 12;

type Props = {
  variant: AdjustVariant;
  /** パネルを収める面。render 中に参照しないよう ref のまま受け取る */
  bounds: RefObject<HTMLElement | null>;
  onSwitch: (variant: AdjustVariant) => void;
  onExit: () => void;
};

/**
 * 表示を見ながら調整するパネル。
 * 小さい方は連続量だけを載せ、調整対象を隠さないことを優先する。
 * 大きい方は表示に関わる設定をすべて載せる。どちらも面の幅を超えない。
 */
export const AdjustPanel = ({ variant, bounds, onSwitch, onExit }: Props) => {
  const { settings, update } = useSettings();
  const panel = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);
  const grabOffset = useRef({ x: 0, y: 0 });
  const exit = useRef(onExit);
  const positioned = position !== null;

  useEffect(() => {
    exit.current = onExit;
  }, [onExit]);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  useEffect(() => {
    if (positioned) panel.current?.focus();
  }, [positioned]);

  const other = ADJUST_VARIANTS[OTHER_VARIANT[variant]];

  const clamp = (next: Point) =>
    clampToFrame(next, bounds.current?.getBoundingClientRect(), panel.current?.getBoundingClientRect());

  // 調整対象と重ならないよう、時計の配置の反対側へ置く
  useEffect(() => {
    const container = bounds.current;
    if (position || !container || !panel.current) return;
    const frame = container.getBoundingClientRect();
    const self = panel.current.getBoundingClientRect();
    const atTop = settings.placement.y <= PLACEMENT_CENTER;
    setPosition({
      x: Math.max(EDGE_GAP, (frame.width - self.width) / 2),
      y: atTop ? Math.max(EDGE_GAP, frame.height - self.height - EDGE_GAP) : EDGE_GAP,
    });
  }, [position, bounds, settings.placement]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        exit.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /**
   * パネルの外を押したら終了する。設定はその場で保存されるため、閉じても失うものはない。
   * 押した時点で判定する。中から始めて外で離す操作（つまみ移動、配置の調整）を巻き込まないため。
   */
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const element = panel.current;
      if (!element || event.composedPath().includes(element)) return;
      exit.current();
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  /**
   * 余白だけをつまみにする。操作要素の上で捕捉すると、その要素のクリックが届かなくなる。
   */
  const isControl = (target: EventTarget | null) =>
    (target as Element | null)?.closest('button, input, select, textarea, label, [role="slider"], .notices') != null;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!position || event.button !== 0 || isControl(event.target)) return;
    setDragging(true);
    grabOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setPosition(clamp({ x: event.clientX - grabOffset.current.x, y: event.clientY - grabOffset.current.y }));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // hig: keyboard.panel-move。ポインタを使わなくても退避できる
  const onKeyDown = (event: React.KeyboardEvent) => {
    // 中の操作へ向けた矢印キーを奪わない
    if (!position || event.target !== event.currentTarget) return;
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    event.stopPropagation();
    setPosition(clamp({ x: position.x + move[0], y: position.y + move[1] }));
  };

  const face = (
    <Segmented
      label="書体"
      value={settings.face}
      options={FACES.map((item) => ({ value: item.id, label: item.label }))}
      onChange={(value) => update({ face: value })}
    />
  );

  const scale = (
    <label className="flex items-center gap-[var(--spacing-inline)]">
      <input
        type="range"
        aria-label="文字サイズ"
        min={0.5}
        max={2.8}
        step={0.05}
        value={settings.scale}
        onChange={(event) => update({ scale: Number(event.target.value) })}
        className="w-[104px]"
      />
      <span className="tabular text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">
        {settings.scale.toFixed(2)}x
      </span>
    </label>
  );

  const color = (
    <div className="flex flex-wrap items-center gap-[var(--spacing-inline)]">
      <input
        type="color"
        aria-label="文字色"
        value={settings.textColor || (settings.theme === 'dark' ? '#ffffff' : '#000000')}
        onChange={(event) => update({ textColor: event.target.value })}
        className="h-6 w-9 shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
      />
      <Action
        className="text-[length:var(--text-label)]"
        disabled={settings.textColor === ''}
        onClick={() => update({ textColor: '' })}
      >
        既定
      </Action>
      <ColorPresets value={settings.textColor} onPick={(textColor) => update({ textColor })} />
    </div>
  );

  return (
    <section
      ref={panel}
      tabIndex={0}
      aria-label={`${
        variant === 'compact' ? '表示の調整' : '表示の調整（すべての項目）'
      }。余白をつかむか、矢印キーでパネルを移動できます`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={`absolute grid gap-[var(--spacing-inline)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-[var(--spacing-stack)] text-[length:var(--text-body)] select-none ${
        variant === 'compact' ? 'w-max max-w-[min(92cqi,420px)]' : 'w-[min(92cqi,360px)]'
      }`}
      style={{
        zIndex: 'calc(var(--z-overlay) + 2)',
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        visibility: position ? 'visible' : 'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'pan-y',
      }}
    >
      <div className="flex touch-none items-center gap-[var(--spacing-inline)]">
        {variant === 'compact' ? face : <span className="text-[var(--color-fg-secondary)]">調整</span>}

        {/* 開いていない方の種類へ入れ替える。今の種類は自分の中身で分かるため、出すのは相手側だけ */}
        <Action
          aria-label={other.label}
          tip={other.tip}
          onClick={() => onSwitch(OTHER_VARIANT[variant])}
          className="ml-auto shrink-0"
        >
          <other.Icon size={16} />
        </Action>

        {/* 閉じる操作は設定ドロワーと同じ表し方に揃える */}
        <Action aria-label="調整を終了" tip="調整を終える" onClick={onExit} className="shrink-0">
          <X size={16} />
        </Action>
      </div>

      {variant === 'compact' ? (
        <div className="flex touch-none flex-wrap items-center gap-x-[var(--spacing-stack)] gap-y-[var(--spacing-inline)]">
          <div className="flex items-center gap-[var(--spacing-inline)]">
            <span className="text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">サイズ</span>
            {scale}
          </div>
          <div className="flex items-center gap-[var(--spacing-inline)]">
            <span className="text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">文字色</span>
            {color}
          </div>
        </div>
      ) : (
        <div
          className="scroll-quiet grid max-h-[min(46cqb,420px)] gap-[var(--spacing-group)] overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="flex items-center justify-between gap-[var(--spacing-stack)]">
            <span id="adjust-theme-label">ダークモード</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.theme === 'dark'}
              aria-labelledby="adjust-theme-label"
              onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="relative h-[22px] w-[40px] shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
            >
              <span
                className="absolute top-[2px] grid h-[16px] w-[16px] place-items-center rounded-[var(--radius-marker)] bg-[var(--color-fg-primary)] text-[var(--color-surface-overlay)] transition-[left] duration-[var(--motion-state)] ease-[var(--ease-out)]"
                style={{ left: settings.theme === 'dark' ? '20px' : '2px' }}
              >
                {settings.theme === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
              </span>
            </button>
          </div>

          <Field label="時刻に含める要素">
            <div className="grid gap-[var(--spacing-inline)]">
              <label className="flex items-center gap-[var(--spacing-inline)]">
                <input
                  type="checkbox"
                  checked={settings.showSeconds}
                  onChange={(event) => update({ showSeconds: event.target.checked })}
                />
                秒
              </label>
              <label className="flex items-center gap-[var(--spacing-inline)]">
                <input
                  type="checkbox"
                  checked={settings.showDate}
                  onChange={(event) => update({ showDate: event.target.checked })}
                />
                日付
              </label>
              <label className="flex items-center gap-[var(--spacing-inline)]">
                <input
                  type="checkbox"
                  checked={settings.showWeekday}
                  onChange={(event) => update({ showWeekday: event.target.checked })}
                />
                曜日
              </label>
              <label className="flex items-center gap-[var(--spacing-inline)]">
                <input
                  type="checkbox"
                  checked={settings.hour12}
                  onChange={(event) => update({ hour12: event.target.checked })}
                />
                12時間表記
              </label>
            </div>
          </Field>

          <Field label="書体">{face}</Field>
          <Field label={`文字サイズ — ${settings.scale.toFixed(2)}倍`}>{scale}</Field>
          <Field label={`配置 — ${describePlacement(settings.placement)}`}>
            <PositionPad value={settings.placement} onChange={(placement) => update({ placement })} />
          </Field>
          <Field label="時計の背景">
            <Segmented
              label="時計の背景"
              value={settings.legibility}
              options={LEGIBILITY_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(legibility) => update({ legibility })}
            />
          </Field>
          <Field label="文字色">{color}</Field>
        </div>
      )}
    </section>
  );
};
