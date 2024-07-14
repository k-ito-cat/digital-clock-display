import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full h-[100vh] flex items-center justify-center">
      <div>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
