"use client";

import {
  BadgeCheck,
  Bell,
  Code,
  LogOut,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { ComponentPlaceholderIcon } from "@radix-ui/react-icons";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import { useNavigate } from "react-router-dom";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { signOut } = useLoginAuth();
  const navigate = useNavigate();

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              {/* Avatar — always visible including icon-only mode */}
              <Avatar className='h-8 w-8 rounded-lg shrink-0'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-lg text-xs font-semibold'>
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Text — hidden in icon-only mode */}
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate text-white font-semibold'>
                  {user.name}
                </span>
                <span className='truncate text-white text-xs'>
                  {user.email}
                </span>
              </div>

              <ChevronsUpDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl'
            side={isMobile ? "bottom" : "right"}
            align='end'
            sideOffset={4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg text-xs font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className='hidden'>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>

              {useRoleCheck().hasRequiredPermission(
                "settings",
                "jobs_management",
              ) && (
                <DropdownMenuItem onClick={() => navigate("/settings/jobs")}>
                  <Code />
                  Actions
                </DropdownMenuItem>
              )}

              {useRoleCheck().hasRequiredPermission(
                "settings",
                "locations_management",
              ) && (
                <DropdownMenuItem
                  onClick={() => navigate("/settings/locations")}>
                  <MapPin />
                  Locations
                </DropdownMenuItem>
              )}

              {useRoleCheck().hasRequiredPermission(
                "settings",
                "prepayment_management",
              ) && (
                <DropdownMenuItem
                  onClick={() => navigate("/settings/prepayment-rules")}>
                  <Wallet />
                  Prepayment Rules
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className='hidden'>
                <ComponentPlaceholderIcon />
                Billing
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
