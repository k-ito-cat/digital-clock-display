import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-[100vh] w-full items-center justify-center">
      {children}
    </div>
  );
};

export default Layout;
