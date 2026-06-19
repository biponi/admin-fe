import * as React from "react";

import { NavMain } from "./nav-main";
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
import { BRAND_CONFIG } from "../config/brand";
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
      items: item.items,
    }));

  return (
    <>
      <Sidebar
        variant='inset'
        {...props}
        className={`
    relative
    overflow-hidden`}>
        {/* Subtle top highlight line */}
        <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

        {/* ── Header ── */}
        <SidebarHeader className='px-3 py-5 border-b border-white/10'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size='lg'
                asChild
                className='bg-white/10 rounded-xl transition-all duration-200 group shadow-lg'>
                <Link
                  to='/dashboard'
                  className='flex items-center gap-3 px-2 py-1.5'>
                  <div className='flex aspect-square size-9 items-center justify-center rounded-xl bg-white backdrop-blur-sm ring-1 ring-white/30 shadow-lg '>
                    <img
                      src={BiponiMainLogo}
                      className='size-5'
                      alt='main-logo'
                    />
                  </div>
                  <div className='grid flex-1 text-left leading-tight'>
                    <span className='truncate font-semibold text-sm text-white drop-shadow-sm'>
                      {BRAND_CONFIG.name}
                    </span>
                    <span className='truncate text-[10px] font-medium text-white/60 uppercase tracking-widest'>
                      Management
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Content ── */}
        <SidebarContent className='px-2 py-3'>
          <NavMain items={filteredNavItems} />
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className='border-t border-white/10 px-3 pb-4 pt-2 space-y-1'>
          <div className='rounded-xl overflow-hidden'>
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
    </>
  );
}
