import React, { memo, ReactNode, useEffect } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCursor } from "~/hooks/useCursor";
import { UnsplashImageProvider } from "~/context/UnsplashImageContext";

// TODO: type model
interface WrapperProps {
  children: ReactNode;
  setLimit: (limit: { requestLimit: number; requestRemaining: number }) => void;
}
export const ClockBgImage: React.FC<WrapperProps> = memo(
  ({ children, setLimit }) => {
    const { photoUrl } = useUnsplashImage({ setLimit });

    const { autoHideCursor } = useCursor();

    useEffect(() => {
      const setting = true; // これは設定値のモック
      // TODO: 設定値を取得して動的にすること（有効/無効, インターバル秒数）
      autoHideCursor(setting, 3);
    }, [autoHideCursor, photoUrl]);

    return (
      <UnsplashImageProvider value={{ photoUrl }}>
        <div
          id="clock-bg-image"
          className={
            "flex h-[100dvh] w-full items-center justify-center bg-cover bg-center"
          }
          style={{ backgroundImage: `url(${photoUrl})` }}
        >
          {children}
        </div>
      </UnsplashImageProvider>
    );
  },
);
