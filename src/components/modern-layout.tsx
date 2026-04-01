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
        <MobileSheetNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
        />
        <SiteHeader />
        <div className='flex md:flex-1 flex-col gap-4  pt-0 max-h-[90vh] md:rounded-xl overflow-auto z-20'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
