import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '~/store/settings-context';

const VISIBLE_MS = 2400;

/**
 * 設定は即時に保存され、確定の操作を持たない。
 * 保存されたことが分からないと、閉じたら消えるのではないかと不安になるため、
 * 保存できた事実だけを控えめに示す。hig の feedback.autosave に対応する。
 */
export const SavedIndicator = () => {
  const { savedAt } = useSettings();
  // 消したことだけを覚える。表示の可否は保存時刻との突き合わせで求める
  const [dismissed, setDismissed] = useState<number | null>(null);

  useEffect(() => {
    if (savedAt === null) return;
    const id = window.setTimeout(() => setDismissed(savedAt), VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [savedAt]);

  const visible = savedAt !== null && dismissed !== savedAt;

  return (
    <p
      aria-live="polite"
      className="m-0 flex items-center gap-[var(--spacing-tight)] text-[length:var(--text-label)] text-[var(--color-fg-secondary)] transition-opacity duration-[var(--motion-surface)] ease-[var(--ease-out)]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {visible ? (
        <>
          <Check aria-hidden size={12} style={{ color: 'var(--color-status-ok)' }} />
          保存しました
        </>
      ) : null}
    </p>
  );
};
