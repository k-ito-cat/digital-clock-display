import { createContext, ReactNode, useContext } from 'react';

export type AppView = 'top' | 'pomodoro' | 'timer';

type ViewContextType = {
  view: AppView;
};

const ViewContext = createContext<ViewContextType>({ view: 'top' });

export const ViewProvider = ({ value, children }: { value: ViewContextType; children: ReactNode }) => {
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export const useViewContext = () => useContext(ViewContext);


