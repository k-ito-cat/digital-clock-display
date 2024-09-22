import { STORAGE_KEY_FETCH_TIMESTAMP } from "~/constants/keyName";

/**
 * 
 * @param intervalTime - メニューで選択された次の画像取得までの時間
 * @returns number - 選択したその時間のタイムスタンプと選択された次の画像取得までの時間を足した値
 */
export const getNextFetchTime = (intervalTime: number) => {
  return (
    Number(localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP)) + intervalTime
  );
};
