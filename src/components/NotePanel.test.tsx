import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NOTE_MAX_LENGTH, NOTE_STORAGE_KEY } from '~/lib/note';
import { NoticeProvider } from '~/store/notices';
import { NotePanel, type NoteMode } from './NotePanel';

describe('NotePanel', () => {
  beforeEach(() => {
    localStorage.clear();
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
    const style = document.createElement('div').style;
    style.setProperty('--motion-surface', '0ms');
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(style);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });

  const renderNote = (mode: NoteMode = 'open') => {
    const onModeChange = vi.fn();
    const onClose = vi.fn();
    render(
      <NoticeProvider>
        <NotePanel mode={mode} bounds={{ current: document.body }} onModeChange={onModeChange} onClose={onClose} />
      </NoticeProvider>,
    );
    return { onModeChange, onClose };
  };

  it('保存済み内容を読み、変更がなければ確認せず閉じる', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存済み'));
    const { onClose } = renderNote();

    expect(screen.getByRole('textbox', { name: 'ノート本文' })).toHaveValue('保存済み');
    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog', { name: 'ノートを閉じますか' })).not.toHaveAttribute('open');
  });

  it('変更を保存して閉じる', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存前'));
    const { onClose } = renderNote();

    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: '保存後' } });
    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));
    fireEvent.click(screen.getByRole('button', { name: '保存して閉じる' }));

    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBe(JSON.stringify('保存後'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('明示保存しても閉じず、その時点を保存済みにする', () => {
    const { onClose } = renderNote();
    const save = screen.getByRole('button', { name: 'ノートを保存' });

    expect(save).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: '保存後も開く' } });
    expect(save).toBeEnabled();
    fireEvent.click(save);

    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBe(JSON.stringify('保存後も開く'));
    expect(onClose).not.toHaveBeenCalled();
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('保存せず閉じると保存済み内容を変えない', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存済み'));
    const { onClose } = renderNote();

    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: '下書き' } });
    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));
    fireEvent.click(screen.getByRole('button', { name: '保存せず閉じる' }));

    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBe(JSON.stringify('保存済み'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('保存に失敗した場合はノートを閉じない', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('利用不可', 'SecurityError');
    });
    const { onClose } = renderNote();

    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: '失わない内容' } });
    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));
    fireEvent.click(screen.getByRole('button', { name: '保存して閉じる' }));

    expect(setItem).toHaveBeenCalledWith(NOTE_STORAGE_KEY, JSON.stringify('失わない内容'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'ノート本文' })).toHaveValue('失わない内容');
  });

  it('未保存の現在内容をコピーし、最小化できる', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { onModeChange } = renderNote();

    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: 'コピー対象' } });
    fireEvent.click(screen.getByRole('button', { name: 'ノートをコピー' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('コピー対象'));

    fireEvent.click(screen.getByRole('button', { name: 'ノートを最小化' }));
    expect(onModeChange).toHaveBeenCalledWith('minimized');
  });

  it('上限を超えても書けるが、超えている間は保存できない', () => {
    const { onClose } = renderNote();
    const textarea = screen.getByRole('textbox', { name: 'ノート本文' });
    const over = 'a'.repeat(NOTE_MAX_LENGTH + 3);

    fireEvent.change(textarea, { target: { value: over } });

    // 入力は切り詰めない
    expect(textarea).toHaveValue(over);
    expect(screen.getByText(`${NOTE_MAX_LENGTH}文字を超えています。3文字減らすと保存できます。`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ノートを保存' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'ノートを閉じる' }));
    expect(screen.getByRole('button', { name: '保存して閉じる' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '戻る' }));
    fireEvent.change(textarea, { target: { value: 'a'.repeat(NOTE_MAX_LENGTH) } });

    expect(screen.getByRole('button', { name: 'ノートを保存' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'ノートを保存' }));
    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBe(JSON.stringify('a'.repeat(NOTE_MAX_LENGTH)));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('破棄は確認してから、下書きと保存済み内容の両方を消す', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存済み'));
    const { onClose } = renderNote();
    const textarea = screen.getByRole('textbox', { name: 'ノート本文' });

    fireEvent.change(textarea, { target: { value: '下書き' } });
    fireEvent.click(screen.getByRole('button', { name: 'ノートを破棄' }));
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }));

    expect(textarea).toHaveValue('下書き');
    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBe(JSON.stringify('保存済み'));

    fireEvent.click(screen.getByRole('button', { name: 'ノートを破棄' }));
    fireEvent.click(screen.getByRole('button', { name: '破棄する' }));

    expect(textarea).toHaveValue('');
    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBeNull();
    // 破棄はノートを閉じない
    expect(onClose).not.toHaveBeenCalled();
  });

  it('消すものがない間は破棄を押せない', () => {
    renderNote();
    const discard = screen.getByRole('button', { name: 'ノートを破棄' });

    expect(discard).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'ノート本文' }), { target: { value: '下書き' } });
    expect(discard).toBeEnabled();
  });

  it('リサイズつまみを矢印キーで操作できる', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const { width, height } = this === document.body ? { width: 800, height: 600 } : { width: 360, height: 420 };
      return new DOMRect(0, 0, width, height);
    });
    renderNote();
    const handle = screen.getByRole('button', { name: 'ノートの大きさを変更。矢印キーで調整できます' });
    const note = handle.closest('.note-panel');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(note?.getAttribute('style')).toContain('width: 368px');
    expect(note?.getAttribute('style')).toContain('height: 420px');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });

    expect(note?.getAttribute('style')).toContain('width: 368px');
    expect(note?.getAttribute('style')).toContain('height: 428px');
  });
});
