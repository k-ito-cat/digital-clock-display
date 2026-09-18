import { useRef, useState } from 'react';
import { toHalfWidthDigits } from '~/lib/time';

/**
 * 数字の直接編集で共通の入力の扱い。
 *
 * type="number" は不正な値を受け取ると value を空文字で返すため、全角で入力された文字が
 * 届かず半角へ寄せられない。text として受け取り、こちらで整える。
 * 変換中は文字を触らず、確定した時点で寄せる。日本語入力の途中で書き換えると入力できなくなるため。
 */
export const useNumberDraft = (initial: number) => {
  const [draft, setDraft] = useState(String(initial));
  const composing = useRef(false);

  return {
    draft,
    reset: (value: number) => setDraft(String(value)),
    /** 入力欄へそのまま渡す属性 */
    inputProps: {
      type: 'text' as const,
      inputMode: 'numeric' as const,
      autoComplete: 'off' as const,
      lang: 'en',
      value: draft,
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => {
        composing.current = false;
        setDraft(toHalfWidthDigits(event.currentTarget.value));
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        setDraft(composing.current ? raw : toHalfWidthDigits(raw));
      },
    },
    /** 確定時の値。範囲は呼び出し側で丸める */
    commitValue: (fallback: number) => {
      const parsed = Number(toHalfWidthDigits(draft));
      return Number.isFinite(parsed) && toHalfWidthDigits(draft) !== '' ? parsed : fallback;
    },
  };
};
