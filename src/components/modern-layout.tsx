import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { MobileTopbar } from "./mobile-topbar";
import { MobileSheetNav } from "./mobile-sheet-nav";
// import { MobileBottomTabs } from "./mobile/MobileBottomTabs";

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // The scroll container persists across route changes — reset to top on
  // navigation so a new page never opens pre-scrolled.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-neutral-100'>
        {/* Mobile: Topbar, Bottom Tabs & Sheet Nav */}
        <MobileTopbar onMenuClick={() => setMobileNavOpen(true)} />
        {/* <MobileBottomTabs onMore={() => setMobileNavOpen(true)} /> */}
        <MobileSheetNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

        {/* Desktop: SiteHeader */}
        <SiteHeader />

        <div
          ref={scrollRef}
          className='flex flex-1 min-h-0 flex-col gap-4 pt-0 overflow-auto z-20 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400/20 scrollbar-track-gray-100/0'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
