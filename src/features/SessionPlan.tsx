import { Minus, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Action } from '~/components/Action';
import { blockState, buildBlocks, KIND_FIELD, KIND_LABEL, type BlockKind } from '~/lib/session';
import { DEFAULT_POMODORO, isDefaultPomodoro, useSettings } from '~/store/settings-context';
import { PHASE_LABEL, useTimers } from '~/store/timers-context';

const KINDS: BlockKind[] = ['work', 'shortBreak', 'longBreak'];

const Row = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div className="session-field">
    <span className="text-[var(--color-fg-secondary)]">{label}</span>
    <span className="session-stepper">{children}</span>
  </div>
);

/** 幅は時間比率、余白はセットの境界。短い区画の種類も下の操作から選択できる。 */
export const SessionBar = ({ selected, onSelect }: { selected?: BlockKind; onSelect?: (kind: BlockKind) => void }) => {
  const { settings } = useSettings();
  const { phase, set, pomodoro, progress } = useTimers();
  const blocks = buildBlocks(settings);
  const sets = blocks
    .filter((block) => block.kind === 'work')
    .map((work) => {
      const index = blocks.indexOf(work);
      const rest = blocks[index + 1]?.kind !== 'work' ? blocks[index + 1] : undefined;
      return { work, rest, seconds: work.seconds + (rest?.seconds ?? 0) };
    });
  const totalMinutes = Math.round(blocks.reduce((total, block) => total + block.seconds, 0) / 60);

  return (
    <div className="session-plan">
      <div className="session-summary">
        <span>{settings.totalSets}セット</span>
        <span className="tabular">合計 {totalMinutes}分</span>
      </div>
      <div
        className="session-timeline"
        role="img"
        aria-label={`${phase === 'idle' ? 'セッションの構成' : phase === 'done' ? '全セット完了' : `${set}セット目の${PHASE_LABEL[phase]}`}。${blocks.map((block) => `${KIND_LABEL[block.kind]}${Math.round(block.seconds / 60)}分`).join('、')}`}
      >
        {sets.map(({ work, rest, seconds }, index) => (
          <div className="session-cycle" key={work.key} style={{ flexGrow: seconds }}>
            <div className="session-cycle-track" aria-hidden="true">
              {[work, ...(rest ? [rest] : [])].map((block) => (
                <span
                  key={block.key}
                  className="session-block"
                  data-kind={block.kind}
                  data-selected={selected === block.kind || undefined}
                  data-state={blockState(blocks.indexOf(block), phase, set)}
                  style={{ flexGrow: block.seconds }}
                >
                  {blockState(blocks.indexOf(block), phase, set) === 'current' ? (
                    <span
                      className="session-block-progress"
                      style={{ width: `${Math.min(1, Math.max(0, progress(pomodoro))) * 100}%` }}
                    />
                  ) : null}
                </span>
              ))}
            </div>
            <span className="session-cycle-number tabular" aria-hidden="true">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
      {onSelect ? (
        <div className="session-legend" role="group" aria-label="編集する時間">
          {KINDS.filter((kind) => kind !== 'longBreak' || settings.longBreakEnabled).map((kind) => (
            <Action
              key={kind}
              shape="bare"
              className="session-kind"
              aria-pressed={selected === kind}
              onClick={() => onSelect(kind)}
            >
              <span className="session-swatch" data-kind={kind} aria-hidden="true" />
              <span>{KIND_LABEL[kind]}</span>
              <span className="tabular">{Math.round(settings[KIND_FIELD[kind]] / 60)}分</span>
            </Action>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const SessionControls = () => {
  const { settings, update } = useSettings();
  const [selection, setSelected] = useState<BlockKind>('work');
  const selected = selection === 'longBreak' && !settings.longBreakEnabled ? 'work' : selection;
  const minutes = Math.round(settings[KIND_FIELD[selected]] / 60);
  const maxMinutes = selected === 'work' ? 120 : 60;

  return (
    <div
      className="session-editor"
      onKeyDown={(event) => {
        if (event.key.startsWith('Arrow')) event.stopPropagation();
      }}
    >
      <SessionBar selected={selected} onSelect={setSelected} />
      <div className="session-fields">
        <Row label={KIND_LABEL[selected]}>
          <Action
            aria-label={`${KIND_LABEL[selected]}を1分減らす`}
            disabled={minutes <= 1}
            onClick={() => update({ [KIND_FIELD[selected]]: (minutes - 1) * 60 })}
          >
            <Minus size={14} />
          </Action>
          <span className="session-value tabular">{minutes}分</span>
          <Action
            aria-label={`${KIND_LABEL[selected]}を1分増やす`}
            disabled={minutes >= maxMinutes}
            onClick={() => update({ [KIND_FIELD[selected]]: (minutes + 1) * 60 })}
          >
            <Plus size={14} />
          </Action>
        </Row>
        <Row label="セット">
          <Action
            aria-label="セット数を減らす"
            disabled={settings.totalSets <= 1}
            onClick={() => update({ totalSets: settings.totalSets - 1 })}
          >
            <Minus size={14} />
          </Action>
          <span className="session-value tabular">{settings.totalSets}</span>
          <Action
            aria-label="セット数を増やす"
            disabled={settings.totalSets >= 12}
            onClick={() => update({ totalSets: settings.totalSets + 1 })}
          >
            <Plus size={14} />
          </Action>
        </Row>
        <Row
          label={
            <Action
              shape="bare"
              aria-pressed={settings.longBreakEnabled}
              onClick={() => update({ longBreakEnabled: !settings.longBreakEnabled })}
            >
              長休憩 {settings.longBreakEnabled ? 'あり' : 'なし'}
            </Action>
          }
        >
          {settings.longBreakEnabled ? (
            <>
              <Action
                aria-label="長休憩の周期を短くする"
                disabled={settings.longBreakEvery <= 2}
                onClick={() => update({ longBreakEvery: settings.longBreakEvery - 1 })}
              >
                <Minus size={14} />
              </Action>
              <span className="session-value tabular">{settings.longBreakEvery}回ごと</span>
              <Action
                aria-label="長休憩の周期を長くする"
                disabled={settings.longBreakEvery >= 8}
                onClick={() => update({ longBreakEvery: settings.longBreakEvery + 1 })}
              >
                <Plus size={14} />
              </Action>
            </>
          ) : (
            <span className="session-value">なし</span>
          )}
        </Row>
      </div>

      {/* hig: form.reset-to-default。既定と同じ間は押せない */}
      <Action
        shape="bare"
        className="justify-self-end text-[length:var(--text-label)]"
        disabled={isDefaultPomodoro(settings)}
        onClick={() => update(DEFAULT_POMODORO)}
      >
        既定の構成へ戻す
      </Action>
    </div>
  );
};
