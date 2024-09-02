import React, { ReactNode, useEffect, useState } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCursor } from "~/hooks/useCursor";

interface WrapperProps {
  children: ReactNode;
}
export const ClockBgImage: React.FC<WrapperProps> = ({ children }) => {
  const photoUrl = useUnsplashImage();
  const [photo, setPhoto] = useState<string | null>(null);

  const { autoHideCursor } = useCursor();

  useEffect(() => {
    const getPhoto = async () => {
      setPhoto(await photoUrl);
    };
    getPhoto();

    const setting = false; // これは設定値のモック
    // TODO: 設定値を取得して動的にすること（有効/無効, インターバル秒数）
    autoHideCursor(setting, 3);
  }, [photoUrl]);

  return (
    <div
      id="clock-bg-image"
      className={
        "flex h-[100vh] w-full items-center justify-center bg-cover bg-center"
      }
      style={{ backgroundImage: `url(${photo})` }}
    >
      {children}
    </div>
  );
};
