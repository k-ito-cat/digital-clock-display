import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNumberDraft } from './useNumberDraft';

const change = (value: string) => ({ target: { value } }) as unknown as React.ChangeEvent<HTMLInputElement>;
const composition = (value: string) =>
  ({ currentTarget: { value } }) as unknown as React.CompositionEvent<HTMLInputElement>;

describe('useNumberDraft', () => {
  it('全角で入力されても半角として保持する', () => {
    const { result } = renderHook(() => useNumberDraft(5));
    act(() => result.current.inputProps.onChange(change('１２')));
    expect(result.current.draft).toBe('12');
    expect(result.current.commitValue(5)).toBe(12);
  });

  it('変換中は書き換えず、確定した時点で寄せる', () => {
    const { result } = renderHook(() => useNumberDraft(5));
    act(() => result.current.inputProps.onCompositionStart());
    act(() => result.current.inputProps.onChange(change('１２')));
    expect(result.current.draft).toBe('１２');

    act(() => result.current.inputProps.onCompositionEnd(composition('１２')));
    expect(result.current.draft).toBe('12');
  });

  it('数字以外だけの入力は元の値を保つ', () => {
    const { result } = renderHook(() => useNumberDraft(7));
    act(() => result.current.inputProps.onChange(change('あ')));
    expect(result.current.commitValue(7)).toBe(7);
  });

  it('編集を始める時に現在の値へ戻せる', () => {
    const { result } = renderHook(() => useNumberDraft(5));
    act(() => result.current.inputProps.onChange(change('9')));
    act(() => result.current.reset(30));
    expect(result.current.draft).toBe('30');
  });
});
