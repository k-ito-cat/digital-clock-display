import { cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { flushSync } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, SettingsContext } from '~/store/settings-context';
import { NoticeProvider } from '~/store/notices';
import { AdjustPanel } from './AdjustPanel';

afterEach(cleanup);

describe('AdjustPanel', () => {
  it('Escで親が再描画されても、その一回のキー入力で閉じる', () => {
    const bounds = createRef<HTMLElement>();
    const firstExit = vi.fn(),
      latestExit = vi.fn();
    const content = (onExit: () => void) => (
      <SettingsContext.Provider value={{ settings: DEFAULT_SETTINGS, update: vi.fn(), savedAt: null }}>
        <NoticeProvider>
          <section ref={bounds}>
            <AdjustPanel variant="compact" bounds={bounds} onSwitch={vi.fn()} onExit={onExit} />
          </section>
        </NoticeProvider>
      </SettingsContext.Provider>
    );
    let rerender: (node: React.ReactNode) => void;
    // Shellの操作復帰が先に再描画し、onExitの参照が変わる状況を再現する。
    const wake = () => flushSync(() => rerender(content(latestExit)));
    window.addEventListener('keydown', wake);
    try {
      ({ rerender } = render(content(firstExit)));
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(latestExit).toHaveBeenCalledOnce();
      expect(firstExit).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('keydown', wake);
    }
  });

  it('パネルの外を押したら閉じ、中を押しても閉じない', () => {
    const bounds = createRef<HTMLElement>();
    const onExit = vi.fn();
    const { getByRole } = render(
      <SettingsContext.Provider value={{ settings: DEFAULT_SETTINGS, update: vi.fn(), savedAt: null }}>
        <NoticeProvider>
          <section ref={bounds}>
            <AdjustPanel variant="compact" bounds={bounds} onSwitch={vi.fn()} onExit={onExit} />
          </section>
        </NoticeProvider>
      </SettingsContext.Provider>,
    );

    fireEvent.pointerDown(getByRole('region'));
    expect(onExit).not.toHaveBeenCalled();

    fireEvent.pointerDown(document.body);
    expect(onExit).toHaveBeenCalledOnce();
  });
});
