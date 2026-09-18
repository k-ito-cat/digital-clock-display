import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NoticeProvider } from '~/store/notices';
import { useNotices } from '~/store/notices-context';
import { Notices } from './Notices';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** メニューを開いている間は、その面の中から呼ぶ。位置は画面基準のまま変わらない */
const Content = ({ menu }: { menu: boolean }) => {
  const { notify } = useNotices();
  return (
    <>
      <button onClick={() => notify('error', '検証用の通知')}>通知を発生</button>
      <button onClick={() => notify('warn', '検証用の警告')}>警告を発生</button>
      <Notices active={!menu} />
      <section aria-label="検証用メニュー">
        <Notices active={menu} />
      </section>
    </>
  );
};

const trigger = (name: string) => screen.getByRole('button', { name });

describe('Notices', () => {
  it('メニューを開いていても画面基準の枠に出し、フォーカスを奪わない', () => {
    render(
      <NoticeProvider>
        <Content menu />
      </NoticeProvider>,
    );
    const region = screen.getByRole('status', { name: '通知' });
    expect(region.textContent).toBe('');
    expect(region.parentElement?.classList.contains('notices-top')).toBe(true);

    const button = trigger('通知を発生');
    button.focus();
    fireEvent.click(button);

    expect(screen.getByRole('status', { name: '通知' })).toBe(region);
    expect(region.textContent).toBe('検証用の通知');
    expect(document.activeElement).toBe(button);
  });

  it('開閉で呼び出し元だけを切り替え、通知を二重表示しない', () => {
    const content = (menu: boolean) => (
      <NoticeProvider>
        <Content menu={menu} />
      </NoticeProvider>
    );
    const { rerender } = render(content(false));
    fireEvent.click(trigger('通知を発生'));
    for (const menu of [true, false, true]) {
      rerender(content(menu));
      expect(screen.getAllByText('検証用の通知')).toHaveLength(1);
      expect(screen.getAllByRole('status', { name: '通知' })).toHaveLength(1);
      expect(screen.getByRole('status').closest('section') !== null).toBe(menu);
    }
  });

  it('メニューの開閉で通知の有効時間を延長しない', () => {
    vi.useFakeTimers();
    const content = (menu: boolean) => (
      <NoticeProvider>
        <Content menu={menu} />
      </NoticeProvider>
    );
    const { rerender } = render(content(false));
    fireEvent.click(trigger('通知を発生'));
    act(() => vi.advanceTimersByTime(5000));
    rerender(content(true));
    expect(screen.getByText('検証用の通知')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('検証用の通知')).toBeNull();
  });

  it('続けて発生しても積み上げず、最新の1件だけを出す', () => {
    render(
      <NoticeProvider>
        <Content menu={false} />
      </NoticeProvider>,
    );
    const region = screen.getByRole('status', { name: '通知' });

    fireEvent.click(trigger('通知を発生'));
    fireEvent.click(trigger('通知を発生'));
    fireEvent.click(trigger('警告を発生'));

    expect(region.querySelectorAll('p')).toHaveLength(1);
    expect(region.textContent).toBe('検証用の警告');
  });
});
