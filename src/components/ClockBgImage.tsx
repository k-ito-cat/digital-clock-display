import React, { memo, ReactNode, useEffect, useState } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCursor } from "~/hooks/useCursor";

interface WrapperProps {
  children: ReactNode;
  intervalTime: number;
}
export const ClockBgImage: React.FC<WrapperProps> = memo(
  ({ children, intervalTime }) => {
    const photoUrl = useUnsplashImage(intervalTime);
    const [photo, setPhoto] = useState<string | null>(null);

    const { autoHideCursor } = useCursor();

    useEffect(() => {
      setPhoto(photoUrl);

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
  },
);
