import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from 'react';

const GAP = 8;

/**
 * アイコンだけの操作に説明を添える。
 * hig: tooltip.icon-affordance
 *
 * popover で最前面へ出し、面の overflow に切り取られないようにする。
 * interestfor は対応が限られるため、開閉はこちらで制御する。
 * WCAG 1.4.13 に合わせ、Escape で閉じられ、ポインタを載せても消えないようにする。
 */
export const Tooltip = ({ label, children }: { label: string; children: ReactElement }) => {
  const id = useId();
  const tip = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = tip.current;
    if (!element) return;

    if (!anchor) {
      element.hidePopover?.();
      return;
    }

    element.showPopover?.();
    const self = element.getBoundingClientRect();
    // 上に置き、収まらない場合だけ下へ回す
    const above = anchor.top - self.height - GAP;
    element.style.top = `${above >= 0 ? above : anchor.bottom + GAP}px`;
    element.style.left = `${Math.min(
      Math.max(GAP, anchor.left + anchor.width / 2 - self.width / 2),
      window.innerWidth - self.width - GAP,
    )}px`;
  }, [anchor]);

  const show = (event: { currentTarget: EventTarget | null }) =>
    setAnchor((event.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null);
  const hide = () => setAnchor(null);

  const trigger = cloneElement(children, {
    'aria-describedby': id,
    onPointerEnter: show,
    onPointerLeave: hide,
    onFocus: show,
    onBlur: hide,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') hide();
      (children.props as { onKeyDown?: (event: React.KeyboardEvent) => void }).onKeyDown?.(event);
    },
  } as Partial<React.HTMLAttributes<HTMLElement>>);

  return (
    <>
      {trigger}
      <div
        ref={tip}
        id={id}
        role="tooltip"
        popover="manual"
        onPointerLeave={hide}
        className="fixed m-0 w-max max-w-[220px] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] px-[var(--spacing-inline)] py-[var(--spacing-tight)] text-[length:var(--text-label)] text-[var(--color-fg-primary)]"
        style={{ inset: 'auto' }}
      >
        {label}
      </div>
    </>
  );
};
