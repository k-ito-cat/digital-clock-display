import { useEffect, useState } from "react";
import { getUnsplashRandomImageUrl } from "~/api/getUnsplashRandomImageUrl";
import { useSettingHandler } from "~/hooks/useSettingHandler";
import {
  COOKIE_KEY_INITIAL_LOAD_COMPLETED,
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_IMAGE_CACHE,
  STORAGE_KEY_REQUEST_LIMIT,
} from "~/constants/keyName";

interface Props {
  setLimit: (limit: { requestLimit: number; requestRemaining: number }) => void;
}

/**
 * @param intervalTime - 画像取得APIの再フェッチのインターバル時間
 * @returns photo
 */
export const useUnsplashImage = ({ setLimit }: Props) => {
  const [photo, setPhoto] = useState<string | null>(null);

  const { intervalTime } = useSettingHandler();

  const saveImageUrl = async () => {
    const data = await getUnsplashRandomImageUrl();
    if (!data) return;

    localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, data.url);
    localStorage.setItem(STORAGE_KEY_FETCH_TIMESTAMP, String(Date.now()));
    localStorage.setItem(
      STORAGE_KEY_REQUEST_LIMIT,
      JSON.stringify({
        limit: data.requestLimit,
        remaining: data.requestRemaining,
      }),
    );
    setLimit({
      requestLimit: data.requestLimit,
      requestRemaining: data.requestRemaining,
    });
    setPhoto(data.url);
  };

  useEffect(() => {
    const firstFetch = async () => {
      const session = sessionStorage.getItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED);
      if (!session) {
        sessionStorage.setItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED, "true");
        // サイトを始めて訪れたときのみフェッチを行う
        // TODO: URL形式の型定義をする
        saveImageUrl();
      } else {
        const imageUrl = localStorage.getItem(STORAGE_KEY_IMAGE_CACHE);

        if (imageUrl) {
          setPhoto(imageUrl);
        } else {
          sessionStorage.removeItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED);
          localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, photo || "");
        }
      }
    };
    firstFetch();
  }, [photo]);

  /**
   * 1秒ごとにフェッチ直後の時刻+インターバル時間と現在時刻を比較し、
   * 現在時刻がフェッチ直後の時刻+インターバル時間を超えていた場合、再フェッチを行う
   */
  useEffect(() => {
    const checkAndRefetch = () => {
      const fetchTimestamp = localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP);

      if (!fetchTimestamp) return;

      // TODO: util
      const refetchAt = Number(fetchTimestamp) + intervalTime.state;

      if (Date.now() >= refetchAt) {
        // 前回のフェッチの時間 + インターバルの時間を現在時刻が超えた場合、再フェッチを行う
        saveImageUrl();
      } else {
        // 次のフェッチまでの時間を計算し、次のタイムアウトを設定
        const timeout = refetchAt - Date.now();
        setTimeout(checkAndRefetch, timeout);
      }
    };
    const intervalId = setTimeout(checkAndRefetch, 1000);
    return () => clearTimeout(intervalId);
  }, [photo, intervalTime.state]);

  return { photoUrl: photo };
};
