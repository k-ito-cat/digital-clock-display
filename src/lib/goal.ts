import { pad2 } from './time';

export const GOAL_NAME_MAX_LENGTH = 10;

const parseDateInput = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day };
};

const calendarDay = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export const isValidGoalName = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 && Array.from(trimmed).length <= GOAL_NAME_MAX_LENGTH;
};

/** DSTの長短に影響されない、端末のローカル日付同士の暦日差 */
export const daysUntilGoal = (now: Date, value: string) => {
  const target = parseDateInput(value);
  if (!target) return null;
  return Math.round((Date.UTC(target.year, target.month - 1, target.day) - calendarDay(now)) / 86_400_000);
};

export const tomorrowDateInputValue = (now: Date) => {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return `${tomorrow.getFullYear()}-${pad2(tomorrow.getMonth() + 1)}-${pad2(tomorrow.getDate())}`;
};

/**
 * 時計へ出せない理由。出せる場合は null。
 * 入力のたびに確定する方式では、揃っていない間も設定が保存される。
 * 黙って出ないのではなく、何が足りないかをその場で示すために使う。
 */
export const describeGoalGap = (name: string, date: string, now: Date) => {
  const named = isValidGoalName(name);
  const days = daysUntilGoal(now, date);
  if (!named && days === null) return '目標と目標日が未入力のため、時計には表示していません。';
  if (!named) return '目標が未入力のため、時計には表示していません。';
  if (days === null) return '目標日が未入力のため、時計には表示していません。';
  if (days < 0) return '目標日を過ぎているため、時計には表示していません。';
  return null;
};

export const formatGoalCountdown = (name: string, date: string, now: Date) => {
  const days = daysUntilGoal(now, date);
  if (!isValidGoalName(name) || days === null || days < 0) return null;
  return `${name.trim()} まであと${days}日`;
};
