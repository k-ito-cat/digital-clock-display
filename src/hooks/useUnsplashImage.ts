import { useEffect, useState } from "react";
import { getUnsplashRandomImageUrl } from "~/api/getUnsplashRandomImageUrl";
import { useSettingHandler } from "~/hooks/useSettingHandler";
import { getNextFetchTime } from "~/utils/nextFetchTime";
import {
  COOKIE_KEY_INITIAL_LOAD_COMPLETED,
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_IMAGE_CACHE,
  STORAGE_KEY_REQUEST_LIMIT,
  STORAGE_KEY_CUSTOM_BACKGROUND,
  STORAGE_KEY_UNSPLASH_QUERY,
} from "~/constants/keyName";
import { TIMER_UPDATE_INTERVAL } from "~/constants/intervalTime";

interface Props {
  setLimit: (limit: { requestLimit: number; requestRemaining: number }) => void;
}

/**
 * @param intervalTime - 画像取得APIの再フェッチのインターバル時間
 * @returns photo
 */
export const useUnsplashImage = ({ setLimit }: Props) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [query, setQuery] = useState<string>(() => localStorage.getItem(STORAGE_KEY_UNSPLASH_QUERY) || "nature");

  const { intervalTime } = useSettingHandler();

  const saveImageUrl = async (targetQuery: string = query) => {
    const data = await getUnsplashRandomImageUrl({ query: targetQuery.trim() || undefined });
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
    setIsCustom(false);
  };

  useEffect(() => {
    const firstFetch = async () => {
      const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_BACKGROUND);
      if (custom) {
        setPhoto(custom);
        setIsCustom(true);
        return;
      }

      const session = sessionStorage.getItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED);
      if (!session) {
        sessionStorage.setItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED, "true");
        saveImageUrl();
      } else {
        const imageUrl = localStorage.getItem(STORAGE_KEY_IMAGE_CACHE);

        if (imageUrl) {
          setPhoto(imageUrl);
          setIsCustom(false);
        } else {
          sessionStorage.removeItem(COOKIE_KEY_INITIAL_LOAD_COMPLETED);
          localStorage.setItem(STORAGE_KEY_IMAGE_CACHE, photo || "");
        }
      }
    };
    firstFetch();
  }, [photo, query]);

  /**
   * 1秒ごとにフェッチ直後の時刻+インターバル時間と現在時刻を比較し、
   * 現在時刻がフェッチ直後の時刻+インターバル時間を超えていた場合、再フェッチを行う
   */
  useEffect(() => {
    const checkAndRefetch = () => {
      if (isCustom) return;

      const fetchTimestamp = localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP);
      if (!fetchTimestamp) return;

      const nextFetchTime = getNextFetchTime(intervalTime.state);

      if (Date.now() >= nextFetchTime) {
        saveImageUrl();
      } else {
        const timeout = nextFetchTime - Date.now();
        setTimeout(checkAndRefetch, timeout);
      }
    };
    const intervalId = setTimeout(checkAndRefetch, TIMER_UPDATE_INTERVAL);
    return () => clearTimeout(intervalId);
  }, [photo, intervalTime.state, isCustom, query]);

  const setCustomBackground = (dataUrl: string) => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_BACKGROUND, dataUrl);
    localStorage.removeItem(STORAGE_KEY_IMAGE_CACHE);
    setPhoto(dataUrl);
    setIsCustom(true);
  };

  const clearCustomBackground = () => {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_BACKGROUND);
    setIsCustom(false);
    saveImageUrl();
  };

  const changeQuery = (newQuery: string) => {
    localStorage.setItem(STORAGE_KEY_UNSPLASH_QUERY, newQuery);
    setQuery(newQuery);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_BACKGROUND);
    setIsCustom(false);
    saveImageUrl(newQuery);
  };

  return {
    photoUrl: photo,
    isCustom,
    query,
    setCustomBackground,
    clearCustomBackground,
    changeQuery,
  };
};
