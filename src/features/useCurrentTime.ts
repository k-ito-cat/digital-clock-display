import { useEffect, useState } from 'react';
import { msUntilNextTick } from '~/lib/time';

/**
 * 現在時刻。秒を表示していない間は毎秒描き直さず、分の変わり目だけ更新する。
 * 端末時刻が変わっても次の更新で追従する。
 */
export const useCurrentTime = (showSeconds: boolean) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let id: number;
    const tick = () => {
      setNow(new Date());
      id = window.setTimeout(tick, msUntilNextTick(Date.now(), showSeconds));
    };
    id = window.setTimeout(tick, msUntilNextTick(Date.now(), showSeconds));
    return () => window.clearTimeout(id);
  }, [showSeconds]);

  return now;
};
