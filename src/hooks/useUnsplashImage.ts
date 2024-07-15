import { useEffect, useState } from "react";
import { getUnsplashImage } from "~/api/getUnsplashImage";
import { FETCH_INTERVAL } from "~/constants/intervalTime";

export const useUnsplashImage = async () => {
  // TODO: altなど他情報も取る
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const firstFetch = async () => {
      const SESSION_KEY = "fetch_expiry_time";
      const expiryTime = sessionStorage.getItem(SESSION_KEY);
      if (expiryTime) return;

      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
      setPhoto(await getUnsplashImage("nature"));
    };
    firstFetch();

    // 定期的な時間間隔で画像を更新する
    const intervalId = setInterval(async () => {
      setPhoto(await getUnsplashImage("nature"));
    }, FETCH_INTERVAL);

    () => clearInterval(intervalId);
  }, []);

  return photo;
};
