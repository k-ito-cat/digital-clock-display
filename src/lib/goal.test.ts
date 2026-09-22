import { describe, expect, it } from 'vitest';
import { daysUntilGoal, describeGoalGap, formatGoalCountdown, isValidGoalName, tomorrowDateInputValue } from './goal';

describe('daysUntilGoal', () => {
  const now = new Date(2026, 8, 22, 23, 30);

  it('時刻ではなくローカルの暦日で数える', () => {
    expect(daysUntilGoal(now, '2026-09-23')).toBe(1);
    expect(daysUntilGoal(now, '2026-09-22')).toBe(0);
    expect(daysUntilGoal(now, '2026-09-21')).toBe(-1);
  });

  it('実在しない日付は受け取らない', () => {
    expect(daysUntilGoal(now, '2026-02-30')).toBeNull();
    expect(daysUntilGoal(now, '')).toBeNull();
  });
});

describe('goal input', () => {
  it('目標名は空白を除いて1〜10文字を受け取る', () => {
    expect(isValidGoalName(' 目標 ')).toBe(true);
    expect(isValidGoalName('')).toBe(false);
    expect(isValidGoalName('12345678901')).toBe(false);
  });

  it('翌日をdate入力の形式で返す', () => {
    expect(tomorrowDateInputValue(new Date(2026, 11, 31, 23, 59))).toBe('2027-01-01');
  });

  it('揃っていない項目を、時計に出ない理由として示す', () => {
    const now = new Date(2026, 8, 22);
    expect(describeGoalGap('', '', now)).toBe('目標と目標日が未入力のため、時計には表示していません。');
    expect(describeGoalGap(' ', '2026-09-23', now)).toBe('目標が未入力のため、時計には表示していません。');
    expect(describeGoalGap('公開', '', now)).toBe('目標日が未入力のため、時計には表示していません。');
    expect(describeGoalGap('公開', '2026-13-01', now)).toBe('目標日が未入力のため、時計には表示していません。');
    expect(describeGoalGap('公開', '2026-09-21', now)).toBe('目標日を過ぎているため、時計には表示していません。');
    // 当日はまだ出せる。formatGoalCountdown と境界を揃える
    expect(describeGoalGap('公開', '2026-09-22', now)).toBeNull();
  });

  it('当日までは指定の文言で表示し、経過後は隠す', () => {
    const now = new Date(2026, 8, 22);
    expect(formatGoalCountdown('公開', '2026-09-23', now)).toBe('公開 まであと1日');
    expect(formatGoalCountdown('公開', '2026-09-22', now)).toBe('公開 まであと0日');
    expect(formatGoalCountdown('公開', '2026-09-21', now)).toBeNull();
  });
});
