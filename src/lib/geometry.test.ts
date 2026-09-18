import { describe, expect, it } from 'vitest';
import { clampToFrame } from './geometry';

const rect = (width: number, height: number) => ({ width, height }) as DOMRect;

describe('clampToFrame', () => {
  it('面の内側はそのまま通す', () => {
    expect(clampToFrame({ x: 40, y: 30 }, rect(400, 300), rect(100, 40))).toEqual({ x: 40, y: 30 });
  });

  it('左と上へはみ出さない', () => {
    expect(clampToFrame({ x: -20, y: -50 }, rect(400, 300), rect(100, 40))).toEqual({ x: 0, y: 0 });
  });

  it('右と下へはみ出さない', () => {
    expect(clampToFrame({ x: 999, y: 999 }, rect(400, 300), rect(100, 40))).toEqual({
      x: 300,
      y: 260,
    });
  });

  it('パネルが面より大きい場合は 0 に寄せる', () => {
    expect(clampToFrame({ x: 50, y: 50 }, rect(80, 30), rect(100, 40))).toEqual({ x: 0, y: 0 });
  });

  it('寸法を取れない場合は指定値をそのまま返す', () => {
    expect(clampToFrame({ x: 5, y: 7 }, undefined, undefined)).toEqual({ x: 5, y: 7 });
  });
});
