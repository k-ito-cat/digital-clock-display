import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalSurface } from './ModalSurface';

describe('ModalSurface', () => {
  let animations: { onfinish: (() => void) | null; cancel: ReturnType<typeof vi.fn> }[];

  beforeEach(() => {
    animations = [];
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: vi.fn(() => {
        const animation = { onfinish: null, cancel: vi.fn() };
        animations.push(animation);
        return animation;
      }),
    });
    const style = document.createElement('div').style;
    style.setProperty('--motion-surface', '240ms');
    style.setProperty('--ease-out', 'ease-out');
    style.setProperty('--surface-from', 'translateY(24px)');
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(style);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  });

  const content = (open: boolean, onClose = vi.fn(), onClosed = vi.fn()) => (
    <ModalSurface open={open} onClose={onClose} onClosed={onClosed} labelledBy="title" className="session-sheet">
      <h2 id="title">メニュー</h2>
      <button>内側の操作</button>
    </ModalSurface>
  );

  it('Escのcancel要求を親へ伝え、閉じるアニメーションの完了までopenを保つ', () => {
    const onClose = vi.fn(),
      onClosed = vi.fn();
    const { rerender } = render(content(true, onClose, onClosed));
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    rerender(content(false, onClose, onClosed));
    expect(dialog.open).toBe(true);
    expect(onClosed).not.toHaveBeenCalled();
    act(() => animations.at(-1)?.onfinish?.());
    expect(dialog.open).toBe(false);
    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('内側から外側へドラッグして離しても閉じず、外側のクリックだけで閉じる', () => {
    const onClose = vi.fn();
    render(content(true, onClose));
    const dialog = screen.getByRole('dialog');
    fireEvent.pointerDown(screen.getByRole('button'));
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('動きが無効ならアニメーションを待たずに閉じる', () => {
    const style = document.createElement('div').style;
    style.setProperty('--motion-surface', '0ms');
    vi.mocked(window.getComputedStyle).mockReturnValue(style);
    const onClosed = vi.fn();
    const { rerender } = render(content(true, vi.fn(), onClosed));
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;
    rerender(content(false, vi.fn(), onClosed));
    expect(dialog.open).toBe(false);
    expect(animations).toHaveLength(0);
    expect(onClosed).toHaveBeenCalledOnce();
  });
});
