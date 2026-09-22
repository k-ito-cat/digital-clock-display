import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { useNotices, type Notice } from '~/store/notices-context';

/**
 * hig: feedback.failure / feedback.status-color
 * 平常時は何も出ない。必要な時だけ1件だけ、画面上部の中央に上から現れる。
 * オーバーレイ面を開いている間も位置を変えない。面の中に入れると項目を押しのけるため。
 * その場合はその面の中から呼び、top layer の中で画面に対して固定する。暗幕の下に隠れないようにするため。
 * 色だけに頼らないよう記号を種類ごとに変える。hig: a11y.state-not-color-only
 * 見た目は `.notice` に寄せる。種類は data-kind で伝え、色の対応は styles 側を正本にする。
 */
const ICON: Record<Notice['kind'], typeof Info> = {
  error: TriangleAlert,
  warn: CircleAlert,
  info: Info,
};

export const Notices = ({ active = true }: { active?: boolean }) => {
  const { notices } = useNotices();
  if (!active) return null;

  return (
    <div className="notices-top pointer-events-none" style={{ zIndex: 'var(--z-notice)' }}>
      <div role="status" aria-live="polite" aria-label="通知" className="notices">
        {notices.map((notice) => {
          const Icon = ICON[notice.kind];
          return (
            <p key={notice.id} data-kind={notice.kind} className="notice pointer-events-auto">
              <span aria-hidden="true" className="notice-icon">
                <Icon size={16} />
              </span>
              <span className="min-w-0 [overflow-wrap:anywhere]">{notice.message}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
};
