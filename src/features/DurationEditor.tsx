import { ChevronDown, ChevronUp } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { pad2 } from '~/lib/time';
import { useNumberDraft } from './useNumberDraft';

type Part = { key: 'h' | 'm' | 's'; label: string; value: number; max: number };

type Props = {
  hours: number;
  minutes: number;
  seconds: number;
  onChange: (part: Part['key'], value: number) => void;
  /** 主表示と同じ大きさで描くための指定 */
  style: React.CSSProperties;
  className: string;
};

/**
 * 停止中のタイマーは、主表示そのものを編集対象にする。
 * 設定のための別の行を持たず、どの桁かはラベルで示す。
 * 桁を上下の矢印で挟み、1ずつ変えられるようにする。自由入力も残す。
 * hig: pointer.editable-affordance / disclosure.auto-hide
 * docs/design/screens.md のタイマーに対応する。
 */
export const DurationEditor = ({ hours, minutes, seconds, onChange, style, className }: Props) => {
  const parts: Part[] = [
    { key: 'h', label: '時', value: hours, max: 23 },
    { key: 'm', label: '分', value: minutes, max: 59 },
    { key: 's', label: '秒', value: seconds, max: 59 },
  ];

  /*
   * 桁とラベルと矢印を同じ行構成に載せる。
   * 区切り文字は桁の行にだけ置き、上下の矢印と高さを取り合わないようにする。
   */
  return (
    <div className={`duration ${className}`} style={style}>
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 ? (
            <span className="duration-sep" aria-hidden>
              :
            </span>
          ) : null}
          <Column part={part} onChange={onChange} />
        </Fragment>
      ))}
    </div>
  );
};

const Column = ({ part, onChange }: { part: Part; onChange: Props['onChange'] }) => {
  const [editing, setEditing] = useState(false);
  /*
   * 桁の中で巡回する。59の次は0、0の手前は59。
   * 端で止めると、目的の値が反対側にある時に一度戻す操作が要る。桁上がりはしない。
   */
  const step = (delta: number) => {
    const size = part.max + 1;
    onChange(part.key, (part.value + delta + size) % size);
  };

  return (
    <span className="duration-part">
      <Step
        direction="up"
        label={`${part.label}を1増やす`}
        // 編集中だけ押せなくする。下書きと確定が衝突するため
        disabled={editing}
        onStep={() => step(1)}
      />
      <Segment part={part} editing={editing} setEditing={setEditing} onChange={onChange} onStep={step} />
      <Step direction="down" label={`${part.label}を1減らす`} disabled={editing} onStep={() => step(-1)} />
      <span className="duration-label" aria-hidden>
        {part.label}
      </span>
    </span>
  );
};

/** 押し続けた時に、連続で変わり始めるまでの時間 */
const HOLD_DELAY_MS = 350;
/** 連続変更の間隔。押し続けるほど速くする */
const REPEAT_START_MS = 120;
const REPEAT_MIN_MS = 30;

const Step = ({
  direction,
  label,
  disabled,
  onStep,
}: {
  direction: 'up' | 'down';
  label: string;
  disabled: boolean;
  onStep: () => void;
}) => {
  const timer = useRef(0);
  // ポインタで処理した分を、続けて届く click で二重に数えない
  const handled = useRef(false);
  const step = useRef(onStep);

  useEffect(() => {
    step.current = onStep;
  }, [onStep]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stop = () => {
    window.clearTimeout(timer.current);
    timer.current = 0;
  };

  const repeat = (wait: number) => {
    timer.current = window.setTimeout(() => {
      step.current();
      repeat(Math.max(REPEAT_MIN_MS, wait * 0.85));
    }, wait);
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="duration-step auto-hide"
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        handled.current = true;
        step.current();
        // 押し始めに1つ動かし、押し続けている間だけ連続で動かす
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => repeat(REPEAT_START_MS), HOLD_DELAY_MS);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      // キーボードでの実行だけをここで受ける。押しっぱなしはブラウザのキーリピートに任せる
      onClick={() => {
        if (handled.current) {
          handled.current = false;
          return;
        }
        step.current();
      }}
    >
      {direction === 'up' ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
    </button>
  );
};

const Segment = ({
  part,
  editing,
  setEditing,
  onChange,
  onStep,
}: {
  part: Part;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  onChange: Props['onChange'];
  onStep: (delta: number) => void;
}) => {
  const { inputProps, reset, commitValue } = useNumberDraft(part.value);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);

  const commit = () => {
    onChange(part.key, Math.min(part.max, Math.max(0, Math.round(commitValue(part.value)))));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={input}
        aria-label={part.label}
        autoFocus
        {...inputProps}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') setEditing(false);
        }}
        className="w-[2.2ch] appearance-none border-0 bg-transparent p-0 text-center text-[length:inherit] leading-[inherit]"
        style={{ color: 'var(--color-fg-primary)' }}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${part.label}を編集`}
      onClick={() => {
        reset(part.value);
        setEditing(true);
      }}
      // 矢印と同じ操作をキーボードからも行えるようにする
      onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        onStep(event.key === 'ArrowUp' ? 1 : -1);
      }}
      className="duration-digits"
    >
      {pad2(part.value)}
    </button>
  );
};
