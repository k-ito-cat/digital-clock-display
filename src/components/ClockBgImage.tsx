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
    const {
      cursorHideSeconds,
      themeMode,
      glassmorphismEnabled,
      surfaceBackgroundEnabled,
      backgroundType,
      backgroundColor,
      textColor,
    } = useClockSettings();

    useEffect(() => {
      autoHideCursor(true, cursorHideSeconds);
    }, [autoHideCursor, cursorHideSeconds, photoUrl]);

    const resolveMutedColor = (color: string) => {
      if (!color) return '';
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
        if (full.length === 6) {
          const r = parseInt(full.slice(0, 2), 16);
          const g = parseInt(full.slice(2, 4), 16);
          const b = parseInt(full.slice(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, 0.72)`;
        }
      }
      return color;
    };

    const normalizedTextColor = textColor.trim();
    const userTextMuted = normalizedTextColor ? resolveMutedColor(normalizedTextColor) : '';
    const normalizedBackgroundColor = backgroundColor.trim();
    const resolvedBackgroundColor =
      backgroundType === 'solid'
        ? normalizedBackgroundColor || '#ffffff'
        : backgroundType === 'white'
          ? '#ffffff'
          : backgroundType === 'black'
            ? '#000000'
            : backgroundType === 'transparent'
              ? 'transparent'
              : undefined;
    const backgroundImage = backgroundType === 'image' && photoUrl ? `url(${photoUrl})` : 'none';

    return (
      <UnsplashImageProvider value={{ photoUrl, isCustom, setCustomBackground, clearCustomBackground, changeQuery, query }}>
        <div
          id="clock-bg-image"
          className={clsx(
            "flex h-[100dvh] w-full items-center justify-center bg-cover bg-center",
            themeMode === "dark" ? "theme-dark" : "theme-light",
            glassmorphismEnabled ? "glass-enabled" : "glass-disabled",
            surfaceBackgroundEnabled ? "surface-background-on" : "surface-background-off"
          )}
          style={{
            backgroundImage,
            backgroundColor: resolvedBackgroundColor,
            ...(normalizedTextColor
              ? ({ ['--user-text-color' as string]: normalizedTextColor, ['--user-text-muted-color' as string]: userTextMuted } as React.CSSProperties)
              : {}),
          }}
          data-unsplash-query={query}
        >
          {children}
        </div>
      </UnsplashImageProvider>
    );
  },
);
