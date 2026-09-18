import { MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/** 隠れた状態を見せる時間。短すぎると何が起きたか読み取れない */
const HOLD_MS = 700;

/**
 * 隠れるまでの時間を、実際に隠れる様子で示す。
 * 秒数だけでは体感が分からず、ドロワーを閉じて試すまで判断できないため。
 * 秒数を変えたら最初からやり直す。呼び出す側が秒数で作り直す。
 * 0 は隠さない設定なので、動かさずに残る様子だけを見せる。
 * motion.no-attention の例外は設定を開いている間に限る。面を閉じれば動きは残らない。
 */
export const AutoHidePreview = ({ seconds }: { seconds: number }) => {
  const [cycle, setCycle] = useState(0);
  const [hidden, setHidden] = useState(false);
  const never = seconds <= 0;

  useEffect(() => {
    if (never) return;
    const id = window.setTimeout(
      () => {
        if (!hidden) {
          setHidden(true);
          return;
        }
        setHidden(false);
        setCycle((current) => current + 1);
      },
      hidden ? HOLD_MS : seconds * 1000,
    );
    return () => window.clearTimeout(id);
  }, [hidden, seconds, never]);

  return (
    <div className="hide-preview" aria-hidden="true">
      <div className="hide-preview-stage" data-hidden={hidden}>
        <div className="hide-preview-ui control-capsule">
          <span className="hide-preview-bar" />
          <span className="hide-preview-bar" />
          <span className="hide-preview-bar" />
        </div>
        <MousePointer2 size={14} className="hide-preview-cursor" />
      </div>

      {/* 隠さない設定では進捗そのものが無い */}
      {never ? null : (
        <div className="hide-preview-track">
          {/* 周回ごとに作り直して、進捗を最初から動かす */}
          <span key={cycle} className="hide-preview-fill" style={{ animationDuration: `${seconds}s` }} />
        </div>
      )}
    </div>
  );
};
