import { ReactNode } from "react";
import SellerSidebar from "./seller-sidebar";
import { useIsMobile } from "@/hooks/use-mobile"; 

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <SellerSidebar isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}