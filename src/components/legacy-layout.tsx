import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { TooltipProvider } from "./ui/tooltip";
import Navbar from "../coreComponents/navbar";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { MobileTopbar } from "./mobile-topbar";
import { MobileSheetNav } from "./mobile-sheet-nav";
import { MobileBottomTabs } from "./mobile/MobileBottomTabs";

interface LegacyLayoutProps {
  children: ReactNode;
}

export function LegacyLayout({ children }: LegacyLayoutProps) {
  const { user } = useLoginAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Reset the scroll container to top on navigation so a new page never
  // opens pre-scrolled.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className='flex h-svh w-full flex-col pl-0 md:grid md:min-h-[70vh] md:h-screen md:pl-[53px]'>
        {!!user && (
          <>
            <MobileTopbar onMenuClick={() => setMobileNavOpen(true)} />
            <MobileBottomTabs onMore={() => setMobileNavOpen(true)} />
            <MobileSheetNav
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
            />
            <Navbar />
          </>
        )}
        <div ref={scrollRef} className='flex min-h-0 flex-1 flex-col overflow-auto'>
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}