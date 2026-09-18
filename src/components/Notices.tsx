import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { useNotices, type Notice } from '~/store/notices-context';

/**
 * hig: feedback.failure / feedback.status-color
 * 平常時は何も出ない。必要な時だけ1件だけ、画面上部の中央に上から現れる。
 * オーバーレイ面を開いている間も位置を変えない。面の中に入れると項目を押しのけるため。
 * その場合はその面の中から呼び、top layer の中で画面に対して固定する。暗幕の下に隠れないようにするため。
 * 色だけに頼らないよう記号を種類ごとに変える。hig: a11y.state-not-color-only
 */
const TONE: Record<Notice['kind'], { Icon: typeof Info; color: string }> = {
  error: { Icon: TriangleAlert, color: 'var(--color-status-error)' },
  warn: { Icon: CircleAlert, color: 'var(--color-status-warn)' },
  info: { Icon: Info, color: 'var(--color-border-subtle)' },
};

export const Notices = ({ active = true }: { active?: boolean }) => {
  const { notices } = useNotices();
  if (!active) return null;

  return (
    <div className="notices-top pointer-events-none" style={{ zIndex: 'var(--z-notice)' }}>
      <div role="status" aria-live="polite" aria-label="通知" className="notices">
        {notices.map((notice) => {
          const { Icon, color } = TONE[notice.kind];
          return (
            <p
              key={notice.id}
              className="pointer-events-auto m-0 flex items-start gap-[var(--spacing-inline)] rounded-[var(--radius-control)] border bg-[var(--color-surface-overlay)] px-[var(--spacing-stack)] py-[var(--spacing-inline)] text-[length:var(--text-body)] text-[var(--color-fg-primary)]"
              style={{ borderColor: color }}
            >
              <Icon aria-hidden size={16} className="shrink-0" style={{ color }} />
              <span className="min-w-0 [overflow-wrap:anywhere]">{notice.message}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
};
