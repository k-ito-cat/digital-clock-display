import React, { memo, ReactNode, useEffect } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCursor } from "~/hooks/useCursor";

interface WrapperProps {
  children: ReactNode;
  intervalTime: number;
  setLimit: (limit: { requestLimit: number; requestRemaining: number }) => void;
}
export const ClockBgImage: React.FC<WrapperProps> = memo(
  ({ children, intervalTime, setLimit }) => {
    const { photoUrl } = useUnsplashImage({ intervalTime, setLimit });

    const { autoHideCursor } = useCursor();

    useEffect(() => {
      const setting = true; // これは設定値のモック
      // TODO: 設定値を取得して動的にすること（有効/無効, インターバル秒数）
      autoHideCursor(setting, 3);
    }, [autoHideCursor, photoUrl]);

    return (
      <div
        id="clock-bg-image"
        className={
          "flex h-[100dvh] w-full items-center justify-center bg-cover bg-center"
        }
        style={{ backgroundImage: `url(${photoUrl})` }}
      >
        {children}
      </div>
    );
  },
);
