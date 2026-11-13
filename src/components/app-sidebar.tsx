import * as React from "react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { navItems } from "../utils/navItem";
import { useLocation } from "react-router-dom";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { SidebarWeatherBackdrop } from "./weather/SidebarWeatherBackdrop";
import { WeatherScene } from "./weather/weather-scene";
import { SidebarWeatherInfo } from "./weather/sidebar-weather-info";
import { useSettings } from "../contexts/SettingsContext";
import { useWeatherContext } from "../contexts/WeatherContext";
import { mapSceneWeather } from "../lib/weather-scene";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const pathName = useLocation().pathname;
  const { sidebarWeatherStyle } = useSettings();
  const { period, condition } = useWeatherContext();

  const animated = sidebarWeatherStyle === "animated";
  const sceneWeather = mapSceneWeather(condition);

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
    <Sidebar collapsible='icon' {...props}>
      {/* Weather-themed sidebar background. Two selectable styles (settings
          panel): the default crossfading image theme, or the animated CSS
          scene. Both render nothing until weather data loads. */}
      {animated && sceneWeather ? (
        <WeatherScene timeOfDay={period} weather={sceneWeather} />
      ) : (
        !animated && <SidebarWeatherBackdrop />
      )}

      {/* Subtle modern geometric background art pattern (image theme only —
          the animated scene has its own sky) */}
      {!animated && (
        <>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-0 opacity-[0.035] dark:opacity-[0.06] [background-image:radial-gradient(hsl(var(--sidebar-foreground))_1px,transparent_1px)] [background-size:16px_16px]'
          />
          {/* Gentle ambient gradient glow in the top corner */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-16 -left-16 z-0 size-48 rounded-full bg-sidebar-primary/10 blur-3xl'
          />
        </>
      )}

      {/* ── Header ── */}
      <SidebarHeader className='relative z-10 group-data-[collapsible=icon]:p-2 px-3 py-3'>
        <TeamSwitcher />
      </SidebarHeader>

      <div className='w-full flex px-2 justify-center items-center  h-[1px] z-20'>
        <div className='w-full h-full bg-sidebar-border/40' />
      </div>

      {/* ── Nav ── */}
      <SidebarContent className='relative z-10 px-2 py-1'>
        <NavMain items={filteredNavItems} />
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className='relative z-10 group-data-[collapsible=icon]:p-2 px-3 py-3 border-t border-sidebar-border/40'>
        {/* Weather info block (animated scene mode only) */}
        {/* {animated && <SidebarWeatherInfo className='mb-2' />} */}
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

      {/* Click the edge strip to collapse/expand */}
    </Sidebar>
  );
}
