import { Maximize, Minimize, PictureInPicture2, StickyNote } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClockScreen } from '~/features/ClockScreen';
import { PomodoroScreen } from '~/features/PomodoroScreen';
import { TimerScreen } from '~/features/TimerScreen';
import { isPipSupported } from '~/lib/pip';
import { getScrimAppearance } from '~/lib/scrim';
import { useBackground } from '~/store/background-context';
import { useNotices } from '~/store/notices-context';
import { useSettings } from '~/store/settings-context';
import { useTimers } from '~/store/timers-context';
import { Action } from './Action';
import { AdjustPanel } from './AdjustPanel';
import type { AdjustVariant } from './adjust-variants';
import { GearStack } from './GearStack';
import { PipSurface, type PipHandle } from './PipSurface';
import { Attribution } from './Attribution';
import { Notices } from './Notices';
import { NotePanel, type NoteMode } from './NotePanel';
import { RunningIndicator } from './RunningIndicator';
import { ScreenControls } from './ScreenControls';
import { SessionSheet } from './SessionSheet';
import { SettingsDrawer } from './SettingsDrawer';

export type ViewId = 'clock' | 'pomodoro' | 'timer';

/** 掴んでの移動を確定させる距離。面の幅の割合と実寸の小さいほうを使う */
const SWIPE_THRESHOLD_PX = 64;
const SWIPE_THRESHOLD_RATIO = 0.08;

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'clock', label: '時計' },
  { id: 'pomodoro', label: 'ポモドーロ' },
  { id: 'timer', label: 'タイマー' },
];

const preferredScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export const Shell = () => {
  const { settings } = useSettings();
  const { imageUrl } = useBackground();
  const { notify } = useNotices();
  const { phase } = useTimers();

  const [view, setView] = useState<ViewId>('clock');
  /**
   * hig: disclosure.settings-exclusive
   * 設定と調整モードは同時に開かない。状態を1つにして矛盾を作らせない。
   */
  const [overlay, setOverlay] = useState<'none' | 'settings' | 'adjust' | 'session'>('none');
  const [noteMode, setNoteMode] = useState<NoteMode | 'closed'>('closed');
  const [adjustVariant, setAdjustVariant] = useState<AdjustVariant>('compact');
  const settingsOpen = overlay === 'settings';
  const adjustOpen = overlay === 'adjust';
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const [tick, setTick] = useState(() => Date.now());
  const scroller = useRef<HTMLDivElement>(null);
  const viewTabs = useRef<HTMLElement>(null);
  const frame = useRef<HTMLElement>(null);
  const pip = useRef<PipHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const pipSupported = isPipSupported();

  const openOverlay = (next: Exclude<typeof overlay, 'none'>) => {
    setNoteMode((current) => (current === 'open' ? 'minimized' : current));
    setOverlay(next);
  };

  const wake = useCallback(() => setLastActivity(Date.now()), []);

  /**
   * hig: gesture.view-swipe
   * タッチはブラウザのスクロールに任せる。ポインタ操作ではスクロールが起きないため、
   * 掴んで左右に動かせるようにここで補う。
   */
  const [grabbing, setGrabbing] = useState(false);
  const grab = useRef<{
    pointerId: number;
    startX: number;
    startLeft: number;
    startIndex: number;
  } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    if (event.button !== 0) return;
    // 操作要素の上では掴まない
    if ((event.target as Element).closest('button, a, input, select, label, [role="slider"]')) return;
    const element = scroller.current;
    if (!element) return;
    grab.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: element.scrollLeft,
      startIndex: Math.round(element.scrollLeft / element.clientWidth),
    };
    setGrabbing(true);
    element.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = grab.current;
    const element = scroller.current;
    if (!state || !element || state.pointerId !== event.pointerId) return;
    element.scrollLeft = state.startLeft - (event.clientX - state.startX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = grab.current;
    const element = scroller.current;
    if (!state || !element || state.pointerId !== event.pointerId) return;
    grab.current = null;
    setGrabbing(false);
    element.releasePointerCapture(event.pointerId);

    /**
     * 画面の半分まで動かさないと切り替わらないのは遠い。
     * 少し動かした時点で意図が読めるため、面の幅に対する小さな割合で判定する。
     */
    const moved = event.clientX - state.startX;
    const threshold = Math.min(SWIPE_THRESHOLD_PX, element.clientWidth * SWIPE_THRESHOLD_RATIO);
    const step = Math.abs(moved) >= threshold ? -Math.sign(moved) : 0;
    const index = Math.min(VIEWS.length - 1, Math.max(0, state.startIndex + step));
    element.scrollTo({ left: index * element.clientWidth, behavior: preferredScrollBehavior() });
  };

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  // 外部操作で全画面が解除された場合も、表示を実際の状態に一致させる
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  // hig: disclosure.auto-hide。設定を開いている間は働かせない
  // 調整モード中に操作UIが消えると調整できなくなるため、そのあいだは働かせない
  // 0 は隠さない設定。時間の経過で状態を変えない
  const idle =
    settings.autoHideSeconds > 0 &&
    tick - lastActivity > settings.autoHideSeconds * 1000 &&
    overlay === 'none' &&
    noteMode !== 'open';

  const goTo = useCallback((id: ViewId) => {
    const index = VIEWS.findIndex((v) => v.id === id);
    const element = scroller.current;
    if (element) element.scrollTo({ left: index * element.clientWidth, behavior: preferredScrollBehavior() });
    setView(id);
  }, []);

  // hig: keyboard.view-move
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      wake();
      if (overlay !== 'none' || noteMode === 'open' || event.defaultPrevented) return;
      const index = VIEWS.findIndex((v) => v.id === view);
      if (event.key === 'ArrowRight' && index < VIEWS.length - 1) goTo(VIEWS[index + 1].id);
      if (event.key === 'ArrowLeft' && index > 0) goTo(VIEWS[index - 1].id);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
    };
  }, [view, overlay, noteMode, goTo, wake]);

  /**
   * hig: gesture.view-swipe
   * スワイプはスクロールとスナップに委ねる。現在地はスクロール位置から求める。
   * スナップの通知に頼ると、掴んで動かす間だけスナップを外している関係で通知が出ず、
   * 現在地が取り残される。位置から求めれば、掴む・スワイプ・キー操作のどれでも一致する。
   */
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const tabs = viewTabs.current;
    const centerExpansion = tabs ? Number.parseFloat(getComputedStyle(tabs).getPropertyValue('--spacing-tight')) : 0;

    let frame = 0;
    const sync = () => {
      frame = 0;
      if (!element.clientWidth) return;
      const progress = Math.min(VIEWS.length - 1, Math.max(0, element.scrollLeft / element.clientWidth));
      const center = (VIEWS.length - 1) / 2;
      const expansion = centerExpansion * Math.max(0, 1 - Math.abs(progress - center));
      const start = (progress / VIEWS.length) * 100;
      const end = ((VIEWS.length - 1 - progress) / VIEWS.length) * 100;
      tabs?.style.setProperty('--view-tab-start', `calc(${start}% - ${expansion}px)`);
      tabs?.style.setProperty('--view-tab-end', `calc(${end}% - ${expansion}px)`);
      const index = Math.round(progress);
      setView(VIEWS[index].id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    sync();
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // 画像がまだ無い間も破綻しないよう、単色へ退避する
  const background =
    settings.background === 'solid'
      ? settings.solidColor
      : settings.background === 'black'
        ? '#000000'
        : imageUrl
          ? `url(${JSON.stringify(imageUrl)}) center / cover no-repeat`
          : '#12161b';
  const scrim = getScrimAppearance(settings.scrimRange, settings.scrimAmount);

  return (
    <section
      ref={frame}
      data-theme={settings.theme}
      data-legibility={settings.legibility}
      data-idle={idle}
      className="relative h-full w-full overflow-hidden"
      style={{
        containerType: 'size',
        background,
        ['--scrim-inset-inline' as string]: `-${scrim.insetInlinePercent}%`,
        ['--scrim-inset-block' as string]: `-${scrim.insetBlockPercent}%`,
        ['--scrim-dark-opacity' as string]: scrim.darkOpacity,
        ['--scrim-light-opacity' as string]: scrim.lightOpacity,
      }}
      onFocus={wake}
    >
      <div
        ref={scroller}
        // 掴んで動かす面なので、テキスト選択の対象にしない
        className="grid h-full w-full [scrollbar-width:none] grid-flow-col overflow-x-auto overflow-y-hidden select-none"
        style={{
          // 文字色は時計の表示だけに効かせる。設定や調整パネルの文字は token のままにする
          ...(settings.textColor ? { ['--color-fg-primary' as string]: settings.textColor } : {}),
          gridAutoColumns: '100%',
          // 掴んでいる間はスナップを外し、離してから最も近い画面へ寄せる
          scrollSnapType: grabbing ? 'none' : 'x mandatory',
          overscrollBehavior: 'none',
          touchAction: 'pan-x',
          cursor: idle ? 'none' : grabbing ? 'grabbing' : 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div data-view="clock" style={{ scrollSnapAlign: 'start' }}>
          <ClockScreen />
        </div>
        <div data-view="pomodoro" style={{ scrollSnapAlign: 'start' }}>
          <PomodoroScreen />
        </div>
        <div data-view="timer" style={{ scrollSnapAlign: 'start' }}>
          <TimerScreen />
        </div>
      </div>

      {/* 自動非表示は .auto-hide に任せる。ホバー中は消さず、消えている間は押せない */}
      <div className="auto-hide pointer-events-none absolute inset-0" style={{ zIndex: 'var(--z-controls)' }}>
        <nav
          ref={viewTabs}
          aria-label="画面"
          role="tablist"
          className="view-tabs control-capsule pointer-events-auto absolute top-[var(--spacing-edge)] left-1/2 max-w-[calc(100cqi-var(--spacing-edge)*2)] -translate-x-1/2"
        >
          <span aria-hidden="true" className="view-tab-indicator" />
          {VIEWS.map((item) => (
            <Action
              key={item.id}
              shape="viewTab"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => goTo(item.id)}
              className="text-[length:var(--text-body)]"
            >
              {item.label}
            </Action>
          ))}
        </nav>
        <ScreenControls view={view} onOpenSession={() => openOverlay('session')} />

        <div className="global-controls control-capsule pointer-events-auto absolute flex items-center gap-[var(--spacing-action)]">
          <Action
            aria-label={
              noteMode === 'closed' ? 'ノートを開く' : noteMode === 'open' ? 'ノートを最小化' : 'ノートを復元'
            }
            aria-pressed={noteMode !== 'closed'}
            tip={noteMode === 'closed' ? 'ノートを開く' : noteMode === 'open' ? 'ノートを最小化' : 'ノートを復元'}
            onClick={() => {
              if (overlay === 'adjust') setOverlay('none');
              setNoteMode((current) => (current === 'open' ? 'minimized' : 'open'));
            }}
          >
            <StickyNote size={16} />
          </Action>
          {pipSupported ? (
            <Action
              aria-label="Picture in Picture"
              tip="小さな別ウィンドウに表示する"
              onClick={() => void pip.current?.toggle()}
            >
              <PictureInPicture2 size={16} />
            </Action>
          ) : null}
          <Action
            aria-label={fullscreen ? '全画面表示を終了' : '全画面表示'}
            tip={fullscreen ? '全画面表示を終了' : '全画面で表示する'}
            onClick={() => {
              if (document.fullscreenElement) {
                void document.exitFullscreen();
              } else {
                void document.documentElement.requestFullscreen().catch(() => {
                  notify('error', 'この環境では全画面表示にできませんでした。');
                });
              }
            }}
          >
            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </Action>
          <GearStack
            onOpenSettings={() => openOverlay('settings')}
            onEnterAdjust={(variant) => {
              setAdjustVariant(variant);
              openOverlay('adjust');
            }}
          />
        </div>
      </div>

      {pipSupported ? (
        <PipSurface
          view={view}
          themeRef={frame}
          handle={pip}
          onUnsupported={() => notify('error', 'この環境では Picture in Picture を利用できません。')}
          onError={() => notify('error', 'Picture in Picture を開始できませんでした。')}
        />
      ) : null}

      <RunningIndicator view={view} onSelect={goTo} />

      {/* 通知は画面上部の中央。モーダルの面を開いている間は、その面の中から同じ位置に出す */}
      <Notices active={overlay === 'none' || overlay === 'adjust'} />

      <div
        className="pointer-events-none absolute bottom-[var(--spacing-edge)] left-[var(--spacing-edge)]"
        style={{ zIndex: 'var(--z-notice)' }}
      >
        <Attribution />
      </div>
      <SessionSheet open={overlay === 'session'} onClose={() => setOverlay('none')} />

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setOverlay('none')}
        onEnterAdjust={(variant) => {
          setAdjustVariant(variant);
          openOverlay('adjust');
        }}
      />
      {adjustOpen ? (
        // 種類が変わると大きさが変わるため、作り直して位置を取り直す
        <AdjustPanel
          key={adjustVariant}
          variant={adjustVariant}
          bounds={frame}
          onSwitch={setAdjustVariant}
          onExit={() => setOverlay('none')}
        />
      ) : null}
      {noteMode !== 'closed' ? (
        <NotePanel mode={noteMode} bounds={frame} onModeChange={setNoteMode} onClose={() => setNoteMode('closed')} />
      ) : null}
      <span className="sr-only" aria-live="polite">
        {phase}
      </span>
    </section>
  );
};
