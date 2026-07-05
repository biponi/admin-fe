"use client";

import { ChevronsUpDownIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.isActive) initial[item.title] = true;
    });
    return initial;
  });

  const toggleItem = (title: string) => {
    setOpenStates((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <SidebarGroup className='px-0'>
      <SidebarMenu className='space-y-0.5 '>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isOpen = openStates[item.title] || false;
          const isActive = pathname.startsWith(item.url);

          const buttonBase = cn(
            "group relative flex items-center gap-3 px-3 py-3 rounded-md w-full ",
            "text-sm font-medium transition-all duration-150",
          );

          const buttonActive = cn(
            "bg-white/20 text-white",
            "ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
          );

          const buttonIdle = cn(
            "text-white/70 hover:bg-white/10 hover:text-white",
          );

          return (
            <SidebarMenuItem key={item.title}>
              {hasSubItems ? (
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                  asChild>
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => toggleItem(item.title)}
                      className={cn(
                        buttonBase,
                        isActive || isOpen ? buttonActive : buttonIdle,
                      )}>
                      {/* Active indicator */}
                      {(isActive || isOpen) && (
                        <span className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-white/80' />
                      )}

                      <span
                        className={cn(
                          "flex items-center justify-center size-7 rounded-lg shrink-0 transition-colors duration-150",
                          isActive || isOpen
                            ? "bg-white/15 text-white"
                            : "text-white/50 group-hover:text-white/80",
                        )}>
                        <item.icon className='size-4 text-sidebar-accent-foreground' />
                      </span>

                      <span className='flex-1 truncate '>{item.title}</span>
                    </SidebarMenuButton>

                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        className={cn(
                          "top-2.5 right-2 size-6 rounded-lg transition-all duration-200",
                          "text-white/40 hover:text-white hover:bg-white/10",
                          "data-[state=open]:rotate-180 data-[state=open]:text-white/70",
                        )}>
                        <ChevronsUpDownIcon className='size-3.5' />
                        <span className='sr-only'>Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className='ml-4 mt-0.5 border-l border-white/15 pl-3 space-y-0.5'>
                        {/* All parent link */}
                        {/* <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate(item.url)}
                            className={cn(
                              "rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer w-full",
                              pathname === item.url
                                ? "bg-white/15 text-white"
                                : "text-white/50 hover:bg-white/10 hover:text-white",
                            )}>
                            All {item.title}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem> */}

                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                onClick={() => navigate(subItem.url)}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer w-full",
                                  isSubActive
                                    ? "bg-white/15 text-white"
                                    : "text-white/50 hover:bg-white/10 hover:text-white",
                                )}>
                                {isSubActive && (
                                  <span className='mr-2 inline-block size-1 rounded-full bg-white/70 align-middle' />
                                )}
                                {subItem.title}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => navigate(item.url)}
                  className={cn(
                    buttonBase,
                    isActive ? buttonActive : buttonIdle,
                  )}>
                  {isActive && (
                    <span className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-white/80' />
                  )}

                  <span
                    className={cn(
                      "flex items-center justify-center size-7 rounded-md shrink-0 transition-colors duration-150 text-sidebar-accent-foreground",
                      isActive
                        ? " text-white"
                        : "text-white/50 group-hover:text-white/80",
                    )}>
                    <item.icon className='size-4 text-sidebar-accent-foreground' />
                  </span>

                  <span className='flex-1 truncate text-sidebar-accent-foreground'>
                    {item.title}
                  </span>

                  {isActive && (
                    <span className='size-1.5 rounded-full bg-white/50 shrink-0' />
                  )}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
