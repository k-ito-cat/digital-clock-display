import { createContext, ReactNode, useContext } from 'react';

export type AppView = 'clock' | 'pomodoro' | 'timer';

type ViewContextType = {
  view: AppView;
};

const ViewContext = createContext<ViewContextType>({ view: 'clock' });

export const ViewProvider = ({ value, children }: { value: ViewContextType; children: ReactNode }) => {
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useViewContext = () => useContext(ViewContext);


