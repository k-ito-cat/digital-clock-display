import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutoHidePreview } from './AutoHidePreview';

describe('AutoHidePreview', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('設定した秒数で隠れ、少し置いてから繰り返す', () => {
    const { container } = render(<AutoHidePreview seconds={3} />);
    const stage = () => container.querySelector('.hide-preview-stage');

    expect(stage()).toHaveAttribute('data-hidden', 'false');

    act(() => void vi.advanceTimersByTime(2999));
    expect(stage()).toHaveAttribute('data-hidden', 'false');

    act(() => void vi.advanceTimersByTime(1));
    expect(stage()).toHaveAttribute('data-hidden', 'true');

    act(() => void vi.advanceTimersByTime(700));
    expect(stage()).toHaveAttribute('data-hidden', 'false');
  });

  it('0 は隠さない設定なので、進捗を持たず消えない', () => {
    const { container } = render(<AutoHidePreview seconds={0} />);
    expect(container.querySelector('.hide-preview-track')).toBeNull();

    act(() => void vi.advanceTimersByTime(10_000));
    expect(container.querySelector('.hide-preview-stage')).toHaveAttribute('data-hidden', 'false');
  });

  it('進捗の長さは設定した秒数と一致する', () => {
    const { container } = render(<AutoHidePreview seconds={12} />);
    expect(container.querySelector<HTMLElement>('.hide-preview-fill')?.style.animationDuration).toBe('12s');
  });
});
