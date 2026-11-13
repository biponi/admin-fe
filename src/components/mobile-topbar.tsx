import { Bell, BellRing, Code, Menu, Settings, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { BRAND_CONFIG } from "../config/brand";
import { BrandLogoSm as BrandLogo } from "../assets/brand";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getInitialsWord } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import useLoginAuth from "../pages/auth/hooks/useLoginAuth";
import useRoleCheck from "../pages/auth/hooks/useRoleCheck";
import { useState } from "react";
import { rippleProps } from "./mobile/use-ripple";
import { useNotifications } from "../notification/useNotifications";
import { Badge } from "./ui/badge";
import { SettingsPanel } from "./settings-panel";
import { TopBarWeatherOverlay } from "./weather/TopBarWeatherOverlay";

interface MobileTopbarProps {
  onMenuClick: () => void;
}

export function MobileTopbar({ onMenuClick }: MobileTopbarProps) {
  const { user } = useLoginAuth();
  const navigate = useNavigate();
  const { signOut } = useLoginAuth();
  const { unreadCount } = useNotifications();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:hidden'>
      {/* Weather-themed animated background; renders nothing until data loads */}
      <TopBarWeatherOverlay />

      {/* Hamburger Menu Button */}
      <Button
        variant='ghost'
        size='icon'
        onClick={onMenuClick}
        className='m3-ripple shrink-0 h-10 w-10 rounded-full hover:bg-muted'
        {...rippleProps()}>
        <Menu className='h-5 w-5' />
        <span className='sr-only'>Toggle navigation menu</span>
      </Button>

      {/* Brand Logo */}
      <div className='flex items-center gap-2 flex-1 min-w-0'>
        <img
          src={BrandLogo}
          className='h-8 w-auto shrink-0'
          alt={`${BRAND_CONFIG.shortName} Logo`}
        />
        <span className='font-semibold text-lg truncate'>{BRAND_CONFIG.shortName}</span>
      </div>

      {/* Right Actions: Notification Bell + User Avatar */}
      <div className='flex items-center gap-2 shrink-0'>
        {/* Bell Icon Button -> takes to /notifications on click */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate("/notifications")}
          className='m3-ripple relative h-10 w-10 rounded-full hover:bg-muted text-foreground'
          aria-label='Notifications'
          {...rippleProps()}>
          {unreadCount > 0 ? (
            <BellRing className='h-5 w-5 text-primary' />
          ) : (
            <Bell className='h-5 w-5 text-muted-foreground' />
          )}

          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 p-0 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm'>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className='h-10 w-10 border border-border cursor-pointer'>
              {user?.avatar ? (
                <AvatarImage src={user?.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className='bg-primary text-primary-foreground text-sm font-semibold'>
                {getInitialsWord(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              My Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => setSettingsOpen(true)}>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>

            {useRoleCheck().hasRequiredPermission(
              "settings",
              "jobs_management",
            ) && (
              <DropdownMenuItem onClick={() => navigate("/settings/jobs")}>
                <Code className='mr-2 h-4 w-4' />
                Actions
              </DropdownMenuItem>
            )}

            {useRoleCheck().hasRequiredPermission(
              "settings",
              "locations_management",
            ) && (
              <DropdownMenuItem onClick={() => navigate("/settings/locations")}>
                Locations
              </DropdownMenuItem>
            )}

            {useRoleCheck().hasRequiredPermission(
              "settings",
              "prepayment_management",
            ) && (
              <DropdownMenuItem onClick={() => navigate("/settings/prepayment-rules")}>
                <Wallet className='mr-2 h-4 w-4' />
                Prepayment Rules
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Modal Dialog */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
