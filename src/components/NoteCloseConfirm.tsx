import { useId } from 'react';
import { Action } from './Action';
import { ModalSurface } from './ModalSurface';

type Props = {
  open: boolean;
  /** 上限を超えている文字数。0 より大きい間は保存して閉じられない */
  overflow: number;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

/** 未保存の本文を失う時だけ使う、ノート専用の3択確認。 */
export const NoteCloseConfirm = ({ open, overflow, onCancel, onDiscard, onSave }: Props) => {
  const titleId = useId();

  return (
    <ModalSurface open={open} onClose={onCancel} labelledBy={titleId} className="confirm-sheet note-confirm-sheet">
      <div className="confirm-sheet-content">
        <h2 id={titleId} className="m-0 text-[length:var(--text-body)] font-semibold">
          ノートを閉じますか
        </h2>
        <p className="m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">
          {overflow ? '上限を超えているため保存できません。' : '保存していない変更があります。'}
        </p>
        <div className="flex flex-wrap justify-end gap-[var(--spacing-inline)]">
          <Action shape="boxed" autoFocus onClick={onCancel}>
            戻る
          </Action>
          <Action shape="boxed" tone="danger" onClick={onDiscard}>
            保存せず閉じる
          </Action>
          <Action shape="boxed" disabled={overflow > 0} onClick={onSave}>
            保存して閉じる
          </Action>
        </div>
      </div>
    </ModalSurface>
  );
};
