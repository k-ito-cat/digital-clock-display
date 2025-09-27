import { createContext, ReactNode, useContext } from 'react';

type UnsplashImageContextType = {
  photoUrl: string | null;
  isCustom: boolean;
  query: string;
  setCustomBackground: (dataUrl: string) => void;
  clearCustomBackground: () => void;
  changeQuery: (query: string) => void;
};

const defaultContext: UnsplashImageContextType = {
  photoUrl: null,
  isCustom: false,
  query: 'nature',
  setCustomBackground: () => undefined,
  clearCustomBackground: () => undefined,
  changeQuery: () => undefined,
};

const UnsplashImageContext = createContext<UnsplashImageContextType>(defaultContext);

export const UnsplashImageProvider = ({ value, children }: { value: UnsplashImageContextType; children: ReactNode }) => {
  return <UnsplashImageContext.Provider value={value}>{children}</UnsplashImageContext.Provider>;
};

export const useUnsplashImageContext = () => useContext(UnsplashImageContext);


