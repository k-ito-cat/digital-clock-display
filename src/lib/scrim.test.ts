import { describe, expect, it } from 'vitest';
import { clampScrimValue, describeScrimValue, getScrimAppearance } from './scrim';

describe('scrim', () => {
  it('現在の範囲を最小、現在の減光量を中間として再現する', () => {
    expect(getScrimAppearance(0, 50)).toEqual({
      insetInlinePercent: 10,
      insetBlockPercent: 14,
      radiusRatio: 0.75,
      darkOpacity: 0.55,
      lightOpacity: 0.72,
    });
  });

  it('最大範囲と最大減光量へ連続的に広げられる', () => {
    expect(getScrimAppearance(100, 100)).toEqual({
      insetInlinePercent: 40,
      insetBlockPercent: 56,
      radiusRatio: 1.25,
      darkOpacity: 0.75,
      lightOpacity: 0.92,
    });
  });

  it('保存値を範囲内へ収め、値の程度を説明する', () => {
    expect(clampScrimValue(-10, 50)).toBe(0);
    expect(clampScrimValue(120, 50)).toBe(100);
    expect(clampScrimValue(undefined, 50)).toBe(50);
    expect(describeScrimValue(0)).toBe('最小');
    expect(describeScrimValue(50)).toBe('中間');
    expect(describeScrimValue(100)).toBe('最大');
  });
});
