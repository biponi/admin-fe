import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import BrandLogo from "../assets/Biponi-lg.png";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitialsWord } from "../utils/functions";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";

interface MobileSheetNavProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileSheetNav({
  open: controlledOpen,
  onOpenChange,
}: MobileSheetNavProps) {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;
  const { user } = useLoginAuth();

  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter(
    (nav) => nav.active && hasRequiredPermission(nav.id, "view"),
  );

  // Close sheet when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathName, setOpen]);

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleNavItemClick = (item: any) => {
    if (item.items && item.items.length > 0) {
      toggleSubmenu(item.id);
    } else {
      navigate(item.link);
      setOpen(false);
    }
  };

  const handleChildClick = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className='sm:hidden'>
        <Button variant='ghost' size='icon' className='hidden'>
          {/* This trigger is hidden - the topbar button controls the sheet */}
        </Button>
      </SheetTrigger>
      <SheetContent
        side='left'
        className='w-full sm:w-[350px] p-0 gap-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black'>
        {/* Header */}
        <SheetHeader className='p-6 pb-4 border-b border-border/40'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <img
                src={BrandLogo}
                className='h-10 w-auto bg-white dark:bg-gray-800 rounded-lg p-1'
                alt='logo'
              />
              <div>
                <SheetTitle className='text-lg font-bold'>Biponi</SheetTitle>
                <p className='text-xs text-muted-foreground'>
                  {user?.name || "Welcome"}
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* User Info Card */}
        <div className='p-4'>
          <div className='flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-border/40 shadow-sm'>
            <Avatar className='h-10 w-10'>
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className='bg-primary text-primary-foreground text-sm font-semibold'>
                {getInitialsWord(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>
                {user?.name || "User"}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Menu */}
        <ScrollArea className='flex-1 h-[calc(100vh-240px)]'>
          <nav className='p-4 space-y-1'>
            {filteredNavItems.map((item) => {
              const isActive = pathName.includes(item.link);
              const hasChildren = item.items && item.items.length > 0;
              const isExpanded = expandedMenus.includes(item.id);

              return (
                <div key={item.id}>
                  {/* Main Item */}
                  <button
                    onClick={() => handleNavItemClick(item)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 active:scale-[0.98]",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                    )}>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-lg transition-all",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-accent text-accent-foreground/70",
                        )}>
                        {item.icon}
                      </div>
                      <span className='font-medium text-sm'>{item.title}</span>
                    </div>

                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    )}
                  </button>

                  {/* Nested/Dropdown Items */}
                  {hasChildren && isExpanded && (
                    <div className='ml-8 mt-1 mb-2 space-y-1 border-l-2 border-primary/30 pl-2 animate-in slide-in-from-top-2 duration-200'>
                      {/* Parent link as first item */}
                      <button
                        onClick={() => handleChildClick(item.link)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-200 text-sm active:scale-[0.98] group",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}>
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/50",
                          )}
                        />
                        <span className='flex-1 text-left'>
                          All {item.title}
                        </span>
                        {isActive && (
                          <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                        )}
                      </button>

                      {/* Child items */}
                      {item.items.map((child: any) => {
                        const isChildActive = pathName.includes(child.url);
                        return (
                          <button
                            key={child.url}
                            onClick={() => handleChildClick(child.url)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-200 text-sm active:scale-[0.98] group",
                              isChildActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5",
                                isChildActive
                                  ? "text-primary"
                                  : "text-muted-foreground/50",
                              )}
                            />
                            <span className='flex-1 text-left'>
                              {child.title}
                            </span>
                            {isChildActive && (
                              <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className='p-4 border-t border-border/40 bg-background/50'>
          <div className='text-xs text-center text-muted-foreground'>
            <p>Biponi Admin Panel</p>
            <p className='mt-1'>
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
