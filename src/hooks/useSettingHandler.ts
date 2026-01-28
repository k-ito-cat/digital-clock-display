import { useState } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DEFAULT_FETCH_INTERVAL } from "~/constants/intervalTime";
import {
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_INTERVAL_TIME,
} from "~/constants/keyName";

export const useSettingHandler = () => {
  const [intervalTime, setIntervalTime] = useState<number>(
    Number(localStorage.getItem("intervalTime")) || DEFAULT_FETCH_INTERVAL,
  );
  /**
   * 設定メニューで選択された次の画像取得までの時間を永続化し、画像取得までの時間を状態として保持する
   * この関数が実行されるたびにタイムスタンプが更新され、次の画像取得までの時間が再計算される
   */
  const handleIntervalTimeChange = (event: SelectChangeEvent<string>) => {
    // 選択された次の画像取得までの時間を永続化
    localStorage.setItem(STORAGE_KEY_INTERVAL_TIME, String(event.target.value));
    // 次の画像取得までの時間を計算するためのタイムスタンプを初期化
    localStorage.setItem(STORAGE_KEY_FETCH_TIMESTAMP, String(Date.now()));
    setIntervalTime(Number(event.target.value));
  };

  return {
    intervalTime: { handler: handleIntervalTimeChange, state: intervalTime },
  };
};
