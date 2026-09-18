import { describe, expect, it } from 'vitest';
import { estimateWidthEm, readoutFontSize } from './readout';

const cqi = (value: string) => Number(/min\((\d+(?:\.\d+)?)cqi/.exec(value)![1]);

describe('estimateWidthEm', () => {
  it('桁が増えるほど広くなる', () => {
    expect(estimateWidthEm('09:41')).toBeLessThan(estimateWidthEm('09:41:22'));
  });

  it('区切りは数字より狭く見積もる', () => {
    expect(estimateWidthEm(':')).toBeLessThan(estimateWidthEm('0'));
  });
});

describe('readoutFontSize', () => {
  it('桁数が少ないほど大きく表示する', () => {
    expect(cqi(readoutFontSize('09:41', 1))).toBeGreaterThan(cqi(readoutFontSize('09:41:22', 1)));
  });

  it('利用者の倍率を掛ける', () => {
    expect(readoutFontSize('09:41', 1.2)).toContain('* 1.2');
  });

  it('面の高さで頭打ちにする', () => {
    expect(readoutFontSize('09:41', 1)).toContain('cqb');
  });
});
