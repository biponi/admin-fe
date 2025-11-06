import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className='flex md:flex-1 flex-col gap-4  pt-0 max-h-[90vh] md:rounded-xl overflow-auto pb-20 sm:pb-4 z-20'>
          {children}
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
