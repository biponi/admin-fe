import { ReactNode } from "react";
import { TooltipProvider } from "./ui/tooltip";
import Navbar from "../coreComponents/navbar";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface LegacyLayoutProps {
  children: ReactNode;
}

export function LegacyLayout({ children }: LegacyLayoutProps) {
  const { user } = useLoginAuth();

  return (
    <TooltipProvider>
      <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen pb-20 sm:pb-0'>
        {!!user && <Navbar />}
        <div className='pb-20 sm:pb-0'>
          {children}
        </div>
        {!!user && <MobileBottomNav />}
      </div>
    </TooltipProvider>
  );
}