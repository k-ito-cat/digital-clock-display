import { createContext, ReactNode, useContext } from 'react';

type UnsplashImageContextType = {
  photoUrl: string | null;
};

const UnsplashImageContext = createContext<UnsplashImageContextType>({ photoUrl: null });

export const UnsplashImageProvider = ({ value, children }: { value: UnsplashImageContextType; children: ReactNode }) => {
  return <UnsplashImageContext.Provider value={value}>{children}</UnsplashImageContext.Provider>;
};

export const useUnsplashImageContext = () => useContext(UnsplashImageContext);


