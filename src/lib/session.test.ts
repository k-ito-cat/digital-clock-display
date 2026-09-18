import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from '~/store/settings-context';
import { blockState, buildBlocks } from './session';

const make = (patch: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...patch });

describe('blockState', () => {
  it('開始前は全区画が未到達になる', () => {
    expect([0, 1, 2].map((index) => blockState(index, 'idle', 0))).toEqual(['pending', 'pending', 'pending']);
  });
  it('2セット目の作業では、最初の作業と休憩を完了済みにする', () => {
    expect([0, 1, 2, 3, 4].map((index) => blockState(index, 'work', 2))).toEqual([
      'complete',
      'complete',
      'current',
      'pending',
      'pending',
    ]);
  });
  it.each(['shortBreak', 'longBreak'] as const)('%sでは作業直後の休憩区画を現在地にする', (phase) => {
    expect([0, 1, 2, 3, 4].map((index) => blockState(index, phase, 2))).toEqual([
      'complete',
      'complete',
      'complete',
      'current',
      'pending',
    ]);
  });
  it('全セット完了後は最後の作業を含めて完了済みにする', () => {
    expect([0, 1, 2].map((index) => blockState(index, 'done', 2))).toEqual(['complete', 'complete', 'complete']);
  });
});

describe('buildBlocks', () => {
  it('作業と休憩が交互に並び、最後の作業のあとに休憩を置かない', () => {
    const blocks = buildBlocks(make({ totalSets: 3, longBreakEnabled: false, work: 1500, shortBreak: 300 }));
    expect(blocks.map((block) => block.kind)).toEqual(['work', 'shortBreak', 'work', 'shortBreak', 'work']);
  });

  it('指定した周期で長休憩が入る', () => {
    const blocks = buildBlocks(make({ totalSets: 4, longBreakEnabled: true, longBreakEvery: 2 }));
    expect(blocks.map((block) => block.kind)).toEqual([
      'work',
      'shortBreak',
      'work',
      'longBreak',
      'work',
      'shortBreak',
      'work',
    ]);
  });

  it('長休憩を使わない設定では長休憩が現れない', () => {
    const blocks = buildBlocks(make({ totalSets: 4, longBreakEnabled: false, longBreakEvery: 2 }));
    expect(blocks.some((block) => block.kind === 'longBreak')).toBe(false);
  });

  it('1セットでは作業だけになる', () => {
    expect(buildBlocks(make({ totalSets: 1 })).map((block) => block.kind)).toEqual(['work']);
  });

  it('各区画は設定した長さを持つ', () => {
    const blocks = buildBlocks(make({ totalSets: 2, longBreakEnabled: false, work: 1500, shortBreak: 300 }));
    expect(blocks.map((block) => block.seconds)).toEqual([1500, 300, 1500]);
  });
});
