import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { MobileTopbar } from "./mobile-topbar";
import { MobileSheetNav } from "./mobile-sheet-nav";

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <MobileSheetNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <SiteHeader />
        <div className='flex md:flex-1 flex-col gap-4 pt-0  overflow-auto z-20 max-h-[90vh] scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400/20 scrollbar-track-gray-100/0 rounded-lg'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
