import type { Settings } from '~/store/settings-context';

export type BlockKind = 'work' | 'shortBreak' | 'longBreak';

export type Block = { key: string; kind: BlockKind; seconds: number };

export const blockState = (index: number, phase: BlockKind | 'idle' | 'done', set: number) => {
  if (phase === 'done') return 'complete';
  if (phase === 'idle') return 'pending';
  const current = (set - 1) * 2 + (phase === 'work' ? 0 : 1);
  return index < current ? 'complete' : index === current ? 'current' : 'pending';
};

export const KIND_LABEL: Record<BlockKind, string> = {
  work: '作業',
  shortBreak: '休憩',
  longBreak: '長休憩',
};

/** 各種類が対応する設定の項目。秒で保持している */
export const KIND_FIELD = {
  work: 'work',
  shortBreak: 'shortBreak',
  longBreak: 'longBreak',
} as const satisfies Record<BlockKind, keyof Settings>;

/**
 * セッションの構成を、時間の長さに比例した積み木として示す。
 * 何分の作業が何回あり、どこで休憩が入るかを、読まずに形で分かるようにする。
 * docs/design/screens.md のポモドーロに対応する。
 */
export const buildBlocks = (settings: Settings): Block[] => {
  const blocks: Block[] = [];
  for (let set = 1; set <= settings.totalSets; set += 1) {
    blocks.push({ key: `work-${set}`, kind: 'work', seconds: settings.work });
    if (set === settings.totalSets) break;
    const isLong = settings.longBreakEnabled && set % settings.longBreakEvery === 0;
    blocks.push({
      key: `break-${set}`,
      kind: isLong ? 'longBreak' : 'shortBreak',
      seconds: isLong ? settings.longBreak : settings.shortBreak,
    });
  }
  return blocks;
};
