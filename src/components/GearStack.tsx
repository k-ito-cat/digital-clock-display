import { Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Action } from './Action';
import { ADJUST_VARIANTS, type AdjustVariant } from './adjust-variants';

type Props = {
  onOpenSettings: () => void;
  onEnterAdjust: (variant: AdjustVariant) => void;
};

/** 歯車から遠い順に並べる。上へ滑らせた先に大きい方が来る */
const ITEMS = (['full', 'compact'] as const).map((variant) => ({ variant, ...ADJUST_VARIANTS[variant] }));

/**
 * 歯車に画面レイアウトの呼び出しを重ねる。
 * 細かいポインタではホバーで現れ、そのまま押せる。
 * 粗いポインタではホバーが無いため、押している間に現れ、上へ滑らせて選び、離して決める。
 * 現れる2つは群から離れて浮くため、カプセルの中ではなく、それぞれが円の地を持つ。
 * hig: disclosure.hover-reveal
 */
export const GearStack = ({ onOpenSettings, onEnterAdjust }: Props) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<AdjustVariant | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const stack = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<Map<AdjustVariant, HTMLElement>>(new Map());
  // 滑らせて選んだ後に続くクリックを飲み込む
  const consumedClick = useRef(false);

  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const element = stack.current;
      setOpen(false);
      setActive(null);
      consumedClick.current = open;
      if (element?.contains(document.activeElement)) trigger.current?.focus();
      setDismissed(true);
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open]);

  const hitTest = (x: number, y: number): AdjustVariant | null => {
    for (const [variant, element] of items.current) {
      const rect = element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return variant;
    }
    return null;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    setDismissed(false);
    consumedClick.current = false;
    // マウスはホバーで現れるため、この操作を挟まない
    if (event.pointerType === 'mouse') return;
    setOpen(true);
    setActive(null);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!open || event.pointerType === 'mouse') return;
    setActive(hitTest(event.clientX, event.clientY));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!open || event.pointerType === 'mouse') return;
    const picked = hitTest(event.clientX, event.clientY);
    setOpen(false);
    setActive(null);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (picked) {
      consumedClick.current = true;
      onEnterAdjust(picked);
      return;
    }
    // 歯車の上で離した場合は、そのまま設定を開く
    consumedClick.current = true;
    onOpenSettings();
  };

  return (
    <div
      ref={stack}
      className="stack relative flex flex-col items-center gap-[var(--spacing-action)]"
      data-open={open ? 'true' : undefined}
      data-dismissed={dismissed || undefined}
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse') setDismissed(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') setDismissed(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDismissed(false);
      }}
    >
      <div className="absolute bottom-full flex flex-col items-center gap-[var(--spacing-action)] pb-[var(--spacing-action)]">
        {ITEMS.map((item) => (
          <Action
            key={item.variant}
            ref={(element: HTMLButtonElement | null) => {
              if (element) items.current.set(item.variant, element);
              else items.current.delete(item.variant);
            }}
            className="stack-item control-bubble rounded-full"
            tabIndex={dismissed ? -1 : undefined}
            aria-label={item.label}
            aria-pressed={active === item.variant || undefined}
            tip={item.tip}
            onClick={() => onEnterAdjust(item.variant)}
          >
            <item.Icon size={16} />
          </Action>
        ))}
      </div>

      <Action
        ref={trigger}
        aria-label="設定"
        aria-expanded={open || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setOpen(false);
          setActive(null);
        }}
        onClick={() => {
          if (consumedClick.current) {
            consumedClick.current = false;
            return;
          }
          onOpenSettings();
        }}
        style={{ touchAction: 'none' }}
      >
        <SettingsIcon size={16} />
      </Action>
    </div>
  );
};
