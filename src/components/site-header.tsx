import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { SidebarTrigger } from "./ui/sidebar";
import { navItems } from "../utils/navItem";
import { useLocation } from "react-router-dom";

import { usePageTitle } from "../contexts/PageContext";

import { hasPagePermission } from "../utils/helperFunction";
import { useSelector } from "react-redux";
import NotificationBell from "../notification/NotificationBell";
import { useState } from "react";
import { Settings, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { SettingsPanel } from "./settings-panel";
import AssistantSheet from "./assistant/AssistantSheet";
import { HeaderDateTimeWeather } from "./HeaderDateTimeWeather";
import { Oneko, getOnekoCritter } from "./oneko";
import { useSettings } from "../contexts/SettingsContext";
//import topBarBg from "../assets/top-bar-bg.jpg";

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const { pageTitle } = usePageTitle();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { onekoEnabled, setOnekoEnabled, onekoCat, onekoSpeed, onekoFriend } =
    useSettings();

  const pathName = useLocation().pathname;
  const userState = useSelector((state: any) => state?.user);

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathName
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs = [];

    if (pathSegments.length === 0 || pathName === "/dashboard") {
      return [{ title: "Dashboard", href: "/dashboard" }];
    }

    // Find matching nav item
    const currentNavItem = navItems.find((item) =>
      pathName.includes(item.link),
    );
    if (currentNavItem) {
      breadcrumbs.push({ title: "Dashboard", href: "/dashboard" });
      breadcrumbs.push({
        title: currentNavItem.title,
        href: currentNavItem.link,
      });

      // Add custom title if provided (from context or props)
      // const currentTitle = title || pageTitle;
      // if (currentTitle && currentTitle !== currentNavItem.title && currentTitle !== 'Dashboard') {
      //   breadcrumbs.push({ title: currentTitle, href: pathName });
      // }
    } else {
      breadcrumbs.push({ title: "Dashboard", href: "/dashboard" });
      const currentTitle = title || pageTitle;
      if (currentTitle && currentTitle !== "Dashboard") {
        breadcrumbs.push({ title: currentTitle, href: pathName });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <>
      {/* ── Desktop header bar ── */}
      <header
        data-light-text='true'
        className={`hidden md:flex sticky  top-0 z-40 h-16 shrink-0 items-center gap-2 border-b shadow-sm
                         border-white/20 bg-white overflow-hidden
                         transition-[width,height] ease-linear
                         group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:mb-2 `}>
        {/* Static night-landscape backdrop — replaces the animated weather
            scene on desktop; no animation by design. */}
        {/* <div
          aria-hidden='true'
          className='absolute inset-0 z-0 bg-cover bg-center'
          style={{ backgroundImage: `url(${topBarBg})` }}
        /> */}

        {/* Left: sidebar trigger + breadcrumbs (above the backdrop) */}
        <div className='relative z-10 flex flex-1 items-center gap-2 px-4 overflow-hidden'>
          <SidebarTrigger className='-ml-1 shrink-0 text-gray-900' />
          <Separator
            orientation='vertical'
            className='mr-2 h-4 hidden sm:block text-gray-900'
          />

          {/* Breadcrumbs */}
          <Breadcrumb className='hidden sm:flex bg-white/20  overflow-hidden text-xs px-6 py-2  rounded-2xl border border-white/20'>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className='flex items-center gap-2'>
                  {index > 0 && (
                    <BreadcrumbSeparator className='hidden md:block' />
                  )}
                  <BreadcrumbItem className='hidden text-gray-800 md:block'>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: date/time/weather + settings + notification (above the
            backdrop) */}
        <div className='relative z-10 flex items-center gap-1.5 px-3'>
          {/* Date, Time & Temperature badge */}
          <HeaderDateTimeWeather />

          <div className='relative group/settings'>
            <div className='absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0  ' />
            {/* Settings trigger */}
            <ButtonGroup className=' shadow rounded-2xl border border-gray-200'>
              {/* Oneko cat toggle — spawns the cursor-chasing cat */}
              <Button
                variant='secondary'
                size='icon'
                onClick={() => setOnekoEnabled(!onekoEnabled)}
                aria-pressed={onekoEnabled}
                className='relative h-9 w-9 rounded-2xl text-muted-foreground bg-transparent hover:text-gray-500 hover:bg-white/20'>
                <span
                  aria-hidden='true'
                  className='pointer-events-none block h-5 w-5'
                  style={{
                    backgroundImage: `url(${getOnekoCritter(onekoCat).sprite})`,
                    backgroundSize: "160px 80px",
                    backgroundPosition: onekoEnabled
                      ? "-140px -60px" // alert frame while chasing
                      : "-60px -60px", // idle sitting frame
                    imageRendering: "pixelated",
                    filter: getOnekoCritter(onekoCat).filter ?? "none",
                  }}
                />
                <span className='sr-only'>
                  {onekoEnabled ? "Dismiss the cat" : "Release the cat"}
                </span>
              </Button>
              <ButtonGroupSeparator className='bg-gray-100' />
              <Button
                variant='secondary'
                size='icon'
                onClick={() => setSettingsOpen(true)}
                className='relative h-9 w-9 rounded-2xl text-gray-900/80 bg-transparent hover:text-gray-500 hover:bg-white/20'>
                <Settings className='h-[18px] w-[18px] ' />
                <span className='sr-only'>Open settings</span>
              </Button>
              <ButtonGroupSeparator className='bg-gray-100' />
              {/* AI Assistant quick panel */}
              {hasPagePermission(
                "assistant",
                "view",
                userState?.permissions,
              ) && (
                <Button
                  variant='secondary'
                  size='icon'
                  onClick={() => setAssistantOpen(true)}
                  className='relative h-9 w-9 rounded-2xl text-gray-900/80 bg-transparent hover:text-gray-500 hover:bg-white/20'>
                  <Sparkles className='h-[18px] w-[18px] ' />
                  <span className='sr-only'>Open AI Assistant</span>
                </Button>
              )}
              <ButtonGroupSeparator className='bg-gray-100' />
              {/* Notification bell (renders its own button + portaled panel) */}
              {hasPagePermission(
                "notifications",
                "view",
                userState?.permissions,
              ) && (
                <NotificationBell
                  size='md'
                  variant='ghost'
                  className='rounded-2xl text-gray-900/80 hover:text-gray-500 hover:bg-white/20'
                />
              )}
            </ButtonGroup>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* AI Assistant quick panel */}
      <AssistantSheet open={assistantOpen} onOpenChange={setAssistantOpen} />

      {/* The critter(s) themselves (fixed-position, appended to body when active) */}
      <Oneko
        active={onekoEnabled}
        cat={onekoCat}
        speed={onekoSpeed}
        friend={onekoFriend}
      />
    </>
  );
}
