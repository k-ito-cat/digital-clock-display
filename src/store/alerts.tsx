import { useEffect, useRef, type ReactNode } from 'react';
import { playChime, showNotification } from '~/lib/alert';
import { useSettings } from './settings-context';
import { PHASE_LABEL, useTimers } from './timers-context';

/**
 * 合図を出す場所を1つに集める。
 * requirements.md: 既定は無効。有効化されている時だけ知らせる。
 */
export const AlertWatcher = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const { phase, timer, remaining } = useTimers();

  const lastPhase = useRef(phase);
  const timerWasRunning = useRef(timer.status === 'running');

  useEffect(() => {
    if (phase === lastPhase.current) return;
    const previous = lastPhase.current;
    lastPhase.current = phase;
    // 開始そのものは利用者の操作なので知らせない
    if (previous === 'idle') return;
    if (settings.soundEnabled) playChime();
    if (settings.notifyEnabled) {
      showNotification(
        phase === 'done' ? 'ポモドーロが完了しました' : `${PHASE_LABEL[phase]}に切り替わりました`,
        phase === 'done' ? 'すべてのセットが終わりました。' : '',
      );
    }
  }, [phase, settings.soundEnabled, settings.notifyEnabled]);

  useEffect(() => {
    const running = timer.status === 'running';
    const finished = timerWasRunning.current && !running && remaining(timer) === 0;
    timerWasRunning.current = running;
    if (!finished) return;
    if (settings.soundEnabled) playChime();
    if (settings.notifyEnabled) showNotification('タイマーが終了しました', '');
  }, [timer, remaining, settings.soundEnabled, settings.notifyEnabled]);

  return <>{children}</>;
};
