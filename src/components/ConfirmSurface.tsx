import { useId } from 'react';
import { Action } from './Action';
import { ModalSurface } from './ModalSurface';

type Props = {
  open: boolean;
  title: string;
  description: string;
  /** 実行する操作の名前。何が起きるか分かる語にする */
  confirmLabel: string;
  /** 取り返しのつかない操作か。実行側にだけ状態色を使う */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * 取り返しのつかない操作にだけ挟む確認。
 * hig: feedback.autosave の「変更前の確認を出さない」の例外であり、元の値へ戻せない操作に限る。
 * 実行と取りやめは同じ体裁で並べ、取りやめに初期のフォーカスを置く。
 * 色だけは分ける。取り返しがつかないことを、押す前に読み取れるようにするため。
 */
export const ConfirmSurface = ({ open, title, description, confirmLabel, danger, onConfirm, onClose }: Props) => {
  const titleId = useId();

  return (
    <ModalSurface open={open} onClose={onClose} labelledBy={titleId} className="confirm-sheet">
      <div className="confirm-sheet-content">
        <h2 id={titleId} className="m-0 text-[length:var(--text-body)] font-semibold">
          {title}
        </h2>
        <p className="m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">{description}</p>
        <div className="flex justify-end gap-[var(--spacing-inline)]">
          <Action shape="boxed" autoFocus onClick={onClose}>
            やめる
          </Action>
          <Action shape="boxed" tone={danger ? 'danger' : 'neutral'} onClick={onConfirm}>
            {confirmLabel}
          </Action>
        </div>
      </div>
    </ModalSurface>
  );
};
