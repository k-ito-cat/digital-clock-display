/**
 * 数字の入力は半角で扱う。日本語入力では全角のまま確定されることがあり、
 * そのまま数値にすると読み取れないため、確定前に半角へ寄せる。
 */
export const toHalfWidthDigits = (value: string) => value.normalize('NFKC').replace(/[^\d-]/g, '');

export const pad2 = (value: number) => String(value).padStart(2, '0');

/** 残り時間の表示。1時間未満では時を省く */
export const formatDuration = (totalSeconds: number) => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return hours > 0 ? `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}` : `${pad2(minutes)}:${pad2(seconds)}`;
};

export type ClockFormat = {
  showSeconds: boolean;
  hour12: boolean;
};

export const formatClock = (date: Date, { showSeconds, hour12 }: ClockFormat) => {
  let hours = date.getHours();
  let suffix = '';
  if (hour12) {
    suffix = hours < 12 ? ' AM' : ' PM';
    hours = hours % 12 || 12;
  }
  const base = `${pad2(hours)}:${pad2(date.getMinutes())}`;
  return showSeconds ? `${base}:${pad2(date.getSeconds())}${suffix}` : `${base}${suffix}`;
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const formatDate = (date: Date, showWeekday: boolean) => {
  const base = `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
  return showWeekday ? `${base} (${WEEKDAYS[date.getDay()]})` : base;
};

/** 秒表示の有無で更新間隔を変える。分表示のときに毎秒描き直さない */
export const msUntilNextTick = (now: number, showSeconds: boolean) => {
  const period = showSeconds ? 1000 : 60_000;
  return period - (now % period);
};
