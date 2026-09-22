import { Copy, Grip, Minus, Save, StickyNote, Trash2, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { clampToFrame, type Point, type Size } from '~/lib/geometry';
import { clearNote, NOTE_MAX_LENGTH, NOTE_STORAGE_KEY, noteOverflow, readNote } from '~/lib/note';
import { writeJson } from '~/lib/storage';
import { useNotices } from '~/store/notices-context';
import { Action } from './Action';
import { ConfirmSurface } from './ConfirmSurface';
import { NoteCloseConfirm } from './NoteCloseConfirm';

const KEY_STEP = 8;
const KEY_STEP_LARGE = 24;
const EDGE_GAP = 12;
const DRAG_THRESHOLD = 3;
const MIN_WIDTH = 325;
const MIN_HEIGHT = 220;
const OVERFLOW_MESSAGE_ID = 'temporary-note-overflow';

export type NoteMode = 'open' | 'minimized';

type Props = {
  mode: NoteMode;
  bounds: RefObject<HTMLElement | null>;
  onModeChange: (mode: NoteMode) => void;
  onClose: () => void;
};

export const NotePanel = ({ mode, bounds, onModeChange, onClose }: Props) => {
  const { notify } = useNotices();
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [savedText, setSavedText] = useState(readNote);
  const [draft, setDraft] = useState(savedText);
  const [position, setPosition] = useState<Point | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [animating, setAnimating] = useState(false);
  const grab = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const suppressRestore = useRef(false);
  // 最小化の起点を右上に保つため、展開中の大きさと直前の状態を覚えておく
  const openSize = useRef<Size | null>(null);
  const lastMode = useRef(mode);
  const morph = useRef<Animation | null>(null);
  // 切替の動きから参照する現在位置。再描画のたびに購読を張り直さないため
  const currentPosition = useRef(position);
  const positioned = position !== null;
  const dirty = draft !== savedText;
  // 上限を超えた本文は書ける。保存だけを止め、超えている事実をその場に出す
  const overflow = noteOverflow(draft);

  const clamp = (next: Point) =>
    clampToFrame(next, bounds.current?.getBoundingClientRect(), panel.current?.getBoundingClientRect());

  const clampSize = (next: Size): Size => {
    const frame = bounds.current?.getBoundingClientRect();
    if (!frame || !position) return next;
    const maxWidth = Math.max(0, frame.width - position.x);
    const maxHeight = Math.max(0, frame.height - position.y);
    return {
      width: Math.min(maxWidth, Math.max(Math.min(MIN_WIDTH, maxWidth), next.width)),
      height: Math.min(maxHeight, Math.max(Math.min(MIN_HEIGHT, maxHeight), next.height)),
    };
  };

  useEffect(() => {
    trigger.current = document.activeElement as HTMLElement | null;
    return () => {
      if (trigger.current?.isConnected) trigger.current.focus();
    };
  }, []);

  useEffect(() => {
    const container = bounds.current;
    const element = panel.current;
    if (position || !container || !element) return;
    const frame = container.getBoundingClientRect();
    const self = element.getBoundingClientRect();
    setPosition(
      clampToFrame(
        {
          x: Math.max(EDGE_GAP, (frame.width - self.width) / 2),
          y: Math.max(EDGE_GAP, (frame.height - self.height) / 2),
        },
        frame,
        self,
      ),
    );
  }, [bounds, position]);

  // 展開中の大きさを覚える。最小化してからでは測れないため、落ち着いている間だけ更新する
  useEffect(() => {
    if (mode !== 'open' || animating) return;
    const rect = panel.current?.getBoundingClientRect();
    if (rect) openSize.current = { width: rect.width, height: rect.height };
  });

  useLayoutEffect(() => {
    currentPosition.current = position;
  }, [position]);

  /**
   * hig: motion.note-minimize。最小化と復元は、位置と寸法を先に確定させ、見た目だけを動かす。
   * 縮む先は操作のある右上に置く。右端と上端が動かない変換になるため、起点もそこへ揃う。
   * 寸法を動かすと中身が組み直されてちらつくため、動かすのは transform だけにする。
   */
  useLayoutEffect(() => {
    if (lastMode.current === mode) return;
    lastMode.current = mode;
    const element = panel.current;
    const start = currentPosition.current;
    if (!element || !start) return;

    const style = window.getComputedStyle(element);
    const side = Number.parseFloat(style.getPropertyValue('--size-hit'));
    const minimized = Number.isFinite(side) ? { width: side, height: side } : null;
    const from = mode === 'minimized' ? openSize.current : minimized;
    const to = mode === 'minimized' ? minimized : openSize.current;
    if (!from || !to) return;

    const next = clampToFrame(
      { x: start.x + from.width - to.width, y: start.y },
      bounds.current?.getBoundingClientRect(),
      to,
    );
    setPosition(next);

    const duration = Number.parseFloat(style.getPropertyValue('--motion-surface'));
    if (!duration || typeof element.animate !== 'function') return;

    setAnimating(true);
    // 左上を動かない点として、直前の矩形から現在の矩形へ重ねる
    const animation = element.animate(
      [
        {
          transformOrigin: 'top left',
          transform: `translate(${start.x - next.x}px, ${start.y - next.y}px) scale(${from.width / to.width}, ${from.height / to.height})`,
        },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration, easing: style.getPropertyValue('--ease-out').trim() },
    );
    morph.current = animation;
    const settle = () => {
      setAnimating(false);
      morph.current = null;
    };
    animation.onfinish = settle;
    animation.oncancel = settle;
    return () => {
      // 続けて切り替えた場合は、次の動きが状態を持つ
      animation.oncancel = null;
      animation.cancel();
    };
  }, [mode, bounds]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => panel.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  useEffect(() => {
    const container = bounds.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      const boundsRect = container.getBoundingClientRect();
      setSize((current) =>
        current
          ? {
              width: Math.min(current.width, boundsRect.width),
              height: Math.min(current.height, boundsRect.height),
            }
          : current,
      );
      frame = window.requestAnimationFrame(() => {
        setPosition((current) =>
          current ? clampToFrame(current, boundsRect, panel.current?.getBoundingClientRect()) : current,
        );
      });
    });
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [bounds]);

  const requestClose = () => {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  const save = () => {
    const result = writeJson(NOTE_STORAGE_KEY, draft);
    if (!result.ok) {
      notify(
        'error',
        result.reason === 'quota'
          ? 'ノートを保存できませんでした。保存領域がいっぱいです。'
          : 'ノートを保存できませんでした。この環境では内容を保持できません。',
      );
      return false;
    }
    setSavedText(draft);
    notify('info', 'ノートを保存しました。');
    return true;
  };

  const saveAndClose = () => {
    if (!save()) {
      setConfirmClose(false);
      return;
    }
    setConfirmClose(false);
    onClose();
  };

  const discard = () => {
    clearNote();
    setDraft('');
    setSavedText('');
    setConfirmDiscard(false);
    notify('info', 'ノートを破棄しました。');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      notify('info', 'ノートをコピーしました。');
    } catch {
      notify('error', 'ノートをコピーできませんでした。ブラウザの許可を確認してください。');
    }
  };

  const isControl = (target: EventTarget | null) =>
    (target as Element | null)?.closest('button, input, select, textarea, label, .notices') != null;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!position || event.button !== 0 || isControl(event.target)) return;
    // つかんだ位置から動かす。切替の動きが残っていると指と面がずれる
    morph.current?.cancel();
    setDragging(true);
    suppressRestore.current = false;
    grab.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    if (
      Math.abs(event.clientX - grab.current.startX) > DRAG_THRESHOLD ||
      Math.abs(event.clientY - grab.current.startY) > DRAG_THRESHOLD
    ) {
      suppressRestore.current = true;
    }
    setPosition(clamp({ x: event.clientX - grab.current.x, y: event.clientY - grab.current.y }));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!position || event.button !== 0 || !panel.current) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = panel.current.getBoundingClientRect();
    resizeStart.current = { x: event.clientX, y: event.clientY, width: rect.width, height: rect.height };
    setSize({ width: rect.width, height: rect.height });
    setResizing(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizing) return;
    event.preventDefault();
    event.stopPropagation();
    setSize(
      clampSize({
        width: resizeStart.current.width + event.clientX - resizeStart.current.x,
        height: resizeStart.current.height + event.clientY - resizeStart.current.y,
      }),
    );
  };

  const onResizePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizing) return;
    event.preventDefault();
    event.stopPropagation();
    setResizing(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onResizeKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = size ?? panel.current?.getBoundingClientRect();
    if (!current) return;
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const changes: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    const change = changes[event.key];
    if (!change) return;
    event.preventDefault();
    event.stopPropagation();
    setSize(clampSize({ width: current.width + change[0], height: current.height + change[1] }));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && mode === 'open') {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
      return;
    }
    if (event.target !== event.currentTarget) return;
    if (mode === 'minimized' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onModeChange('open');
      return;
    }
    if (!position) return;
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    event.stopPropagation();
    setPosition(clamp({ x: position.x + move[0], y: position.y + move[1] }));
  };

  return (
    <>
      <section
        ref={panel}
        tabIndex={0}
        role={mode === 'minimized' ? 'button' : 'region'}
        aria-label={
          mode === 'minimized'
            ? 'ノートを復元。ドラッグまたは矢印キーで移動できます'
            : 'ノート。余白をドラッグするか、面にフォーカスして矢印キーで移動できます'
        }
        data-minimized={mode === 'minimized' || undefined}
        data-animated={animating || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onClick={() => {
          if (mode !== 'minimized') return;
          if (suppressRestore.current) {
            suppressRestore.current = false;
            return;
          }
          onModeChange('open');
        }}
        className="note-panel absolute overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] text-[length:var(--text-body)]"
        style={{
          zIndex: 'calc(var(--z-overlay) + 2)',
          left: position?.x ?? 0,
          top: position?.y ?? 0,
          visibility: positioned ? 'visible' : 'hidden',
          cursor: dragging ? 'grabbing' : mode === 'minimized' ? 'pointer' : 'grab',
          touchAction: 'pan-y',
          ...(mode === 'open' && size ? { width: size.width, height: size.height } : {}),
        }}
      >
        {mode === 'minimized' ? (
          <StickyNote aria-hidden="true" />
        ) : (
          <div className="note-content flex h-full min-h-0 flex-col gap-[var(--spacing-stack)]">
            <header className="flex shrink-0 items-center gap-[var(--spacing-inline)]">
              <h2 className="m-0 text-[length:var(--text-body)] font-semibold">ノート</h2>
              <span
                className="tabular ml-auto text-[length:var(--text-label)]"
                style={{ color: overflow ? 'var(--color-status-error)' : 'var(--color-fg-secondary)' }}
              >
                {draft.length}/{NOTE_MAX_LENGTH}
              </span>
              <Action aria-label="ノートを保存" tip="保存" disabled={!dirty || overflow > 0} onClick={save}>
                <Save />
              </Action>
              <Action aria-label="ノートをコピー" tip="全文をコピー" disabled={!draft} onClick={() => void copy()}>
                <Copy />
              </Action>
              <Action
                aria-label="ノートを破棄"
                tip="破棄"
                disabled={!draft && !savedText}
                onClick={() => setConfirmDiscard(true)}
              >
                <Trash2 />
              </Action>
              <Action aria-label="ノートを最小化" tip="最小化" onClick={() => onModeChange('minimized')}>
                <Minus />
              </Action>
              <Action aria-label="ノートを閉じる" tip="閉じる" onClick={requestClose}>
                <X />
              </Action>
            </header>
            <label className="sr-only" htmlFor="temporary-note">
              ノート本文
            </label>
            <textarea
              id="temporary-note"
              value={draft}
              placeholder="メモを入力"
              aria-invalid={overflow > 0 || undefined}
              aria-describedby={overflow ? OVERFLOW_MESSAGE_ID : undefined}
              onChange={(event) => setDraft(event.target.value)}
              className="note-textarea min-h-0 flex-1 resize-none rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-[var(--spacing-stack)] text-[length:var(--text-body)] text-[var(--color-fg-primary)]"
            />
            {/* hig: feedback.user-caused-immediate。超えている事実と、保存するために何をすればよいかを並べる */}
            {overflow ? (
              <p
                id={OVERFLOW_MESSAGE_ID}
                className="m-0 shrink-0 text-[length:var(--text-label)]"
                style={{ color: 'var(--color-status-error)' }}
              >
                {NOTE_MAX_LENGTH}文字を超えています。{overflow}文字減らすと保存できます。
              </p>
            ) : null}
            <button
              type="button"
              aria-label="ノートの大きさを変更。矢印キーで調整できます"
              onPointerDown={onResizePointerDown}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
              onPointerCancel={onResizePointerUp}
              onKeyDown={onResizeKeyDown}
              className="note-resize-handle"
            >
              <Grip aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <NoteCloseConfirm
        open={confirmClose}
        overflow={overflow}
        onCancel={() => setConfirmClose(false)}
        onDiscard={() => {
          setConfirmClose(false);
          onClose();
        }}
        onSave={saveAndClose}
      />

      <ConfirmSurface
        open={confirmDiscard}
        title="ノートを破棄しますか"
        description="保存済みの内容も消えます。元に戻せません。"
        confirmLabel="破棄する"
        danger
        onConfirm={discard}
        onClose={() => setConfirmDiscard(false)}
      />
    </>
  );
};
