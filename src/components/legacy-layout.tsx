import { ReactNode } from "react";
import { TooltipProvider } from "./ui/tooltip";
import Navbar from "../coreComponents/navbar";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";

interface LegacyLayoutProps {
  children: ReactNode;
}

export function LegacyLayout({ children }: LegacyLayoutProps) {
  const { user } = useLoginAuth();

  return (
    <TooltipProvider>
      <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen'>
        {!!user && <Navbar />}
        {children}
      </div>
    </TooltipProvider>
  );
}