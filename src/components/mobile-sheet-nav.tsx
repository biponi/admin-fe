import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../utils/navItem";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { cn } from "../utils/functions";
import { BRAND_CONFIG } from "../config/brand";
import { BrandLogoSm as BrandLogo } from "../assets/brand";
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
import { useSettings } from "../contexts/SettingsContext";
import { useWeatherContext } from "../contexts/WeatherContext";
import { mapSceneWeather } from "../lib/weather-scene";
import { SidebarWeatherBackdrop } from "./weather/SidebarWeatherBackdrop";
import { WeatherScene } from "./weather/weather-scene";
import { WEATHER_THEMES } from "../config/weather-theme";
import { SettingsPanel } from "./settings-panel";

interface MobileSheetNavProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Neutral dark base for the mobile sheet. The old per-theme color map was
// removed along with the sidebar color theme — bright theme colors washed out
// the weather-themed backgrounds (image and animated). The weather backdrop
// layers render over this base.
const SHEET_BG = "bg-slate-900";

export function MobileSheetNav({
  open: controlledOpen,
  onOpenChange,
}: MobileSheetNavProps) {
  const { hasRequiredPermission } = useRoleCheck();
  const navigate = useNavigate();
  const pathName = useLocation().pathname;
  const { user } = useLoginAuth();
  const { sidebarWeatherStyle } = useSettings();
  const { period, condition, themeKey } = useWeatherContext();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const animatedWeather = sidebarWeatherStyle === "animated";
  const sceneWeather = mapSceneWeather(condition);

  // The sheet's ink follows the same token mechanism as the desktop sidebar:
  // text-* utilities resolve --sidebar-foreground, which index.scss pins from
  // the backdrop/scene's data-light-text attribute (white over dark art,
  // black in day/morning). This flag only drives the frost wash and the
  // scene's dark dimmer — white text over dark art needs the extra scrim,
  // black ink over a light scene/backdrop does not.
  const darkArt = themeKey ? WEATHER_THEMES[themeKey].darkText : true;

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

  const activeBgColor = SHEET_BG;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className='md:hidden'>
          <Button variant='ghost' size='icon' className='hidden' />
        </SheetTrigger>

        <SheetContent
          side='left'
          data-mobile-sheet
          className={cn(
            "w-full p-0 gap-0 border-r-0 shadow-2xl transition-colors duration-200",
            activeBgColor,
            "text-white",
          )}>
          {/* Weather-themed background. Two selectable styles (settings
              panel): the default crossfading image theme, or the animated CSS
              scene. Both render nothing until weather data loads. Text ink
              rides on --sidebar-foreground exactly like the desktop sidebar
              (index.scss pins it from data-light-text); the animated scene
              always composites dark, and the image backdrop only gets the
              dark frost when its art is dark. */}
          {animatedWeather && sceneWeather ? (
            <WeatherScene
              timeOfDay={period}
              weather={sceneWeather}
              className='weather-scene-dark'
            />
          ) : (
            !animatedWeather && (
              <>
                <SidebarWeatherBackdrop />
                {/* Dark readability scrim under the white ink over dark art.
                    Day/morning skip it — their light backdrop wash carries the
                    black ink instead. */}
                {darkArt && (
                  <div className='pointer-events-none absolute inset-0 bg-slate-900/45' />
                )}
              </>
            )
          )}

          {/* Top subtle highlight */}
          <div className='pointer-events-none absolute inset-x-0 top-0 h-px z-10 bg-sidebar-foreground/20' />

          {/* Content layer — sits above the weather backdrop. Text shadow
              matches the desktop sidebar's scene rules in index.scss. */}
          <div
            className='relative  flex h-full flex-col'
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,.45), 0 0 12px rgba(0,0,0,.3)",
            }}>
            {/* ── Header ── */}
            <SheetHeader className='px-5 pt-6 pb-4 border-b border-sidebar-foreground/15'>
              <div className='flex items-center gap-3'>
                {/* Logo pill */}
                <div className='flex items-center justify-center size-11 rounded-2xl bg-sidebar-foreground/20 ring-1 ring-sidebar-foreground/30 backdrop-blur-sm shadow-inner'>
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
            <div className='px-4 py-3 border-b border-sidebar-foreground/10'>
              <div className='flex items-center gap-3 px-3 py-3 rounded-2xl bg-sidebar-foreground/15 ring-1 ring-sidebar-foreground/20 backdrop-blur-sm'>
                <Avatar className='size-10  shadow bg-white'>
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className='bg-sidebar-foreground/30 text-white text-sm font-semibold backdrop-blur-sm'>
                    {getInitialsWord(user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-white   truncate'>
                    {user?.name || "User"}
                  </p>
                  <p className='text-[11px] text-white/55 truncate mt-0.5'>
                    {user?.email || ""}
                  </p>
                </div>
                {/* Settings shortcut */}
                <button
                  onClick={() => {
                    setSettingsOpen(true);
                  }}
                  className='flex items-center justify-center size-8 rounded-xl bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 text-white/60 hover:text-white transition-all duration-150'>
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
              <nav className='space-y-0.5 pb-16'>
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
                                "bg-sidebar-foreground/20 text-white",
                                "ring-1 ring-sidebar-foreground/25",
                                "shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                              ]
                            : "text-white/65 hover:bg-sidebar-foreground/10 hover:text-white",
                        )}>
                        {/* Active left bar */}
                        {isActive && (
                          <span className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-foreground/80' />
                        )}

                        {/* Icon container */}
                        <span
                          className={cn(
                            "flex items-center justify-center size-8 rounded-xl shrink-0 transition-all duration-150",
                            isActive
                              ? "bg-sidebar-foreground/20 text-white"
                              : "bg-sidebar-foreground/10 text-white/50 group-hover:text-white",
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
                          <span className='size-1.5 rounded-full bg-sidebar-foreground/60 shrink-0' />
                        ) : null}
                      </button>

                      {/* Submenu */}
                      {hasChildren && isExpanded && (
                        <div className='ml-4 mt-0.5 mb-1 pl-3 border-l border-sidebar-foreground/15 space-y-0.5'>
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
                                    ? "bg-sidebar-foreground/15 text-white"
                                    : "text-white/50 hover:bg-sidebar-foreground/10 hover:text-white",
                                )}>
                                <ChevronRight className='size-3 shrink-0 transition-transform group-hover:translate-x-0.5 text-white/30' />
                                <span className='flex-1 text-left'>
                                  {child.title}
                                </span>
                                {isChildActive && (
                                  <span className='size-1.5 rounded-full bg-sidebar-foreground/60 shrink-0' />
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
          </div>

          {/* ── Footer ── */}
          <div className='absolute bottom-0 inset-x-0 px-4 py-4 border-t bg-black/10 backdrop-blur-sm border-sidebar-foreground/10'>
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

      {/* Mobile Settings Modal */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
