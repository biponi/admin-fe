import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col gap-4 p-4 mx-2 pt-0 max-h-[90vh] rounded-xl overflow-auto'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
