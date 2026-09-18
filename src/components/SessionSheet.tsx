import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { SessionControls } from '~/features/SessionPlan';
import { Action } from './Action';
import { ModalSurface } from './ModalSurface';
import { Notices } from './Notices';

/** タッチ向けの編集面。PCの編集はポモドーロ画面内で行う。 */
export const SessionSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const titleId = useId();
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const pointer = window.matchMedia('(pointer: coarse)');
    const sync = () => {
      if (!pointer.matches) close.current();
    };
    pointer.addEventListener('change', sync);
    return () => pointer.removeEventListener('change', sync);
  }, []);

  return (
    <ModalSurface open={open} onClose={onClose} labelledBy={titleId} className="session-sheet">
      <div className="session-sheet-content">
        <header className="session-sheet-heading">
          <h2 id={titleId} className="m-0 text-[length:var(--text-title)] font-semibold">
            セッションの構成
          </h2>
          <Action aria-label="セッションの構成を閉じる" autoFocus onClick={onClose}>
            <X size={16} />
          </Action>
        </header>
        <Notices active={open} />
        <div className="session-sheet-body">
          <SessionControls />
        </div>
      </div>
    </ModalSurface>
  );
};
