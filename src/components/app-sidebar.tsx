import * as React from "react";
// import { LifeBuoy } from "lucide-react";

import { NavMain } from "./nav-main";
// import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { navItems } from "../utils/navItem";
import { Link, useLocation } from "react-router-dom";
import { BiponiMainLogo } from "../utils/contents";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { SettingsPanel } from "./settings-panel";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const pathName = useLocation().pathname;

  const filteredNavItems = navItems
    .filter((nav) => nav.active && hasRequiredPermission(nav.id, "view"))
    .map((item) => ({
      title: item.title,
      url: item.link,
      icon: item.icon.type,
      isActive: pathName.includes(item.link),
    }));

  // const navSecondary = [
  //   {
  //     title: "Support",
  //     url: "#",
  //     icon: LifeBuoy,
  //   },
  // ];

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link to='/dashboard'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground'>
                  <img
                    src={BiponiMainLogo}
                    className='size-5'
                    alt='main-logo'
                  />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Prior Admin</span>
                  <span className='truncate text-xs'>Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
        {/* <NavSecondary items={navSecondary} className='mt-auto' /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className='p-1'>
          <SettingsPanel />
        </div>
        <NavUser
          user={
            user || {
              name: "Guest",
              email: "guest@example.com",
              avatar: "/default-avatar.png",
            }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
