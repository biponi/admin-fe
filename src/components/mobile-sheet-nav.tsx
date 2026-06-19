import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import { BRAND_CONFIG } from "../config/brand";
import BrandLogo from "../assets/Biponi-lg.png";
import { ChevronDown, ChevronRight, LogOut, Settings } from "lucide-react";
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

  const filteredNavItems = navItems.filter(
    (nav) => nav.active && hasRequiredPermission(nav.id, "view"),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathName]);

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
        <Button variant='ghost' size='icon' className='hidden' />
      </SheetTrigger>

      <SheetContent
        side='left'
        className={cn(
          "w-full p-0 gap-0 border-r-0 ",
          // Glass layer
          "bg-purple-500 backdrop-blur-2xl",
          // The solid purple gradient sits behind the blur
          "[&]:before:content-[''] [&]:before:absolute [&]:before:inset-0",
          "[&]:before:-z-10 [&]:before:bg-gradient-to-b",
          "[&]:before:from-purple-400 [&]:before:to-rose-700",
          // Subtle inner border
          "border-r border-white/20 shadow-[4px_0_32px_rgba(0,0,0,0.15)]",
        )}
        // Override shadcn default white bg
        style={{
          background:
            "linear-gradient(160deg, #38bdf8cc, #0ea5e9cc, #06b6d4cc)",
        }}>
        {/* Top highlight line */}
        <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent z-10' />

        {/* ── Header ── */}
        <SheetHeader className='px-5 pt-6 pb-4 border-b border-white/15'>
          <div className='flex items-center gap-3'>
            {/* Logo pill */}
            <div className='flex items-center justify-center size-11 rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm shadow-inner'>
              <img
                src={BrandLogo}
                className='size-7 object-contain'
                alt='logo'
              />
            </div>
            <div>
              <SheetTitle className='text-base font-semibold text-white tracking-tight'>
                {BRAND_CONFIG.shortName}
              </SheetTitle>
              <p className='text-[11px] text-white/55 uppercase tracking-widest font-medium mt-0.5'>
                Management
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* ── User Card ── */}
        <div className='px-4 py-3 border-b border-white/10'>
          <div className='flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm'>
            <Avatar className='size-10  shadow bg-white'>
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className='bg-white/30 text-white text-sm font-semibold backdrop-blur-sm'>
                {getInitialsWord(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-white truncate'>
                {user?.name || "User"}
              </p>
              <p className='text-[11px] text-white/55 truncate mt-0.5'>
                {user?.email || ""}
              </p>
            </div>
            {/* Settings shortcut */}
            <button
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
              className='flex items-center justify-center size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-150'>
              <Settings className='size-3.5' />
            </button>
          </div>
        </div>

        {/* ── Nav Label ── */}
        <div className='px-5 pt-4 pb-1'>
          <span className='text-[9px] font-semibold tracking-[0.18em] uppercase text-white/40'>
            Navigation
          </span>
        </div>

        {/* ── Nav Items ── */}
        <ScrollArea className='flex-1 h-[calc(100dvh-260px)] px-3'>
          <nav className='space-y-0.5 pb-4'>
            {filteredNavItems.map((item) => {
              const isActive = pathName.includes(item.link);
              const hasChildren = item.items && item.items.length > 0;
              const isExpanded = expandedMenus.includes(item.id);

              return (
                <div key={item.id}>
                  {/* Main nav item */}
                  <button
                    onClick={() => handleNavItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                      "relative",
                      isActive
                        ? [
                            "bg-white/20 text-white",
                            "ring-1 ring-white/25",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                          ]
                        : "text-white/65 hover:bg-white/10 hover:text-white",
                    )}>
                    {/* Active left bar */}
                    {isActive && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-white/80' />
                    )}

                    {/* Icon container */}
                    <span
                      className={cn(
                        "flex items-center justify-center size-8 rounded-xl shrink-0 transition-all duration-150",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/50 group-hover:text-white",
                      )}>
                      {/* item.icon is already a React element from navItems */}
                      <span className='[&_svg]:size-4'>{item.icon}</span>
                    </span>

                    <span className='flex-1 text-left truncate'>
                      {item.title}
                    </span>

                    {hasChildren ? (
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-white/40 transition-transform duration-200 shrink-0",
                          isExpanded && "rotate-180 text-white/70",
                        )}
                      />
                    ) : isActive ? (
                      <span className='size-1.5 rounded-full bg-white/60 shrink-0' />
                    ) : null}
                  </button>

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className='ml-4 mt-0.5 mb-1 pl-3 border-l border-white/15 space-y-0.5'>
                      {/* All parent link */}
                      <button
                        onClick={() => handleChildClick(item.link)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                          "transition-all duration-150 active:scale-[0.98] group",
                          pathName === item.link
                            ? "bg-white/15 text-white"
                            : "text-white/50 hover:bg-white/10 hover:text-white",
                        )}>
                        <ChevronRight className='size-3 shrink-0 transition-transform group-hover:translate-x-0.5 text-white/30' />
                        <span className='flex-1 text-left'>
                          All {item.title}
                        </span>
                      </button>

                      {/* Child items */}
                      {item.items.map((child: any) => {
                        const isChildActive = pathName.includes(child.url);
                        return (
                          <button
                            key={child.url}
                            onClick={() => handleChildClick(child.url)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                              "transition-all duration-150 active:scale-[0.98] group",
                              isChildActive
                                ? "bg-white/15 text-white"
                                : "text-white/50 hover:bg-white/10 hover:text-white",
                            )}>
                            <ChevronRight className='size-3 shrink-0 transition-transform group-hover:translate-x-0.5 text-white/30' />
                            <span className='flex-1 text-left'>
                              {child.title}
                            </span>
                            {isChildActive && (
                              <span className='size-1.5 rounded-full bg-white/60 shrink-0' />
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

        {/* ── Footer ── */}
        <div className='absolute bottom-0 inset-x-0 px-4 py-4 border-t border-white/10 bg-black/10 backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] text-white/35 font-medium'>
              © {new Date().getFullYear()} {BRAND_CONFIG.companyName}
            </p>
            <button
              className='flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors duration-150'
              onClick={() => {
                /* hook up logout */
              }}>
              <LogOut className='size-3' />
              Sign out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
