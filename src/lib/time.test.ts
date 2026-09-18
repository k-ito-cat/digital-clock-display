import { describe, expect, it } from 'vitest';
import { formatClock, formatDate, formatDuration, msUntilNextTick, toHalfWidthDigits } from './time';

describe('formatDuration', () => {
  it('1時間未満では時を省く', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(59)).toBe('00:59');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('1時間以上では時を含める', () => {
    expect(formatDuration(3600)).toBe('01:00:00');
  });

  it('負の値は0として扱う', () => {
    expect(formatDuration(-5)).toBe('00:00');
  });
});

describe('formatClock', () => {
  const date = new Date(2026, 8, 17, 21, 5, 3);

  it('秒の表示を切り替えられる', () => {
    expect(formatClock(date, { showSeconds: true, hour12: false })).toBe('21:05:03');
    expect(formatClock(date, { showSeconds: false, hour12: false })).toBe('21:05');
  });

  it('12時間表記に切り替えられる', () => {
    expect(formatClock(date, { showSeconds: false, hour12: true })).toBe('09:05 PM');
    const morning = new Date(2026, 8, 17, 0, 5, 0);
    expect(formatClock(morning, { showSeconds: false, hour12: true })).toBe('12:05 AM');
  });
});

describe('formatDate', () => {
  it('曜日の表示を切り替えられる', () => {
    const date = new Date(2026, 8, 17);
    expect(formatDate(date, false)).toBe('2026/09/17');
    expect(formatDate(date, true)).toBe('2026/09/17 (木)');
  });
});

describe('msUntilNextTick', () => {
  it('秒表示では次の秒まで、分表示では次の分までを返す', () => {
    expect(msUntilNextTick(1_000, true)).toBe(1_000);
    expect(msUntilNextTick(1_200, true)).toBe(800);
    expect(msUntilNextTick(60_000, false)).toBe(60_000);
    expect(msUntilNextTick(61_000, false)).toBe(59_000);
  });
});

describe('toHalfWidthDigits', () => {
  it('全角の数字を半角へ寄せる', () => {
    expect(toHalfWidthDigits('１２３')).toBe('123');
  });

  it('数字以外を落とす', () => {
    expect(toHalfWidthDigits('12分')).toBe('12');
    expect(toHalfWidthDigits('　5 ')).toBe('5');
  });

  it('空文字はそのまま返す', () => {
    expect(toHalfWidthDigits('')).toBe('');
  });
});
