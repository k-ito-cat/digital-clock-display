import type { ReactNode } from 'react';

/**
 * 設定の階層を、大きさ・濃さ・間隔だけで作る。
 * 区画見出し（本文サイズ・前景色・太字）> ラベル（ラベルサイズ・副次色）> 操作。
 * ラベルと操作は密に、フィールド同士は離す。docs/design/hig.md の form.* に対応する。
 */
export const Zone = ({
  title,
  description,
  divided = true,
  children,
}: {
  title: string;
  description?: string;
  /** 分類の先頭の区画は罫線を持たない */
  divided?: boolean;
  children: ReactNode;
}) => (
  <section
    className={
      divided
        ? 'grid gap-[var(--spacing-stack)] border-t border-[var(--color-border-subtle)] pt-[var(--spacing-section)]'
        : 'grid gap-[var(--spacing-stack)]'
    }
  >
    <div className="grid gap-[2px]">
      <h3 className="m-0 text-[length:var(--text-body)] font-semibold text-[var(--color-fg-primary)]">{title}</h3>
      {description ? (
        <p className="m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">{description}</p>
      ) : null}
    </div>
    <div className="grid gap-[var(--spacing-group)]">{children}</div>
  </section>
);

export const Field = ({ label, hint, children }: { label: ReactNode; hint?: string; children: ReactNode }) => (
  <div className="grid gap-[var(--spacing-tight)]">
    <span className="text-[length:var(--text-label)] tracking-[0.04em] text-[var(--color-fg-secondary)]">{label}</span>
    {children}
    {hint ? <p className="m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">{hint}</p> : null}
  </div>
);

/** ラベルが操作そのものに含まれる場合（トグルやチェック）に使う */
export const FieldRow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`grid gap-[var(--spacing-inline)] text-[length:var(--text-body)] ${className}`}>{children}</div>
);
