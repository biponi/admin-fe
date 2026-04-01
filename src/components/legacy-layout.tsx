import { ReactNode, useState } from "react";
import { TooltipProvider } from "./ui/tooltip";
import Navbar from "../coreComponents/navbar";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { MobileTopbar } from "./mobile-topbar";
import { MobileSheetNav } from "./mobile-sheet-nav";

interface LegacyLayoutProps {
  children: ReactNode;
}

export function LegacyLayout({ children }: LegacyLayoutProps) {
  const { user } = useLoginAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className='grid min-h-[70vh] w-full pl-0 sm:pl-[53px] sm:h-screen'>
        {!!user && (
          <>
            <MobileTopbar onMenuClick={() => setMobileNavOpen(true)} />
            <MobileSheetNav
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
            />
            <Navbar />
          </>
        )}
        <div>
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}