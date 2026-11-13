"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { BRAND_CONFIG } from "../config/brand";
import { BrandLogo } from "../assets/brand";

const teams = [
  {
    name: BRAND_CONFIG.name,
    logo: BrandLogo,
    plan: "Management",
  },
];

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              {/* Logo icon — always visible */}
              <div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-sidebar-primary-foreground'>
                <img
                  src={activeTeam.logo}
                  className='size-5 object-contain'
                  alt={activeTeam.name}
                />
              </div>

              {/* Text — hidden in icon-only mode */}
              <div className='grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold text-sm text-white'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs text-white'>
                  {activeTeam.plan}
                </span>
              </div>

              <ChevronsUpDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden text-white' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl'
            align='start'
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}>
            <DropdownMenuLabel className='text-xs text-muted-foreground px-2 py-1.5'>
              Workspace
            </DropdownMenuLabel>

            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className='gap-2 p-2 rounded-lg'>
                <div className='flex size-6 items-center justify-center rounded-md border bg-background shadow-sm'>
                  <img
                    src={team.logo}
                    className='size-4 shrink-0 object-contain'
                    alt={team.name}
                  />
                </div>
                <span className='font-medium text-sm'>{team.name}</span>
                {activeTeam.name === team.name && (
                  <Check className='ml-auto size-3.5 text-primary' />
                )}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
