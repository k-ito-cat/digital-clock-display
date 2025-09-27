import React, { memo, ReactNode, useEffect } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCursor } from "~/hooks/useCursor";
import { UnsplashImageProvider } from "~/context/UnsplashImageContext";
import { useClockSettings } from "~/context/ClockSettingsContext";
import clsx from "clsx";

// TODO: type model
interface WrapperProps {
  children: ReactNode;
  setLimit: (limit: { requestLimit: number; requestRemaining: number }) => void;
}
export const ClockBgImage: React.FC<WrapperProps> = memo(
  ({ children, setLimit }) => {
    const { photoUrl, isCustom, setCustomBackground, clearCustomBackground, changeQuery, query } = useUnsplashImage({ setLimit });

    const { autoHideCursor } = useCursor();
    const { cursorHideSeconds, themeMode } = useClockSettings();

    useEffect(() => {
      autoHideCursor(true, cursorHideSeconds);
    }, [autoHideCursor, cursorHideSeconds, photoUrl]);

    return (
      <UnsplashImageProvider value={{ photoUrl, isCustom, setCustomBackground, clearCustomBackground, changeQuery, query }}>
        <div
          id="clock-bg-image"
          className={clsx(
            "flex h-[100dvh] w-full items-center justify-center bg-cover bg-center",
            themeMode === "dark" ? "theme-dark" : "theme-light"
          )}
          style={{ backgroundImage: `url(${photoUrl})` }}
          data-unsplash-query={query}
        >
          {children}
        </div>
      </UnsplashImageProvider>
    );
  },
);
