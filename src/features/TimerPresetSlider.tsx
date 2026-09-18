import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Action } from '~/components/Action';
import { TIMER_PRESETS } from '~/lib/presets';
import { useTimers } from '~/store/timers-context';

/**
 * よく使う長さ。主表示の直下に1つだけ置き、中央に来たものを設定値とする。
 * 見た目は環状に繋がるが、支援技術には有限の一覧として見せる。
 * hig: form.looping-slider。開く操作を挟まず、端でも止まらない。
 * motion.no-attention に従い、自動では動かさない。動くのは利用者が操作した時だけ。
 * disclosure.auto-hide の対象。操作しない間は他の操作と同じ条件で消える。
 */
const LENGTH = TIMER_PRESETS.length;
/** 環状に見せるための複製数。中央の写しだけが支援技術から見える */
const COPIES = 3;
const MIDDLE = 1;
/** 慣性スクロールが止まったとみなすまでの時間 */
const SETTLE_MS = 140;

const slotOf = (seconds: number) => TIMER_PRESETS.findIndex((preset) => preset.seconds === seconds);

const nearestIndex = (track: HTMLElement) => {
  const middle = track.scrollLeft + track.clientWidth / 2;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < track.children.length; index += 1) {
    const item = track.children[index] as HTMLElement;
    const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
};

export const TimerPresetSlider = () => {
  const { timer, resetTimer } = useTimers();
  const baseId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  // 直接編集で値がプリセットから外れた場合は、設定中の印だけを外して位置は保つ
  const unset = slotOf(timer.totalSeconds) < 0;
  const [center, setCenter] = useState(() => MIDDLE * LENGTH + Math.max(0, slotOf(timer.totalSeconds)));
  const slot = ((center % LENGTH) + LENGTH) % LENGTH;

  // 確定は「同じ値なら何もしない」ため、自分で動かした分と利用者の操作を区別しなくてよい
  const commit = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    commit.current = (index) => {
      const seconds = TIMER_PRESETS[((index % LENGTH) + LENGTH) % LENGTH].seconds;
      if (seconds !== timer.totalSeconds) resetTimer(seconds);
    };
  }, [timer.totalSeconds, resetTimer]);

  const scrollToIndex = (index: number, behavior: ScrollBehavior) => {
    const track = trackRef.current;
    const item = track?.children[index] as HTMLElement | undefined;
    if (!track || !item) return;
    track.scrollTo({ left: item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2, behavior });
  };

  // 初期位置。設定中の長さを中央の写しへ合わせる
  useEffect(() => {
    scrollToIndex(MIDDLE * LENGTH + Math.max(0, slotOf(timer.totalSeconds)), 'auto');
    // 画面に現れた時の1回だけ。以後の同期は下の効果が担う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let settle = 0;

    const follow = () => {
      frame = 0;
      setCenter(nearestIndex(track));
    };

    const stopped = () => {
      const index = nearestIndex(track);
      const copy = Math.floor(index / LENGTH);
      // 端の写しで止まったら、見た目を変えずに中央の写しへ戻す。これで環状に繋がる
      if (copy !== MIDDLE) {
        const from = track.children[index] as HTMLElement;
        const to = track.children[MIDDLE * LENGTH + (index % LENGTH)] as HTMLElement;
        track.scrollLeft += to.offsetLeft - from.offsetLeft;
        setCenter(MIDDLE * LENGTH + (index % LENGTH));
      }
      commit.current(index);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(follow);
      window.clearTimeout(settle);
      settle = window.setTimeout(stopped, SETTLE_MS);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);

  // 主表示を直接編集した結果がプリセットと一致したら、その位置へ合わせる
  useEffect(() => {
    const target = slotOf(timer.totalSeconds);
    if (target < 0 || target === ((center % LENGTH) + LENGTH) % LENGTH) return;
    scrollToIndex(MIDDLE * LENGTH + target, 'auto');
  }, [timer.totalSeconds, center]);

  const pick = (index: number) => {
    commit.current(index);
    // 端の写しを押した場合もその場へ寄せる。中央の写しへの戻しは止まった時に行う
    scrollToIndex(index, 'smooth');
  };

  /**
   * 矢印とキーボードも環状に繋がる。中央の写しから1つ動くだけなので、
   * 端を越える時も隣の写しへ滑らかに進み、止まった時に中央へ戻る。
   */
  const step = (delta: number) => pick(center + delta);

  return (
    <div className="preset-slider auto-hide" data-unset={unset}>
      <Action aria-label="1つ短い長さ" onClick={() => step(-1)}>
        <ChevronLeft size={16} />
      </Action>

      <div
        ref={trackRef}
        className="preset-track"
        role="listbox"
        aria-label="タイマーの長さ"
        aria-activedescendant={`${baseId}-${slot}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') step(-1);
          else if (event.key === 'ArrowRight') step(1);
          else if (event.key === 'Home') pick(center - slot);
          else if (event.key === 'End') pick(center - slot + LENGTH - 1);
          else return;
          event.preventDefault();
        }}
      >
        {Array.from({ length: COPIES }, (_, copy) =>
          TIMER_PRESETS.map((preset, index) => {
            const flat = copy * LENGTH + index;
            const visible = copy === MIDDLE;
            return (
              <div
                key={`${copy}-${preset.seconds}`}
                id={visible ? `${baseId}-${index}` : undefined}
                className="preset-item"
                data-center={flat === center}
                role={visible ? 'option' : undefined}
                aria-selected={visible ? index === slot && !unset : undefined}
                aria-hidden={visible ? undefined : true}
                onClick={() => pick(flat)}
              >
                {preset.label}
              </div>
            );
          }),
        )}
      </div>

      <Action aria-label="1つ長い長さ" onClick={() => step(1)}>
        <ChevronRight size={16} />
      </Action>
    </div>
  );
};
