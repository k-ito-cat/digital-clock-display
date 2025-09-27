/**
 * 現在時刻をHH:MM:SS形式でフォーマットする
 * @returns {string} - HH:MM:SS形式でフォーマットされた時刻を返す
 */
export const formatTimeByPattern = (date: Date, pattern: "HH:mm:ss" | "HH:mm") => {
  const pad = (num: number) => num.toString().padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  if (pattern === "HH:mm") {
    return `${hours}:${minutes}`;
  }
  return `${hours}:${minutes}:${seconds}`;
};

export const clockViewFormat = () => formatTimeByPattern(new Date(), "HH:mm:ss");
