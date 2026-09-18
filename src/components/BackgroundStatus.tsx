import { Check, CircleSlash, TriangleAlert } from 'lucide-react';
import { STATUS_LABEL, useBackground } from '~/store/background-context';

const ICON = {
  ok: Check,
  failed: TriangleAlert,
  'rate-limited': CircleSlash,
  unauthorized: TriangleAlert,
} as const;

/** 色は状態の手がかりを増やすために使う。記号と文言だけでも成立させる */
const TONE = {
  ok: 'var(--color-status-ok)',
  failed: 'var(--color-status-error)',
  'rate-limited': 'var(--color-status-warn)',
  unauthorized: 'var(--color-status-error)',
} as const;

const DETAIL: Record<string, string> = {
  ok: '背景を取得できています。',
  failed: '直前の背景を使い続けています。通信を確認してください。',
  'rate-limited': '1時間あたりの上限に達しました。時間をおくと自動で再開します。',
  unauthorized: 'アクセスキーが設定されていないため取得できません。',
};

/**
 * hig: feedback.status-color
 * 記号、文言、残量の目盛りに加えて色でも示す。色だけに意味を持たせない。
 */
export const BackgroundStatus = () => {
  const { status, rate, nextRefreshAt } = useBackground();
  const Icon = ICON[status];
  const ratio = rate && rate.limit > 0 ? rate.remaining / rate.limit : null;

  return (
    <div className="grid gap-[var(--spacing-inline)] text-[length:var(--text-body)]">
      <p className="m-0 flex items-start gap-[var(--spacing-inline)]">
        <Icon aria-hidden size={16} className="mt-[2px] shrink-0" style={{ color: TONE[status] }} />
        <span className="grid gap-[2px]">
          <span className="font-semibold">{STATUS_LABEL[status]}</span>
          <span className="text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">{DETAIL[status]}</span>
        </span>
      </p>

      {rate ? (
        <div className="grid gap-[var(--spacing-tight)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">1時間あたりの残り</span>
            <span className="tabular text-[length:var(--text-label)]">
              {rate.remaining} / {rate.limit}
            </span>
          </div>
          {/* 残量は色ではなく目盛りの長さで示す */}
          <div
            role="meter"
            aria-label="1時間あたりの残りリクエスト"
            aria-valuenow={rate.remaining}
            aria-valuemin={0}
            aria-valuemax={rate.limit}
            className="h-[2px] w-full overflow-hidden bg-[var(--color-border-subtle)]"
          >
            <div
              className="h-full"
              style={{
                width: `${Math.round((ratio ?? 0) * 100)}%`,
                // 残量が少ないほど強い色にする。数値と目盛りでも読めるようにしてある
                background:
                  ratio === null
                    ? 'var(--color-fg-primary)'
                    : ratio <= 0.2
                      ? 'var(--color-status-error)'
                      : ratio <= 0.5
                        ? 'var(--color-status-warn)'
                        : 'var(--color-status-ok)',
              }}
            />
          </div>
        </div>
      ) : null}

      {nextRefreshAt ? (
        <p className="m-0 flex items-baseline justify-between text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">
          <span>次の切替予定</span>
          <span className="tabular">
            {new Date(nextRefreshAt).toLocaleString('ja-JP', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </p>
      ) : null}
    </div>
  );
};
