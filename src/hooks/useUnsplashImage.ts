import { useEffect, useState } from "react";
import { getUnsplashRandomImageUrl } from "~/api/getUnsplashRandomImageUrl";
import {
  COOKIE_KEY_INITIAL_LOAD_COMPLETED,
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_IMAGE_CACHE,
} from "~/constants/keyName";

/**
 * @param intervalTime - 画像取得APIの再フェッチのインターバル時間
 * @returns photo
 */
export const useUnsplashImage = (intervalTime: number) => {
  const [photo, setPhoto] = useState<string | null>(null);

  /**
   * フェッチ直後の時刻と画像URLをローカルストレージに保存
   * @param imageUrl
   */
  const setFetchData = (imageUrl: string) => {
    localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, imageUrl);
    localStorage.setItem(STORAGE_KEY_FETCH_TIMESTAMP, String(Date.now()));
  };

  useEffect(() => {
    const firstFetch = async () => {
      const session = sessionStorage.getItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED);
      if (!session) {
        sessionStorage.setItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED, "true");
        // サイトを始めて訪れたときのみフェッチを行う
        // TODO: URL形式の型定義をする
        const initialFetchResponse: string = await getUnsplashRandomImageUrl();

        if (!initialFetchResponse) return;
        setFetchData(initialFetchResponse);
        setPhoto(initialFetchResponse);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo]);

  /**
   * 1秒ごとにフェッチ直後の時刻+インターバル時間と現在時刻を比較し、
   * 現在時刻がフェッチ直後の時刻+インターバル時間を超えていた場合、再フェッチを行う
   */
  const intervalId = setInterval(async () => {
    const fetchTimestamp = localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP);

    if (!fetchTimestamp) return;

    const refetchAt = Number(fetchTimestamp) + intervalTime;

    if (Date.now() >= refetchAt) {
      // 前回のフェッチの時間+インターバルの時間を現在時刻が超えた場合、再フェッチを行う
      const updateImageUrl: string = await getUnsplashRandomImageUrl();

      setFetchData(updateImageUrl);
      setPhoto(updateImageUrl);
    }
    return () => clearInterval(intervalId);
  }, 1000);

  return photo;
};
