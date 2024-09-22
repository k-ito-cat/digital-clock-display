/**
 * 現在時刻をHH:MM:SS形式でフォーマットする
 * @returns {string} - HH:MM:SS形式でフォーマットされた時刻を返す
 */
export const clockViewFormat = () => {
  const current = new Date();
  let hours: number | string = current.getHours();
  let minutes: number | string = current.getMinutes();
  let seconds: number | string = current.getSeconds();

  // 1桁の場合、0埋めする
  hours = Number(hours) < 10 ? `0${hours}` : hours;
  minutes = Number(minutes) < 10 ? `0${minutes}` : minutes;
  seconds = Number(seconds) < 10 ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
};
