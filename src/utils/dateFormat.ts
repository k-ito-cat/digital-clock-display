/**
 * Dateオブジェクトの入力を受け取り、フォーマットされた日付をYYYY/MM/DD HH:mm:ss形式で返す
 * @param date
 * @returns YYYY/MM/DD HH:mm:ss形式の日付
 */
export const formattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // フォーマット
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};
