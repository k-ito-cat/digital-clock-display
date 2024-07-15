import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { getUnsplashRandomImageUrl } from "~/api/getUnsplashRandomImageUrl";
import { FETCH_INTERVAL } from "~/constants/intervalTime";
import {
  COOKIE_KEY,
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_IMAGE_CACHE,
} from "~/constants/keyName";

// TODO: 機能として、セッションかcookieかは選びたい（タブを新しく開いたときどうするかとかで）

export const useUnsplashImage = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies([COOKIE_KEY]);

  /**
   * フェッチ直後の時刻と画像URLをローカルストレージに保存
   * @param imageUrl
   */
  const setFetchData = (imageUrl: string) => {
    localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, imageUrl);
    localStorage.setItem(STORAGE_KEY_FETCH_TIMESTAMP, String(Date.now()));
  };

  useEffect(() => {
    // NOTE: 初回フェッチ後にリロードすることによる再フェッチの防止として、
    // 初回フェッチ後に永続的なcookieを付与し、cookieが存在する場合は再フェッチを行わず、ローカルストレージに保存された画像を読み取る

    const firstFetch = async () => {
      if (!cookies.initial_load_completed) {
        // 永続的なcookieを付与
        setCookie(COOKIE_KEY, true, { path: "/" });

        // サイトを始めて訪れたときのみフェッチを行う
        const initialFetchResponse: string = await getUnsplashRandomImageUrl();

        setFetchData(initialFetchResponse);
        setPhoto(initialFetchResponse);
      } else {
        const imageUrl = localStorage.getItem(STORAGE_KEY_IMAGE_CACHE);

        if (imageUrl) {
          setPhoto(imageUrl);
        } else {
          localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, photo || "");
        }
      }
    };
    firstFetch();
  }, [photo, cookies.initial_load_completed, setCookie]);

  /**
   * 1秒ごとにフェッチ直後の時刻+インターバル時間と現在時刻を比較し、
   * 現在時刻がフェッチ直後の時刻+インターバル時間を超えていた場合、再フェッチを行う
   */
  const intervalId = setInterval(async () => {
    const fetchTimestamp = localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP);

    if (!fetchTimestamp) return;

    const refetchAt = Number(fetchTimestamp) + FETCH_INTERVAL;
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
