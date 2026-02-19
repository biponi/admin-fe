"use client";

import { ChevronsUpDownIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
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

  // Create a state object to track open/closed state for each menu item
  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    const initialStates: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.isActive) {
        initialStates[item.title] = true;
      }
    });
    return initialStates;
  });

  const toggleItem = (title: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isOpen = openStates[item.title] || false;

          return (
            <SidebarMenuItem key={item.title}>
              {hasSubItems ? (
                // Menu item with nested items - use Collapsible with clickable button
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                  asChild>
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => {
                        // Toggle the collapse on button click
                        toggleItem(item.title);
                      }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className='data-[state=open]:rotate-90'>
                        <ChevronsUpDownIcon />
                        <span className='sr-only'>Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Add parent URL as first submenu item */}
                        <SidebarMenuSubItem className='cursor-pointer'>
                          <SidebarMenuSubButton
                            onClick={() => navigate(item.url)}>
                            <span>All {item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {/* Existing nested items */}
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            className='cursor-pointer'>
                            <SidebarMenuSubButton
                              onClick={() => navigate(subItem.url)}>
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ) : (
                // Menu item without nested items - simple link button
                <SidebarMenuButton
                  tooltip={item.title}
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
