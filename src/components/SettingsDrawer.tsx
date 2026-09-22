import { ImageUp, Maximize2, Minimize2, Moon, RotateCw, Sun, Undo2, Volume2, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { playChime, requestNotifyPermission } from '~/lib/alert';
import { isAutoRefresh } from '~/lib/background';
import { daysUntilGoal, describeGoalGap, GOAL_NAME_MAX_LENGTH, tomorrowDateInputValue } from '~/lib/goal';
import { REFRESH_INTERVALS, UNSPLASH_QUERIES, useBackground } from '~/store/background-context';
import { useNotices } from '~/store/notices-context';
import {
  DEFAULT_SETTINGS,
  describePlacement,
  FACES,
  isDefaultSettings,
  LEGIBILITY_OPTIONS,
  useSettings,
} from '~/store/settings-context';
import { Action } from './Action';
import type { AdjustVariant } from './adjust-variants';
import { AutoHidePreview } from './AutoHidePreview';
import { ClockPreview } from './ClockPreview';
import { ColorPresets } from './ColorPresets';
import { BackgroundStatus } from './BackgroundStatus';
import { ConfirmSurface } from './ConfirmSurface';
import { Field, FieldRow, Zone } from './Field';
import { PositionPad } from './PositionPad';
import { SavedIndicator } from './SavedIndicator';
import { Segmented } from './Segmented';
import { ModalSurface } from './ModalSurface';
import { Notices } from './Notices';

type Props = {
  open: boolean;
  onClose: () => void;
  onEnterAdjust: (variant: AdjustVariant) => void;
};

const SECTIONS = ['表示', '背景', '動作'] as const;
type Section = (typeof SECTIONS)[number];

export const SettingsDrawer = ({ open, onClose, onEnterAdjust }: Props) => {
  const { settings, update } = useSettings();
  const background = useBackground();
  const { notify } = useNotices();
  const [section, setSection] = useState<Section>('表示');
  const [confirmReset, setConfirmReset] = useState(false);
  // 常時表示へ切り替えている間も、戻した時に同じ秒数へ復帰できるよう覚えておく
  const [lastHideSeconds, setLastHideSeconds] = useState(settings.autoHideSeconds || DEFAULT_SETTINGS.autoHideSeconds);
  const alwaysVisible = settings.autoHideSeconds === 0;
  const titleId = useId();
  const sectionId = useId();
  const goalNameId = useId();
  const goalDateId = useId();
  const pendingAdjust = useRef<AdjustVariant | null>(null);
  const goalDays = daysUntilGoal(new Date(), settings.goalDate);
  // 揃っていない間も設定は保存する。出せない理由だけをこの場に残す
  const goalGap = describeGoalGap(settings.goalName, settings.goalDate, new Date());

  const enterAdjust = (variant: AdjustVariant) => {
    pendingAdjust.current = variant;
    onClose();
  };

  return (
    <ModalSurface
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="settings-sheet"
      onClosed={() => {
        const variant = pendingAdjust.current;
        pendingAdjust.current = null;
        if (variant) onEnterAdjust(variant);
      }}
    >
      <div className="settings-content">
        <header className="settings-heading">
          <div className="flex items-center justify-between gap-[var(--spacing-inline)]">
            <div className="flex items-baseline gap-[var(--spacing-inline)]">
              <h2 id={titleId} className="m-0 text-[length:var(--text-title)] font-semibold">
                設定
              </h2>
              <SavedIndicator />
            </div>
            <Action aria-label="設定を閉じる" autoFocus onClick={onClose}>
              <X size={16} />
            </Action>
          </div>

          <div
            role="tablist"
            aria-label="設定の分類"
            className="flex gap-[var(--spacing-tight)]"
            onKeyDown={(event) => {
              const index = SECTIONS.indexOf(section);
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % SECTIONS.length
                  : event.key === 'ArrowLeft'
                    ? (index + SECTIONS.length - 1) % SECTIONS.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? SECTIONS.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              event.stopPropagation();
              setSection(SECTIONS[next]);
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
            }}
          >
            {SECTIONS.map((item) => (
              <Action
                key={item}
                shape="tab"
                role="tab"
                id={`${sectionId}-${item}`}
                aria-controls={`${sectionId}-panel`}
                tabIndex={section === item ? 0 : -1}
                aria-selected={section === item}
                onClick={() => setSection(item)}
                className="text-[length:var(--text-body)]"
              >
                {item}
              </Action>
            ))}
          </div>
        </header>
        <Notices active={open} />
        <div
          key={section}
          id={`${sectionId}-panel`}
          role="tabpanel"
          aria-labelledby={`${sectionId}-${section}`}
          className="settings-body"
        >
          {section === '表示' ? (
            <>
              <Zone title="テーマと時刻" divided={false}>
                <FieldRow>
                  <div className="flex items-center justify-between gap-[var(--spacing-stack)]">
                    <span id="theme-label">ダークモード</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.theme === 'dark'}
                      aria-labelledby="theme-label"
                      onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                      className="relative h-[22px] w-[40px] shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
                    >
                      <span
                        className="absolute top-[2px] grid h-[16px] w-[16px] place-items-center rounded-[var(--radius-marker)] bg-[var(--color-fg-primary)] text-[var(--color-surface-overlay)] transition-[left] duration-[var(--motion-state)] ease-[var(--ease-out)]"
                        style={{ left: settings.theme === 'dark' ? '20px' : '2px' }}
                      >
                        {settings.theme === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
                      </span>
                    </button>
                  </div>
                </FieldRow>

                <Field label="時刻に含める要素">
                  <FieldRow className="settings-clock-options">
                    <label className="flex items-center gap-[var(--spacing-inline)]">
                      <input
                        type="checkbox"
                        checked={settings.showSeconds}
                        onChange={(event) => update({ showSeconds: event.target.checked })}
                      />
                      秒
                    </label>
                    <label className="flex items-center gap-[var(--spacing-inline)]">
                      <input
                        type="checkbox"
                        checked={settings.showDate}
                        onChange={(event) => update({ showDate: event.target.checked })}
                      />
                      日付
                    </label>
                    <label className="flex items-center gap-[var(--spacing-inline)]">
                      <input
                        type="checkbox"
                        checked={settings.showWeekday}
                        onChange={(event) => update({ showWeekday: event.target.checked })}
                      />
                      曜日
                    </label>
                    <label className="flex items-center gap-[var(--spacing-inline)]">
                      <input
                        type="checkbox"
                        checked={settings.hour12}
                        onChange={(event) => update({ hour12: event.target.checked })}
                      />
                      12時間表記
                    </label>
                  </FieldRow>
                  {/* 切り替えた結果は主表示で確かめられない。ここで同じ書式を見せる */}
                  <ClockPreview />
                </Field>
              </Zone>

              <Zone
                title="目標までの日数"
                description="表示するにして目標と明日以降の日付を入力すると、時計に残り日数を出します。"
              >
                <FieldRow>
                  <div className="flex items-center justify-between gap-[var(--spacing-stack)]">
                    <span id="goal-enabled-label">表示する</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.goalEnabled}
                      aria-labelledby="goal-enabled-label"
                      onClick={() => update({ goalEnabled: !settings.goalEnabled })}
                      className="relative h-[22px] w-[40px] shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-[2px] h-[16px] w-[16px] rounded-[var(--radius-marker)] bg-[var(--color-fg-primary)] transition-[left] duration-[var(--motion-state)] ease-[var(--ease-out)]"
                        style={{ left: settings.goalEnabled ? '20px' : '2px' }}
                      />
                    </button>
                  </div>
                </FieldRow>

                {settings.goalEnabled ? (
                  <div className="grid gap-[var(--spacing-group)]">
                    <Field label={<label htmlFor={goalNameId}>目標</label>} hint={`最大${GOAL_NAME_MAX_LENGTH}文字`}>
                      <input
                        id={goalNameId}
                        type="text"
                        required
                        maxLength={GOAL_NAME_MAX_LENGTH}
                        value={settings.goalName}
                        onChange={(event) => update({ goalName: event.target.value })}
                        className="min-h-[var(--size-hit)] w-full rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent px-[var(--spacing-inline)] text-[length:var(--text-body)] text-[var(--color-fg-primary)]"
                      />
                    </Field>

                    <Field
                      label={<label htmlFor={goalDateId}>目標日</label>}
                      hint={
                        settings.goalDate && (goalDays === null || goalDays < 1)
                          ? '明日以降の日付を選んでください。'
                          : undefined
                      }
                    >
                      <input
                        id={goalDateId}
                        type="date"
                        required
                        min={tomorrowDateInputValue(new Date())}
                        value={settings.goalDate}
                        aria-invalid={settings.goalDate !== '' && (goalDays === null || goalDays < 1)}
                        onChange={(event) => update({ goalDate: event.target.value })}
                        className="min-h-[var(--size-hit)] w-full rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent px-[var(--spacing-inline)] text-[length:var(--text-body)] text-[var(--color-fg-primary)]"
                      />
                    </Field>

                    {/* hig: feedback.user-caused-immediate。出ていない事実と、出すために足りないものを並べる */}
                    {goalGap ? (
                      <p className="m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">{goalGap}</p>
                    ) : null}
                  </div>
                ) : null}
              </Zone>

              <Zone title="画面レイアウト">
                <Field label="画面を見ながら調整">
                  <div className="flex items-center gap-[var(--spacing-inline)]">
                    <Action
                      shape="boxed"
                      aria-label="小さいパネルで調整する。書体、文字サイズ、文字色"
                      onClick={() => enterAdjust('compact')}
                    >
                      <Minimize2 size={16} />
                      簡易調整
                    </Action>
                    <Action
                      shape="boxed"
                      aria-label="大きいパネルで調整する。表示の設定をすべて含む"
                      onClick={() => enterAdjust('full')}
                    >
                      <Maximize2 size={16} />
                      詳細調整
                    </Action>
                  </div>
                </Field>

                <Field label="書体">
                  <Segmented
                    label="書体"
                    value={settings.face}
                    options={FACES.map((face) => ({ value: face.id, label: face.label }))}
                    onChange={(face) => update({ face })}
                  />
                </Field>

                <Field label={`文字サイズ — ${settings.scale.toFixed(2)}倍`}>
                  <input
                    type="range"
                    aria-label="文字サイズ"
                    min={0.5}
                    max={2.8}
                    step={0.05}
                    value={settings.scale}
                    onChange={(event) => update({ scale: Number(event.target.value) })}
                  />
                </Field>

                <Field label={`配置 — ${describePlacement(settings.placement)}`}>
                  <PositionPad value={settings.placement} onChange={(placement) => update({ placement })} />
                </Field>

                <Field label="時計の背景">
                  <Segmented
                    label="時計の背景"
                    value={settings.legibility}
                    options={LEGIBILITY_OPTIONS.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                    onChange={(legibility) => update({ legibility })}
                  />
                </Field>

                <Field label="文字色">
                  <div className="flex items-center gap-[var(--spacing-inline)]">
                    <input
                      type="color"
                      aria-label="文字色"
                      value={settings.textColor || (settings.theme === 'dark' ? '#ffffff' : '#000000')}
                      onChange={(event) => update({ textColor: event.target.value })}
                      className="h-7 w-10 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
                    />
                    <Action
                      shape="bare"
                      className="text-[length:var(--text-label)]"
                      disabled={settings.textColor === ''}
                      onClick={() => update({ textColor: '' })}
                    >
                      既定に戻す
                    </Action>
                  </div>
                  <ColorPresets value={settings.textColor} onPick={(textColor) => update({ textColor })} />
                </Field>
              </Zone>
            </>
          ) : null}

          {section === '背景' ? (
            <>
              <Zone title="背景の種類" divided={false}>
                <Segmented
                  label="背景の種類"
                  value={settings.background}
                  options={[
                    { value: 'image' as const, label: '画像' },
                    { value: 'solid' as const, label: '単色' },
                    { value: 'black' as const, label: '黒' },
                    { value: 'transparent' as const, label: '透明' },
                  ]}
                  onChange={(background_) => update({ background: background_ })}
                />
              </Zone>

              {settings.background === 'solid' ? (
                <Zone title="単色">
                  <Field label="色">
                    <input
                      type="color"
                      aria-label="背景の単色"
                      value={settings.solidColor}
                      onChange={(event) => update({ solidColor: event.target.value })}
                      className="h-8 w-14 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-transparent p-0"
                    />
                  </Field>
                </Zone>
              ) : null}

              {settings.background === 'image' ? (
                <>
                  <Zone title="画像の出所">
                    <Segmented
                      label="画像の出所"
                      value={settings.imageSource}
                      options={[
                        { value: 'unsplash' as const, label: 'Unsplash' },
                        { value: 'local' as const, label: 'ローカル画像' },
                      ]}
                      onChange={(imageSource) => update({ imageSource })}
                    />
                  </Zone>

                  {settings.imageSource === 'unsplash' ? (
                    <>
                      <Zone title="Unsplash">
                        <Field label="カテゴリ">
                          <Segmented
                            label="Unsplashのカテゴリ"
                            value={settings.unsplashQuery}
                            options={UNSPLASH_QUERIES.map((item) => ({
                              value: item.value,
                              label: item.label,
                            }))}
                            onChange={(unsplashQuery) => update({ unsplashQuery })}
                          />
                        </Field>

                        <Field label="切替間隔">
                          <Segmented
                            label="切替間隔"
                            value={settings.refreshIntervalMs}
                            options={REFRESH_INTERVALS.map((item) => ({
                              value: item.value,
                              label: item.label,
                            }))}
                            onChange={(refreshIntervalMs) => update({ refreshIntervalMs })}
                          />
                        </Field>

                        <Action shape="boxed" className="w-fit" onClick={background.refresh}>
                          <RotateCw size={14} />
                          別の画像を取得
                        </Action>
                      </Zone>

                      <Zone title="取得状態">
                        <BackgroundStatus />
                      </Zone>
                    </>
                  ) : (
                    <Zone title="ローカル画像" description="Unsplashからの取得と自動の切替は行いません。">
                      <Field label="画像" hint={background.isLocal ? undefined : '2MB以下の画像を選んでください。'}>
                        <label className="flex w-fit cursor-pointer items-center gap-[var(--spacing-inline)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] px-[var(--spacing-inline)] py-[var(--spacing-inline)] text-[length:var(--text-body)] text-[var(--color-fg-secondary)] hover:border-[var(--color-fg-primary)] hover:text-[var(--color-fg-primary)]">
                          <ImageUp size={14} />
                          {background.isLocal ? '別の画像を選ぶ' : '画像を選ぶ'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = '';
                              if (file) background.setLocalImage(file);
                            }}
                          />
                        </label>
                      </Field>

                      {background.isLocal ? (
                        <Action shape="boxed" className="w-fit" onClick={background.clearLocalImage}>
                          選んだ画像を削除する
                        </Action>
                      ) : null}
                    </Zone>
                  )}
                </>
              ) : null}
            </>
          ) : null}

          {section === '動作' ? (
            <>
              <Zone
                title="操作ボタンの自動非表示"
                description="タブ、画面ごとの操作、右下のボタン、カーソルが対象です。動かすとすぐ戻ります。"
                divided={false}
              >
                <Field label={`隠れるまでの時間 — ${alwaysVisible ? '常時表示' : `${settings.autoHideSeconds}秒`}`}>
                  {/* 常時表示は秒数の延長ではなく別の状態。区画を分け、境界を罫線で示す */}
                  <div className="autohide-row">
                    <Action
                      shape="segment"
                      role="switch"
                      aria-checked={alwaysVisible}
                      className="shrink-0"
                      onClick={() => update({ autoHideSeconds: alwaysVisible ? lastHideSeconds : 0 })}
                    >
                      常時表示
                    </Action>
                    <span className="autohide-divider" aria-hidden="true" />
                    <input
                      type="range"
                      aria-label="操作ボタンが隠れるまでの秒数"
                      min={1}
                      max={30}
                      disabled={alwaysVisible}
                      value={alwaysVisible ? lastHideSeconds : settings.autoHideSeconds}
                      onChange={(event) => {
                        const seconds = Number(event.target.value);
                        setLastHideSeconds(seconds);
                        update({ autoHideSeconds: seconds });
                      }}
                    />
                  </div>
                </Field>

                {/* 秒数が変わったら作り直し、最初から見せる */}
                <AutoHidePreview key={settings.autoHideSeconds} seconds={settings.autoHideSeconds} />
              </Zone>

              <Zone
                title="通知と音"
                description="ポモドーロのフェーズが切り替わった時と、タイマーが終了した時に知らせます。有効にするまで通知も音も発生しません。"
              >
                <FieldRow>
                  <label className="flex items-center gap-[var(--spacing-inline)]">
                    <input
                      type="checkbox"
                      checked={settings.notifyEnabled}
                      onChange={async (event) => {
                        if (!event.target.checked) {
                          update({ notifyEnabled: false });
                          return;
                        }
                        // 許可はこの操作と同時にだけ求める
                        const permission = await requestNotifyPermission();
                        if (permission === 'granted') {
                          update({ notifyEnabled: true });
                          return;
                        }
                        update({ notifyEnabled: false });
                        // 失敗ではなく、利用者かブラウザの判断。警告として示す
                        notify(
                          'warn',
                          permission === 'denied'
                            ? '通知が許可されませんでした。ブラウザの設定から許可してください。'
                            : 'この環境では通知を利用できません。',
                        );
                      }}
                    />
                    通知を有効にする
                  </label>
                  <label className="flex items-center gap-[var(--spacing-inline)]">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(event) => update({ soundEnabled: event.target.checked })}
                    />
                    音を有効にする
                  </label>
                </FieldRow>

                <Action shape="boxed" disabled={!settings.soundEnabled} className="w-fit" onClick={playChime}>
                  <Volume2 size={14} />
                  音を試聴する
                </Action>
              </Zone>

              {/* 元の値へ戻せない操作なので、ここだけ確認を挟む。hig: form.reset-all */}
              <Zone title="初期化" description="すべての設定を既定へ戻します。進行中の計測は変わりません。">
                <Action
                  shape="boxed"
                  tone="danger"
                  className="w-fit"
                  disabled={isDefaultSettings(settings)}
                  onClick={() => setConfirmReset(true)}
                >
                  <Undo2 size={14} />
                  設定を初期化する
                </Action>
              </Zone>
            </>
          ) : null}
        </div>
      </div>

      <ConfirmSurface
        open={confirmReset}
        title="設定を初期化しますか"
        description="すべての設定が既定へ戻ります。この操作は元に戻せません。"
        confirmLabel="初期化する"
        danger
        onConfirm={() => {
          update(DEFAULT_SETTINGS);
          setConfirmReset(false);
        }}
        onClose={() => setConfirmReset(false)}
      />
    </ModalSurface>
  );
};
