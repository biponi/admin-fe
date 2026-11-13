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
      <SidebarMenu className='space-y-0.5'>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isOpen = openStates[item.title] || false;
          const isActive = pathname.startsWith(item.url);

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
                      isActive={isActive || isOpen}
                      className='text-white'
                      onClick={() => toggleItem(item.title)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>

                    {/* Chevron toggle — hidden in icon-only mode */}
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        className={cn(
                          "group-data-[collapsible=icon]:hidden",
                          "data-[state=open]:rotate-180 transition-transform duration-200",
                        )}>
                        <ChevronsUpDownIcon className='size-3.5' />
                        <span className='sr-only'>Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.url ||
                            pathname.startsWith(subItem.url + "/");
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                isActive={isSubActive}
                                onClick={() => navigate(subItem.url)}
                                className='cursor-pointer'>
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
                  isActive={isActive}
                  className='text-white'
                  onClick={() => navigate(item.url)}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
