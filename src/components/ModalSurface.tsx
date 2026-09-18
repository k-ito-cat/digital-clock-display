import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onClosed?: () => void;
  labelledBy: string;
  className: string;
  children: ReactNode;
};

/** 開閉中も背景の不活性化とフォーカス復帰をネイティブの dialog に任せる。 */
export const ModalSurface = ({ open, onClose, onClosed, labelledBy, className, children }: Props) => {
  const surface = useRef<HTMLDialogElement>(null);
  const afterClose = useRef(onClosed);
  const backdropPressed = useRef(false);
  useEffect(() => {
    afterClose.current = onClosed;
  }, [onClosed]);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!element.open) return;

    const finish = () => {
      if (!open) {
        element.close();
        afterClose.current?.();
      }
    };
    const style = getComputedStyle(element);
    const duration = Number.parseFloat(style.getPropertyValue('--motion-surface'));
    if (!duration) {
      finish();
      return;
    }

    const hidden = { opacity: 0, transform: style.getPropertyValue('--surface-from').trim() };
    const visible = { opacity: 1, transform: 'translate(0, 0)' };
    const animation = element.animate(open ? [hidden, visible] : [visible, hidden], {
      duration,
      easing: style.getPropertyValue('--ease-out').trim(),
      fill: 'both',
    });
    animation.onfinish = () => {
      finish();
      animation.cancel();
    };
    return () => animation.cancel();
  }, [open]);

  return (
    <dialog
      ref={surface}
      aria-labelledby={labelledBy}
      className={`modal-surface ${className}`}
      data-closing={!open || undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        backdropPressed.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (backdropPressed.current && event.target === event.currentTarget) onClose();
        backdropPressed.current = false;
      }}
    >
      {children}
    </dialog>
  );
};
