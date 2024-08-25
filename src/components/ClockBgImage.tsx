import React, { ReactNode, useEffect, useState } from "react";
import { useUnsplashImage } from "~/hooks/useUnsplashImage";

interface WrapperProps {
  children: ReactNode;
}
export const ClockBgImage: React.FC<WrapperProps> = ({ children }) => {
  const photoUrl = useUnsplashImage();
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const getPhoto = async () => {
      setPhoto(await photoUrl);
    };
    getPhoto();
  }, [photoUrl]);

  return (
    <div
      className={
        "flex h-[100vh] w-full items-center justify-center bg-cover bg-center"
      }
      style={{ backgroundImage: `url(${photo})` }}
    >
      {children}
    </div>
  );
};
